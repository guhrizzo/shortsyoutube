// lib/analyzer.ts — Google Gemini 2.0 Flash Lite
import { TranscriptionResult } from "./transcriber";

export interface Clip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  hook: string;
  why: string;
  viralScore: number;
  platform: ("shorts" | "reels" | "tiktok")[];
  metrics: {
    retention: number;
    engagement: number;
    trendAlignment: number;
    shareability: number;
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function analyzeClips(
  transcription: TranscriptionResult,
  videoId: string
): Promise<Clip[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no .env.local");

  const totalDuration = transcription.duration;

  const segmentsText = transcription.segments
    .map((s) => `[${formatTime(s.start)} - ${formatTime(s.end)}] ${s.text}`)
    .join("\n");

  const prompt = `Você é um especialista em criação de conteúdo viral para redes sociais (YouTube Shorts, Instagram Reels, TikTok).

Analise a transcrição abaixo e identifique os 3 a 5 melhores trechos para cortes virais.

DURAÇÃO TOTAL DO VÍDEO: ${formatTime(totalDuration)} (${Math.floor(totalDuration)} segundos)

TRANSCRIÇÃO COM TIMESTAMPS:
${segmentsText}

REGRAS OBRIGATÓRIAS:
- startTime e endTime DEVEM ser números entre 0 e ${Math.floor(totalDuration)}
- NUNCA use startTime ou endTime maior que ${Math.floor(totalDuration)}
- Duração ideal de cada corte: 30 a 90 segundos
- Hook forte nos primeiros 3 segundos
- Começa e termina em ponto natural (não corta no meio de frase)
- Funciona SEM contexto do vídeo original

RETORNE EXCLUSIVAMENTE um JSON válido, sem markdown, sem explicações:

{
  "clips": [
    {
      "id": "clip_1",
      "title": "Título curto e chamativo",
      "startTime": 42.5,
      "endTime": 98.0,
      "hook": "Frase exata dos primeiros 5 segundos do trecho",
      "why": "Por que esse trecho é viral em 1-2 frases",
      "viralScore": 87,
      "platform": ["shorts", "reels", "tiktok"],
      "metrics": {
        "retention": 85,
        "engagement": 90,
        "trendAlignment": 78,
        "shareability": 88
      }
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Resposta vazia do Gemini");

  let parsed: { clips: any[] };
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini retornou JSON inválido. Tente novamente.");
  }

  if (!parsed.clips || !Array.isArray(parsed.clips)) {
    throw new Error("Formato de resposta inválido");
  }

  const clips: Clip[] = parsed.clips
    .map((clip: any, index: number) => {
      const startTime = Math.min(Number(clip.startTime) || 0, totalDuration - 10);
      const endTime = Math.min(Number(clip.endTime) || 0, totalDuration);

      // Ignora clips com timestamps inválidos
      if (startTime >= endTime || startTime < 0 || endTime > totalDuration) return null;

      return {
        id: clip.id || `clip_${index + 1}`,
        title: clip.title || `Corte ${index + 1}`,
        startTime,
        endTime,
        duration: endTime - startTime,
        hook: clip.hook || "",
        why: clip.why || "",
        viralScore: Math.min(100, Math.max(0, Number(clip.viralScore) || 0)),
        platform: clip.platform || ["shorts", "reels", "tiktok"],
        metrics: {
          retention: Math.min(100, Math.max(0, clip.metrics?.retention || 70)),
          engagement: Math.min(100, Math.max(0, clip.metrics?.engagement || 70)),
          trendAlignment: Math.min(100, Math.max(0, clip.metrics?.trendAlignment || 70)),
          shareability: Math.min(100, Math.max(0, clip.metrics?.shareability || 70)),
        },
      };
    })
    .filter(Boolean) as Clip[];

  return clips.sort((a, b) => b.viralScore - a.viralScore);
}