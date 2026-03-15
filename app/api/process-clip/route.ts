// app/api/process-clip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import path from "path";
import os from "os";
import fs from "fs";

const execFileAsync = promisify(execFile);
export const maxDuration = 120;

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar vídeo: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

export async function POST(req: NextRequest) {
  const tmpFiles: string[] = [];

  function cleanup() {
    tmpFiles.forEach((f) => {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
    });
  }

  try {
    const body = await req.json();
    const videoId = body.videoId;
    const startTime = Number(body.startTime) || 0;
    const endTime = Number(body.endTime) || 60;
    const aspectRatio = body.aspectRatio || "9:16";

    console.log(`[process-clip] Recebido: videoId=${videoId} start=${startTime} end=${endTime} ratio=${aspectRatio}`);

    if (!videoId) {
      return NextResponse.json({ error: "videoId obrigatório" }, { status: 400 });
    }

    const duration = endTime - startTime;
    if (duration <= 0 || duration > 300) {
      return NextResponse.json({ error: `Duração inválida: ${duration}s (máx 5 min)` }, { status: 400 });
    }

    const tmpDir = os.tmpdir();
    const id = randomUUID();
    const inputPath = path.join(tmpDir, `${id}-input.mp4`);
    const outputPath = path.join(tmpDir, `${id}-output.mp4`);
    tmpFiles.push(inputPath, outputPath);

    // ── 1. Busca URL de download via YT-API ───────────────────
    console.log(`[process-clip] Buscando URL via YT-API...`);

    const ytApiRes = await fetch(
      `https://yt-api.p.rapidapi.com/dl?id=${videoId}&cgeo=BR`,
      {
        headers: {
          "x-rapidapi-host": "yt-api.p.rapidapi.com",
          "x-rapidapi-key": process.env.YTAPI_KEY ?? "",
        },
      }
    );

    if (!ytApiRes.ok) {
      throw new Error(`YT-API erro: ${ytApiRes.status}`);
    }

    const ytData = await ytApiRes.json();

    if (ytData.status !== "OK") {
      throw new Error(`YT-API retornou status: ${ytData.status}`);
    }

    // Pega o melhor formato mp4 com áudio (itag 22 = 720p, itag 18 = 360p)
    const formats: any[] = ytData.formats ?? [];
    const preferred = formats.find((f: any) => f.itag === 22)
      ?? formats.find((f: any) => f.itag === 18)
      ?? formats.find((f: any) => f.mimeType?.includes("video/mp4"))
      ?? formats[0];

    if (!preferred?.url) {
      throw new Error("Nenhum formato de vídeo disponível na YT-API");
    }

    console.log(`[process-clip] Formato selecionado: itag=${preferred.itag} qualidade=${preferred.qualityLabel}`);

    // ── 2. Download do vídeo ──────────────────────────────────
    console.log(`[process-clip] Baixando vídeo...`);
    await downloadFile(preferred.url, inputPath);

    const inputSize = fs.statSync(inputPath).size;
    console.log(`[process-clip] Download OK. Tamanho: ${(inputSize / 1024 / 1024).toFixed(1)}MB`);

    // ── 3. Processa com FFmpeg ────────────────────────────────
    console.log(`[process-clip] Iniciando FFmpeg: ${startTime}s → ${endTime}s em ${aspectRatio}...`);

    const vfFilters: Record<string, string> = {
      "9:16": "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
      "1:1":  "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080:flags=lanczos",
      "16:9": "scale=1920:1080:flags=lanczos,setsar=1",
    };

    const vf = vfFilters[aspectRatio] ?? vfFilters["9:16"];

    try {
      const { stdout, stderr } = await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-ss", String(startTime),
        "-t", String(duration),
        "-vf", vf,
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level", "4.2",
        "-pix_fmt", "yuv420p",
        "-crf", "23",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-movflags", "+faststart",
        "-y",
        outputPath,
      ], { timeout: 120_000 });
      console.log(`[process-clip] FFmpeg stdout: ${stdout}`);
      if (stderr) console.log(`[process-clip] FFmpeg stderr: ${stderr?.slice(0, 500)}`);
    } catch (err: any) {
      console.error(`[process-clip] FFmpeg falhou: ${err.message}`);
      throw new Error(`Falha no processamento: ${err.message}`);
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error("FFmpeg não gerou o arquivo de saída.");
    }

    const fileBuffer = fs.readFileSync(outputPath);
    console.log(`[process-clip] ✅ Concluído! Tamanho output: ${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB`);

    cleanup();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="clipai-${videoId}-${Math.floor(startTime)}s.mp4"`,
        "Content-Length": String(fileBuffer.length),
      },
    });

  } catch (err: any) {
    cleanup();
    console.error("[process-clip] ERRO FINAL:", err.message);
    return NextResponse.json(
      { error: err.message || "Erro ao processar o vídeo" },
      { status: 500 }
    );
  }
}