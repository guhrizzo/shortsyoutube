// lib/transcriber.ts
export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  duration: number;
  segments: TranscriptionSegment[];
}

export async function transcribeVideo(videoId: string): Promise<TranscriptionResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY não configurada no .env.local");

  const result =
    (await fetchTranscript(videoId, apiKey, "pt")) ??
    (await fetchTranscript(videoId, apiKey, "en"));

  if (!result) {
    throw new Error(
      "Não foi possível obter a transcrição. O vídeo pode não ter legendas automáticas."
    );
  }

  return result;
}

async function fetchTranscript(
  videoId: string,
  apiKey: string,
  lang: string
): Promise<TranscriptionResult | null> {
  const response = await fetch(
    `https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId}&lang=${lang}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
    }
  );

  if (response.status === 404 || response.status === 400) return null;

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`RapidAPI error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Log para debug — remova depois de confirmar o formato
  console.log("[RapidAPI raw]", JSON.stringify(data).slice(0, 500));

  return parseTranscript(data);
}

function parseTranscript(data: any): TranscriptionResult | null {
  // A API pode retornar em vários formatos — normalizamos todos
  let items: any[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (Array.isArray(data?.transcript)) {
    items = data.transcript;
  } else if (Array.isArray(data?.data)) {
    items = data.data;
  } else if (Array.isArray(data?.captions)) {
    items = data.captions;
  } else {
    console.error("[RapidAPI] Formato desconhecido:", JSON.stringify(data).slice(0, 300));
    return null;
  }

  if (items.length === 0) return null;

  const segments: TranscriptionSegment[] = items
    .filter((item) => item != null)
    .map((item, index) => {
      // Normaliza o campo de texto (pode vir como text, caption, content, etc.)
      const rawText =
        item?.text ?? item?.caption ?? item?.content ?? item?.line ?? "";

      // Normaliza tempo de início
      const start = Number(item?.start ?? item?.startTime ?? item?.offset ?? 0);

      // Normaliza duração
      const dur = Number(item?.duration ?? item?.dur ?? item?.length ?? 3);

      return {
        id: index,
        start,
        end: start + dur,
        text: String(rawText).trim(),
      };
    })
    .filter((s) => s.text.length > 0);

  if (segments.length === 0) return null;

  const duration = segments[segments.length - 1].end;
  const text = segments.map((s) => s.text).join(" ");

  return { text, duration, segments };
}

export { transcribeVideo as transcribeAudio };