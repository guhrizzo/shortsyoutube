// app/api/analyze-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transcribeVideo } from "@/app/lib/transcriber";
import { analyzeClips } from "@/app/lib/analyzer";

export const maxDuration = 60;

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 });
    }

    // ETAPA 1: Busca transcrição via RapidAPI (sem download de áudio)
    console.log("[1/2] Buscando transcrição...");
    const transcription = await transcribeVideo(videoId);

    // ETAPA 2: Análise dos melhores cortes via Claude
    console.log("[2/2] Analisando cortes virais...");
    const clips = await analyzeClips(transcription, videoId);

    return NextResponse.json({
      videoId,
      duration: transcription.duration,
      clips,
      transcription: transcription.segments,
    });

  } catch (err: any) {
    
    console.error("Erro no pipeline:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor" },
      { status: 500 }
    );
    
  }
}