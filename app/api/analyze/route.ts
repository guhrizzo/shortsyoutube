import { NextRequest, NextResponse } from "next/server";
import { VideoAnalysis } from "@/app/types";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL é obrigatória" },
        { status: 400 }
      );
    }

    const analysis: VideoAnalysis = {
      id: "analysis-" + Date.now(),
      title: "Vídeo Analisado",
      duration: 600,
      thumbnail: "",
      viralScore: 0,
      // ✅ obrigatório

      hooks: [
        {
          id: "1",
          startTime: 10,
          endTime: 35,
          timestamp: 10, // ✅ obrigatório
          text: "Hook detectado pelo algoritmo de IA",
          confidence: 95,
          type: "curiosity",
          tags: ["Curiosidade", "Viral"],
        },
      ],

      segments: [],
    };

    return NextResponse.json(analysis);

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao analisar vídeo" },
      { status: 500 }
    );
  }
}