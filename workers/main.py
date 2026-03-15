# worker/main.py
import os
import uuid
import tempfile
import logging
from pathlib import Path

import ffmpeg
import whisper
import yt_dlp
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clipai-worker")

app = FastAPI(title="ClipAI Worker")

# Carrega o modelo Whisper uma vez na inicialização (não a cada request)
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")  # base | small | medium | large
logger.info(f"Carregando modelo Whisper: {WHISPER_MODEL}")
whisper_model = whisper.load_model(WHISPER_MODEL)
logger.info("Whisper pronto.")

ASPECT_FILTERS = {
    "9:16": "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
    "1:1":  "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080:flags=lanczos",
    "16:9": "scale=1920:1080:flags=lanczos,setsar=1",
}

MAX_DURATION = 300  # segundos


class ClipRequest(BaseModel):
    video_id: str
    start_time: float = 0
    end_time: float = 60
    aspect_ratio: str = "9:16"
    transcribe: bool = True  # gerar legendas via Whisper?

    @field_validator("video_id")
    @classmethod
    def validate_video_id(cls, v: str) -> str:
        if not re.fullmatch(r"[a-zA-Z0-9_-]{11}", v):
            raise ValueError("video_id inválido")
        return v

    @field_validator("aspect_ratio")
    @classmethod
    def validate_aspect(cls, v: str) -> str:
        if v not in ASPECT_FILTERS:
            raise ValueError(f"aspect_ratio deve ser um de: {list(ASPECT_FILTERS)}")
        return v


class ClipResponse(BaseModel):
    clip_url: str           # URL para baixar o vídeo cortado
    transcript: list[dict]  # [{start, end, text}, ...]
    duration: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/clip", response_model=ClipResponse)
def process_clip(req: ClipRequest):
    duration = req.end_time - req.start_time
    if duration <= 0 or duration > MAX_DURATION:
        raise HTTPException(400, f"Duração inválida: {duration}s (máx {MAX_DURATION}s)")

    tmp_dir = Path(tempfile.mkdtemp())
    job_id = str(uuid.uuid4())
    raw_path = tmp_dir / f"{job_id}-raw.mp4"
    clip_path = tmp_dir / f"{job_id}-clip.mp4"
    audio_path = tmp_dir / f"{job_id}-audio.wav"

    try:
        # ── 1. Download com yt-dlp ────────────────────────────
        logger.info(f"[{job_id}] Baixando {req.video_id}...")
        ydl_opts = {
            "format": "bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": str(raw_path),
            "quiet": True,
            "no_warnings": True,
            # cookies opcionais — coloque cookies.txt fora do repo e aponte aqui
            # "cookiefile": "/secrets/cookies.txt",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={req.video_id}"])

        logger.info(f"[{job_id}] Download OK ({raw_path.stat().st_size / 1024 / 1024:.1f}MB)")

        # ── 2. Corte + crop com ffmpeg-python ─────────────────
        logger.info(f"[{job_id}] Cortando {req.start_time}s → {req.end_time}s ({req.aspect_ratio})...")
        vf = ASPECT_FILTERS[req.aspect_ratio]

        (
            ffmpeg
            .input(str(raw_path), ss=req.start_time, t=duration)
            .output(
                str(clip_path),
                vf=vf,
                vcodec="libx264",
                profile_v="high",
                level="4.2",
                pix_fmt="yuv420p",
                crf=23,
                preset="fast",
                acodec="aac",
                audio_bitrate="128k",
                ar=44100,
                movflags="+faststart",
            )
            .overwrite_output()
            .run(quiet=True)
        )
        logger.info(f"[{job_id}] Corte OK ({clip_path.stat().st_size / 1024 / 1024:.1f}MB)")

        # ── 3. Transcrição com Whisper ─────────────────────────
        segments: list[dict] = []
        if req.transcribe:
            logger.info(f"[{job_id}] Extraindo áudio para Whisper...")

            # Extrai áudio mono 16kHz (formato ideal para Whisper)
            (
                ffmpeg
                .input(str(clip_path))
                .output(str(audio_path), ac=1, ar=16000, format="wav")
                .overwrite_output()
                .run(quiet=True)
            )

            logger.info(f"[{job_id}] Transcrevendo com Whisper ({WHISPER_MODEL})...")
            result = whisper_model.transcribe(
                str(audio_path),
                language="pt",       # força português; use None para autodetect
                word_timestamps=True,
            )

            # Normaliza segmentos para o formato que o front espera
            segments = [
                {
                    "start": round(seg["start"], 2),
                    "end":   round(seg["end"], 2),
                    "text":  seg["text"].strip(),
                }
                for seg in result["segments"]
            ]
            logger.info(f"[{job_id}] Whisper OK — {len(segments)} segmentos")

        # ── 4. Retorna o arquivo ───────────────────────────────
        # O Next.js vai fazer GET /clip/{job_id} para baixar
        # Em produção, suba o clip_path para S3/R2 e retorne a URL assinada
        clip_url = f"/clip-file/{job_id}"

        # Guarda o path para servir depois (em memória — ok para MVP)
        _clip_registry[job_id] = str(clip_path)

        return ClipResponse(
            clip_url=clip_url,
            transcript=segments,
            duration=round(duration, 2),
        )

    except Exception as e:
        logger.error(f"[{job_id}] ERRO: {e}")
        # Limpa arquivos em caso de erro
        for f in [raw_path, clip_path, audio_path]:
            f.unlink(missing_ok=True)
        raise HTTPException(500, str(e))

    finally:
        # Limpa arquivos intermediários (mantém só o clip final até ser baixado)
        raw_path.unlink(missing_ok=True)
        audio_path.unlink(missing_ok=True)


# Registry simples para MVP — em produção use Redis ou S3
_clip_registry: dict[str, str] = {}


@app.get("/clip-file/{job_id}")
def download_clip(job_id: str):
    # Valida job_id para evitar path traversal
    if not re.fullmatch(r"[a-f0-9-]{36}", job_id):
        raise HTTPException(400, "job_id inválido")

    path = _clip_registry.get(job_id)
    if not path or not Path(path).exists():
        raise HTTPException(404, "Clip não encontrado ou expirado")

    def cleanup_after():
        Path(path).unlink(missing_ok=True)
        _clip_registry.pop(job_id, None)

    # FileResponse envia o arquivo e depois podemos limpar
    # (em produção: upload para S3 e delete local)
    response = FileResponse(
        path,
        media_type="video/mp4",
        filename=f"clipai-{job_id[:8]}.mp4",
        background=None,
    )
    # Limpa após envio (workaround simples para MVP)
    import threading
    threading.Timer(30, cleanup_after).start()

    return response