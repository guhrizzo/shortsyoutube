import { NextRequest, NextResponse } from "next/server"
import { VideoAnalysis } from "@/app/types"

export async function POST(req: NextRequest) {
  try {

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL obrigatória" },
        { status: 400 }
      )
    }

    const analysis: VideoAnalysis = {
      id: "analysis-" + Date.now(),
      title: "Vídeo analisado",
      duration: 600,
      thumbnail: "",
      hooks: [
        {
          id: "1",
          startTime: 8,
          endTime: 32,
          text: "Você sabia que 90% das pessoas fazem isso errado?",
          confidence: 95,
          viralScore: 88
        },
        {
          id: "2",
          startTime: 120,
          endTime: 150,
          text: "Esse foi o maior erro da minha vida",
          confidence: 92,
          viralScore: 91
        }
      ],
      segments: []
    }

    return NextResponse.json(analysis)

  } catch {

    return NextResponse.json(
      { error: "Erro na análise" },
      { status: 500 }
    )

  }
}