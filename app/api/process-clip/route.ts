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

interface YtFormat {
  itag: number;
  url: string;
  mimeType?: string;
  qualityLabel?: string;
}

interface YtApiResponse {
  status: string;
  formats?: YtFormat[];
}

const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar vídeo: ${res.status}`);

  // 🔴 FIX: verificar tamanho antes de baixar
  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_VIDEO_BYTES) {
    throw new Error("Vídeo muito grande (máx 500MB)");
  }

  // 🟡 FIX: stream para disco em vez de carregar tudo na memória
  if (!res.body) throw new Error("Resposta sem body");
  const reader = res.body.getReader();
  const stream = fs.createWriteStream(destPath);
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_VIDEO_BYTES) {
      stream.destroy();
      throw new Error("Vídeo muito grande (máx 500MB)");
    }
    stream.write(value);
  }

  await new Promise<void>((resolve, reject) => {
    stream.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

export async function POST(req: NextRequest) {
  const tmpFiles: string[] = [];

  function cleanup() {
    tmpFiles.forEach((f) => {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      } catch {}
    });
  }

  try {
    const body = await req.json();

    // 🔴 FIX: validar videoId com regex — IDs do YouTube têm sempre 11 chars
    const videoId = (body.videoId as string)?.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
    if (!videoId) {
      return NextResponse.json({ error: "videoId inválido" }, { status: 400 });
    }

    const startTime = Number(body.startTime) || 0;
    const endTime = Number(body.endTime) || 60;
    const aspectRatio = (body.aspectRatio as string) || "9:16";

    console.log(`[process-clip] Recebido: videoId=${videoId} start=${startTime} end=${endTime} ratio=${aspectRatio}`);

    const duration = endTime - startTime;
    if (duration <= 0 || duration > 300) {
      return NextResponse.json(
        { error: `Duração inválida: ${duration}s (máx 5 min)` },
        { status: 400 }
      );
    }

    const tmpDir = os.tmpdir();
    const id = randomUUID();
    const inputPath = path.join(tmpDir, `${id}-input.mp4`);
    const outputPath = path.join(tmpDir, `${id}-output.mp4`);
    tmpFiles.push(inputPath, outputPath);

    // ── 1. Busca URL de download via YT-API ──────────────────
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

    // 🟡 FIX: tipagem correta em vez de any
    const ytData = (await ytApiRes.json()) as YtApiResponse;

    if (ytData.status !== "OK") {
      throw new Error(`YT-API retornou status: ${ytData.status}`);
    }

    const formats: YtFormat[] = ytData.formats ?? [];
    const preferred =
      formats.find((f) => f.itag === 22) ??
      formats.find((f) => f.itag === 18) ??
      formats.find((f) => f.mimeType?.includes("video/mp4")) ??
      formats[0];

    if (!preferred?.url) {
      throw new Error("Nenhum formato de vídeo disponível na YT-API");
    }

    console.log(
      `[process-clip] Formato selecionado: itag=${preferred.itag} qualidade=${preferred.qualityLabel}`
    );

    // ── 2. Download do vídeo ──────────────────────────────────
    console.log(`[process-clip] Baixando vídeo...`);
    await downloadFile(preferred.url, inputPath);

    const inputSize = fs.statSync(inputPath).size;
    console.log(
      `[process-clip] Download OK. Tamanho: ${(inputSize / 1024 / 1024).toFixed(1)}MB`
    );

    // ── 3. Processa com FFmpeg ────────────────────────────────
    console.log(
      `[process-clip] Iniciando FFmpeg: ${startTime}s → ${endTime}s em ${aspectRatio}...`
    );

    const vfFilters: Record<string, string> = {
      "9:16": "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
      "1:1": "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080:flags=lanczos",
      "16:9": "scale=1920:1080:flags=lanczos,setsar=1",
    };

    const vf = vfFilters[aspectRatio] ?? vfFilters["9:16"];

    try {
      // 🔴 FIX: -ss antes do -i para seek rápido (não decodifica o vídeo inteiro)
      const { stdout, stderr } = await execFileAsync(
        "ffmpeg",
        [
          "-ss", String(startTime),  // seek rápido — antes do -i
          "-i", inputPath,
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
        ],
        { timeout: 120_000 }
      );
      console.log(`[process-clip] FFmpeg stdout: ${stdout}`);
      if (stderr) console.log(`[process-clip] FFmpeg stderr: ${stderr?.slice(0, 500)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[process-clip] FFmpeg falhou: ${msg}`);
      throw new Error(`Falha no processamento: ${msg}`);
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error("FFmpeg não gerou o arquivo de saída.");
    }

    // 🟡 FIX: stream do arquivo de saída em vez de readFileSync (evita alocar tudo na memória)
    const stat = fs.statSync(outputPath);
    console.log(
      `[process-clip] Concluído! Tamanho output: ${(stat.size / 1024 / 1024).toFixed(1)}MB`
    );

    const nodeStream = fs.createReadStream(outputPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) =>
          controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
        );
        nodeStream.on("end", () => {
          cleanup();
          controller.close();
        });
        nodeStream.on("error", (err) => {
          cleanup();
          controller.error(err);
        });
      },
      cancel() {
        nodeStream.destroy();
        cleanup();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="clipai-${videoId}-${Math.floor(startTime)}s.mp4"`,
        "Content-Length": String(stat.size),
      },
    });
  } catch (err: unknown) {
    cleanup();
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[process-clip] ERRO FINAL:", msg);
    return NextResponse.json(
      { error: msg || "Erro ao processar o vídeo" },
      { status: 500 }
    );
  }
}