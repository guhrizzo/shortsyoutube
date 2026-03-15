# worker/main.py
import os
import uuid
import tempfile
import logging
import re
import threading
from pathlib import Path

import ffmpeg
import yt_dlp
from faster_whisper import WhisperModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clipai-worker")

app = FastAPI(title="ClipAI Worker")

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
logger.info(f"Carregando modelo Whisper: {WHISPER_MODEL_SIZE}")
whisper_model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")
logger.info("Whisper pronto.")

ASPECT_FILTERS = {
    "9:16": "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
    "1:1":  "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080:flags=lanczos",
    "16:9": "scale=1920:1080:flags=lanczos,setsar=1",
}

MAX_DURATION = 300


class ClipRequest(BaseModel):
    video_id: str
    start_time: float = 0
    end_time: float = 60
    aspect_ratio: str = "9:16"
    transcribe: bool = True

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
    clip_url: str
    transcript: list[dict]
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
            "format": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best",
            "merge_output_format": "mp4",
            "outtmpl": str(raw_path),
            "quiet": True,
            "no_warnings": True,
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

        # ── 3. Transcrição com faster-whisper ─────────────────
        segments: list[dict] = []
        if req.transcribe:
            logger.info(f"[{job_id}] Extraindo áudio para Whisper...")
            (
                ffmpeg
                .input(str(clip_path))
                .output(str(audio_path), ac=1, ar=16000, format="wav")
                .overwrite_output()
                .run(quiet=True)
            )

            logger.info(f"[{job_id}] Transcrevendo ({WHISPER_MODEL_SIZE})...")
            result, _ = whisper_model.transcribe(
                str(audio_path),
                language="pt",
                word_timestamps=True,
            )

            segments = [
                {
                    "start": round(seg.start, 2),
                    "end":   round(seg.end, 2),
                    "text":  seg.text.strip(),
                }
                for seg in result
            ]
            logger.info(f"[{job_id}] Whisper OK — {len(segments)} segmentos")

        clip_url = f"/clip-file/{job_id}"
        _clip_registry[job_id] = str(clip_path)

        return ClipResponse(
            clip_url=clip_url,
            transcript=segments,
            duration=round(duration, 2),
        )

    except Exception as e:
        logger.error(f"[{job_id}] ERRO: {e}")
        for f in [raw_path, clip_path, audio_path]:
            f.unlink(missing_ok=True)
        raise HTTPException(500, str(e))

    finally:
        raw_path.unlink(missing_ok=True)
        audio_path.unlink(missing_ok=True)


_clip_registry: dict[str, str] = {}


@app.get("/clip-file/{job_id}")
def download_clip(job_id: str):
    if not re.fullmatch(r"[a-f0-9-]{36}", job_id):
        raise HTTPException(400, "job_id inválido")

    path = _clip_registry.get(job_id)
    if not path or not Path(path).exists():
        raise HTTPException(404, "Clip não encontrado ou expirado")

    def cleanup_after():
        Path(path).unlink(missing_ok=True)
        _clip_registry.pop(job_id, None)

    threading.Timer(30, cleanup_after).start()

    return FileResponse(
        path,
        media_type="video/mp4",
        filename=f"clipai-{job_id[:8]}.mp4",
    )