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

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // ── Cookies via env var ───────────────────────────────────
    const cookiesContent = process.env.YOUTUBE_COOKIES;
    let tmpCookiesPath: string | null = null;

    if (cookiesContent) {
      tmpCookiesPath = path.join(tmpDir, `${id}-cookies.txt`);
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(cookiesContent.trim());
      const decoded = isBase64
        ? Buffer.from(cookiesContent.trim(), "base64").toString("utf-8")
        : cookiesContent;
      const normalized = decoded.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      fs.writeFileSync(tmpCookiesPath, normalized);
      tmpFiles.push(tmpCookiesPath);
      console.log(`[process-clip] Cookies carregados via env var (base64: ${isBase64})`);
    } else {
      console.log(`[process-clip] Nenhum cookie encontrado, prosseguindo sem autenticação`);
    }

    // ── PO Token via bgutil ───────────────────────────────────
    const poTokenServer = process.env.YOUTUBE_PO_TOKEN_SERVER;
    let poToken: string | null = null;

    if (poTokenServer) {
      try {
        const testRes = await fetch(`${poTokenServer}/get_pot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        const testData = await testRes.json();
        poToken = testData.poToken ?? null;
        console.log(`[process-clip] bgutil poToken obtido: ${poToken?.slice(0, 20)}...`);
      } catch (e: any) {
        console.log(`[process-clip] bgutil unreachable: ${e.message}`);
      }
    }

    // ── 1. Download com yt-dlp ────────────────────────────────
    const ytdlpArgs = [
      videoUrl,
      "--format", "bestvideo+bestaudio/best",
      "--output", inputPath,
      "--no-playlist",
      "--no-warnings",
      "--merge-output-format", "mp4",
    ];

    if (poToken) {
      ytdlpArgs.push(
        "--extractor-args", `youtube:player_client=web;po_token=web+${poToken}`,
      );
      console.log(`[process-clip] Usando PO Token`);
    } else {
      ytdlpArgs.push("--extractor-args", "youtube:player_client=web");
    }

    if (tmpCookiesPath) {
      ytdlpArgs.push("--cookies", tmpCookiesPath);
    }

    console.log(`[process-clip] Iniciando download de ${videoUrl}...`);

    try {
      const { stdout, stderr } = await execFileAsync("yt-dlp", ytdlpArgs, { timeout: 90_000 });
      console.log(`[process-clip] yt-dlp stdout: ${stdout}`);
      if (stderr) console.log(`[process-clip] yt-dlp stderr: ${stderr}`);
    } catch (err: any) {
      console.error(`[process-clip] yt-dlp falhou: ${err.message}`);
      throw new Error(`Falha no download: ${err.message}`);
    }

    // Verifica se o arquivo foi criado (yt-dlp pode mudar a extensão)
    let actualInput = inputPath;
    if (!fs.existsSync(inputPath)) {
      console.log(`[process-clip] Arquivo não encontrado em ${inputPath}, buscando alternativas...`);
      const extensions = [".mkv", ".webm", ".mp4"];
      const base = inputPath.replace(".mp4", "");
      const found = extensions.map(ext => base + ext).find(f => fs.existsSync(f));
      if (found) {
        actualInput = found;
        tmpFiles.push(found);
        console.log(`[process-clip] Arquivo encontrado em: ${actualInput}`);
      } else {
        const files = fs.readdirSync(tmpDir).filter(f => f.includes(id));
        console.error(`[process-clip] Arquivos com ID ${id}: ${files.join(", ")}`);
        throw new Error("Arquivo de vídeo não encontrado após download.");
      }
    }

    const inputSize = fs.statSync(actualInput).size;
    console.log(`[process-clip] Download OK. Tamanho: ${(inputSize / 1024 / 1024).toFixed(1)}MB`);

    // ── 2. Processa com FFmpeg ────────────────────────────────
    console.log(`[process-clip] Iniciando FFmpeg: ${startTime}s → ${endTime}s em ${aspectRatio}...`);

    const vfFilters: Record<string, string> = {
      "9:16": "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
      "1:1":  "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080:flags=lanczos",
      "16:9": "scale=1920:1080:flags=lanczos,setsar=1",
    };

    const vf = vfFilters[aspectRatio] ?? vfFilters["9:16"];

    try {
      const { stdout, stderr } = await execFileAsync("ffmpeg", [
        "-i", actualInput,
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