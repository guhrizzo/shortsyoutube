// app/api/download-clip/route.ts
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { videoId, startTime, endTime } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: "videoId obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RAPIDAPI_KEY não configurada" }, { status: 500 });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log("[download] Buscando:", videoUrl);

    const response = await fetch(
      `https://youtube-mp4-downloader.p.rapidapi.com/mp4?url=${encodeURIComponent(videoUrl)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "youtube-mp4-downloader.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`RapidAPI error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log("[download] Response:", JSON.stringify(data).slice(0, 300));

    // Normaliza diferentes formatos de resposta
    let downloadUrl = "";
    let quality = "auto";

    if (typeof data === "string" && data.startsWith("http")) {
      downloadUrl = data;
    } else if (data?.download) {
      // Campo específico dessa API
      downloadUrl = data.download;
      quality = data.type ?? "mp4";
    } else if (data?.url) {
      downloadUrl = data.url;
      quality = data.quality ?? data.resolution ?? "auto";
    } else if (data?.downloadUrl) {
      downloadUrl = data.downloadUrl;
      quality = data.quality ?? "auto";
    } else if (data?.link) {
      downloadUrl = data.link;
    } else if (Array.isArray(data) && data.length > 0) {
      // Array de formatos — pega melhor qualidade
      const preferred = ["720", "480", "360"];
      for (const q of preferred) {
        const fmt = data.find((f: any) =>
          String(f.quality ?? f.label ?? "").includes(q)
        );
        if (fmt) {
          downloadUrl = fmt.url ?? fmt.downloadUrl ?? fmt.link;
          quality = q + "p";
          break;
        }
      }
      if (!downloadUrl) {
        downloadUrl = data[0]?.url ?? data[0]?.downloadUrl ?? data[0]?.link;
      }
    }

    if (!downloadUrl) {
      console.error("[download] Formato desconhecido:", JSON.stringify(data));
      throw new Error("Não foi possível obter o link de download. Formato de resposta inesperado.");
    }

    return NextResponse.json({
      downloadUrl,
      quality,
      videoId,
      startTime,
      endTime,
      filename: `clipai-${videoId}-${Math.floor(startTime)}s-${Math.floor(endTime)}s.mp4`,
    });

  } catch (err: any) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao gerar link de download" },
      { status: 500 }
    );
  }
}