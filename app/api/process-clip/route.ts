// app/api/process-clip/route.ts
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

interface WorkerClipResponse {
  clip_url: string;
  transcript: { start: number; end: number; text: string }[];
  duration: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Valida videoId — IDs do YouTube têm sempre 11 chars
    const videoId = (body.videoId as string)?.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
    if (!videoId) {
      return NextResponse.json({ error: "videoId inválido" }, { status: 400 });
    }

    const startTime = Number(body.startTime) || 0;
    const endTime = Number(body.endTime) || 60;
    const aspectRatio = (body.aspectRatio as string) || "9:16";
    const transcribe = body.transcribe !== false; // default true

    const duration = endTime - startTime;
    if (duration <= 0 || duration > 300) {
      return NextResponse.json(
        { error: `Duração inválida: ${duration}s (máx 5 min)` },
        { status: 400 }
      );
    }

    const workerUrl = process.env.WORKER_URL;
    if (!workerUrl) {
      return NextResponse.json(
        { error: "WORKER_URL não configurada" },
        { status: 500 }
      );
    }

    // ── Chama o worker Python ─────────────────────────────────
    console.log(`[process-clip] Enviando job para worker: ${videoId} ${startTime}→${endTime}`);

    const workerRes = await fetch(`${workerUrl}/clip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: videoId,
        start_time: startTime,
        end_time: endTime,
        aspect_ratio: aspectRatio,
        transcribe,
      }),
      signal: AbortSignal.timeout(115_000), // um pouco abaixo do maxDuration
    });

    if (!workerRes.ok) {
      const err = await workerRes.json().catch(() => ({ detail: "Erro desconhecido" }));
      throw new Error(err.detail ?? `Worker retornou ${workerRes.status}`);
    }

    const data = (await workerRes.json()) as WorkerClipResponse;
    console.log(`[process-clip] Worker OK — ${data.transcript.length} segmentos de legenda`);

    // ── Busca o arquivo do worker e faz proxy para o cliente ──
    const fileRes = await fetch(`${workerUrl}${data.clip_url}`);
    if (!fileRes.ok) throw new Error("Falha ao buscar o clip do worker");

    const filename = `clipai-${videoId}-${Math.floor(startTime)}s.mp4`;

    // Retorna o vídeo + legenda nos headers (JSON encodado)
    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Legenda disponível para o front via header customizado
        "X-Transcript": encodeURIComponent(JSON.stringify(data.transcript)),
        "X-Duration": String(data.duration),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[process-clip] ERRO FINAL:", msg);
    return NextResponse.json(
      { error: msg || "Erro ao processar o vídeo" },
      { status: 500 }
    );
  }
}