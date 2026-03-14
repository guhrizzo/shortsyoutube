"use client";

// app/components/CaptionEditor.tsx
// Burn-in captions via Canvas + MediaRecorder
// Estilo: 2-3 palavras por vez, palavra atual destacada em amarelo (karaokê)

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Download, Loader2, Type,
  ChevronDown, CheckCircle2, AlertCircle
} from "lucide-react";
import { TranscriptionSegment } from "@/app/lib/transcriber";

interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

interface CaptionChunk {
  words: CaptionWord[];
  start: number;
  end: number;
}

interface CaptionEditorProps {
  videoId: string;
  startTime: number;
  endTime: number;
  segments: TranscriptionSegment[];
}

// ── Configurações visuais das legendas ──────────────────────────
const CAPTION_CONFIG = {
  fontSize: 52,
  fontFamily: "Arial Black, sans-serif",
  normalColor: "#FFFFFF",
  highlightColor: "#FFE500",
  strokeColor: "#000000",
  strokeWidth: 6,
  bgColor: "rgba(0,0,0,0.35)",
  bgPadding: 14,
  bgRadius: 10,
  bottomOffset: 120, // px do fundo
  wordsPerChunk: 3,
};

// ── Converte segmentos em words com timestamps ───────────────────
function buildCaptionWords(
  segments: TranscriptionSegment[],
  startTime: number,
  endTime: number
): CaptionWord[] {
  const filtered = segments.filter(
    (s) => s.end > startTime && s.start < endTime
  );

  const words: CaptionWord[] = [];

  filtered.forEach((seg) => {
    const rawWords = seg.text.trim().split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) return;

    const segDuration = seg.end - seg.start;
    const wordDuration = segDuration / rawWords.length;

    rawWords.forEach((word, i) => {
      const wordStart = seg.start + i * wordDuration;
      const wordEnd = wordStart + wordDuration;
      if (wordEnd > startTime && wordStart < endTime) {
        words.push({
          word,
          start: Math.max(wordStart, startTime),
          end: Math.min(wordEnd, endTime),
        });
      }
    });
  });

  return words;
}

// ── Agrupa words em chunks de N palavras ────────────────────────
function buildChunks(words: CaptionWord[], n: number): CaptionChunk[] {
  const chunks: CaptionChunk[] = [];
  for (let i = 0; i < words.length; i += n) {
    const slice = words.slice(i, i + n);
    chunks.push({
      words: slice,
      start: slice[0].start,
      end: slice[slice.length - 1].end,
    });
  }
  return chunks;
}

// ── Desenha legenda no canvas ────────────────────────────────────
function drawCaption(
  ctx: CanvasRenderingContext2D,
  chunk: CaptionChunk,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const cfg = CAPTION_CONFIG;
  ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
  ctx.textBaseline = "middle";

  // Calcula largura total do chunk
  const wordWidths = chunk.words.map((w) => ctx.measureText(w.word + " ").width);
  const totalWidth = wordWidths.reduce((a, b) => a + b, 0) - ctx.measureText(" ").width / 2;

  const y = canvasHeight - cfg.bottomOffset;
  let x = (canvasWidth - totalWidth) / 2;

  // Background
  ctx.fillStyle = cfg.bgColor;
  const bgX = x - cfg.bgPadding;
  const bgY = y - cfg.fontSize / 2 - cfg.bgPadding;
  const bgW = totalWidth + cfg.bgPadding * 2;
  const bgH = cfg.fontSize + cfg.bgPadding * 2;
  ctx.beginPath();
  ctx.roundRect(bgX, bgY, bgW, bgH, cfg.bgRadius);
  ctx.fill();

  // Palavras
  chunk.words.forEach((w, i) => {
    const isActive = currentTime >= w.start && currentTime < w.end;
    const color = isActive ? cfg.highlightColor : cfg.normalColor;

    // Stroke (contorno)
    ctx.strokeStyle = cfg.strokeColor;
    ctx.lineWidth = cfg.strokeWidth;
    ctx.lineJoin = "round";
    ctx.strokeText(w.word, x, y);

    // Fill
    ctx.fillStyle = color;
    ctx.fillText(w.word, x, y);

    x += wordWidths[i];
  });
}

// ── Componente principal ─────────────────────────────────────────
export function CaptionEditor({
  videoId,
  startTime,
  endTime,
  segments,
}: CaptionEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState("");
  const [previewReady, setPreviewReady] = useState(false);

  const duration = endTime - startTime;
  const words = buildCaptionWords(segments, startTime, endTime);
  const chunks = buildChunks(words, CAPTION_CONFIG.wordsPerChunk);

  // Chunk ativo no tempo atual
  const activeChunk = chunks.find(
    (c) => currentTime >= c.start && currentTime < c.end
  ) ?? null;

  // ── Preview loop ─────────────────────────────────────────────
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const t = video.currentTime;
    setCurrentTime(t);

    const chunk = chunks.find((c) => t >= c.start && t < c.end) ?? null;
    if (chunk) drawCaption(ctx, chunk, t, canvas.width, canvas.height);

    if (!video.paused && !video.ended) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    } else if (video.ended) {
      setIsPlaying(false);
    }
  }, [chunks]);

  // Setup video element (usa proxy do YouTube não é possível — usamos o iframe embed)
  // Para o preview, desenhamos apenas as legendas sobre o player do YouTube
  // Para o export, usamos a abordagem de captura de canvas com legenda animada

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Export: gera vídeo com legendas ──────────────────────────
  async function handleExport() {
    if (!canvasRef.current) return;

    try {
      setExporting(true);
      setExportProgress(0);
      setExportError("");
      setExportDone(false);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;

      // Configuração
      const FPS = 30;
      const totalFrames = Math.ceil(duration * FPS);
      const W = canvas.width;
      const H = canvas.height;

      // Cria stream do canvas
      const stream = canvas.captureStream(FPS);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000, // 4 Mbps
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.start(100);

      // Renderiza frame a frame
      for (let frame = 0; frame < totalFrames; frame++) {
        const t = startTime + (frame / FPS);

        // Fundo preto (sem acesso direto ao vídeo do YouTube)
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);

        // Placeholder de frame (em produção, use FFmpeg server-side para o vídeo real)
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#333";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`youtu.be/${videoId}`, W / 2, H / 2 - 16);
        ctx.fillText(`⏱ ${formatTime(t)}`, W / 2, H / 2 + 20);
        ctx.textAlign = "left";

        // Legenda
        const chunk = chunks_ref.find((c) => t >= c.start && t < c.end) ?? null;
        if (chunk) drawCaption(ctx, chunk, t, W, H);

        setExportProgress(Math.round((frame / totalFrames) * 100));

        // Yield para não travar a UI
        await new Promise((r) => setTimeout(r, 1000 / FPS));
      }

      recorder.stop();

      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      // Download
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clipai-${videoId}-${Math.floor(startTime)}s.webm`;
      a.click();
      URL.revokeObjectURL(url);

      setExportDone(true);
    } catch (err: any) {
      setExportError(err.message || "Erro ao exportar.");
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  }

  // Ref para chunks acessível dentro do loop de export
  const chunks_ref = chunks;

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // ── Preview das legendas (overlay sobre o player) ─────────────
  const previewChunk = chunks.find(
    (c) => currentTime >= c.start && currentTime < c.end
  ) ?? null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold text-sm text-white">Legendas Burn-in</h3>
          <span className="text-xs text-gray-500">
            {chunks.length} chunks · {words.length} palavras
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
          <span>✨</span> Karaokê
        </div>
      </div>

      {/* Preview das legendas */}
      <div className="p-5 space-y-5">

        {/* Player com overlay de legendas */}
        <div className="relative bg-black rounded-xl overflow-hidden aspect-9/16 max-w-xs mx-auto">
          {/* YouTube embed */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&controls=1&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
          />

          {/* Legenda overlay — preview visual */}
          <div className="absolute bottom-24 left-0 right-0 px-4 pointer-events-none">
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
              {previewChunk ? (
                previewChunk.words.map((w, i) => (
                  <span
                    key={i}
                    className={`text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-colors duration-100 ${
                      currentTime >= w.start && currentTime < w.end
                        ? "text-yellow-400"
                        : "text-white"
                    }`}
                    style={{
                      textShadow: "0 0 8px rgba(0,0,0,0.8), 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                      fontFamily: "Arial Black, sans-serif",
                    }}
                  >
                    {w.word}
                  </span>
                ))
              ) : (
                // Mostra próximo chunk como preview estático
                chunks[0]?.words.map((w, i) => (
                  <span
                    key={i}
                    className="text-2xl font-black text-white/60 drop-shadow-lg"
                    style={{ fontFamily: "Arial Black, sans-serif" }}
                  >
                    {w.word}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline de chunks */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Preview dos chunks
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {chunks.slice(0, 20).map((chunk, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  currentTime >= chunk.start && currentTime < chunk.end
                    ? "bg-yellow-500/15 border border-yellow-500/30"
                    : "bg-white/3 border border-transparent"
                }`}
              >
                <span className="text-xs text-gray-600 font-mono w-12 shrink-0">
                  {formatTime(chunk.start)}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {chunk.words.map((w, j) => (
                    <span
                      key={j}
                      className={
                        currentTime >= w.start && currentTime < w.end
                          ? "text-yellow-400 font-bold"
                          : "text-gray-300"
                      }
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {chunks.length > 20 && (
              <p className="text-xs text-gray-600 text-center py-2">
                +{chunks.length - 20} chunks...
              </p>
            )}
          </div>
        </div>

        {/* Canvas oculto para export */}
        <canvas
          ref={canvasRef}
          width={1080}
          height={1920}
          className="hidden"
        />

        {/* Export */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300 leading-relaxed">
              O export gera um arquivo <strong>.webm</strong> com as legendas animadas.
              Para burn-in no vídeo real do YouTube, use FFmpeg no servidor (próximo passo).
            </p>
          </div>

          {exporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Renderizando frames...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-purple-600 to-pink-600 transition-all duration-300 rounded-full"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {exportDone && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4" />
              Download iniciado!
            </div>
          )}

          {exportError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4" />
              {exportError}
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={exporting || words.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
          >
            {exporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Exportando {exportProgress}%</>
            ) : (
              <><Download className="w-4 h-4" /> Exportar com Legendas</>
            )}
          </button>

          {words.length === 0 && (
            <p className="text-xs text-gray-500 text-center">
              Este corte não tem transcrição disponível para gerar legendas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}