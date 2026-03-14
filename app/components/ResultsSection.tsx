"use client";

// app/components/ResultsSection.tsx
// Substitui o bloco "RESULTADOS" hardcoded da página principal

import { useState } from "react";
import { Target, Download, Sparkles } from "lucide-react";
import { VideoAnalysis, Clip } from "@/app/types";
import { VideoPreview } from "@/app/components/VideoPreview";
import { ClipCard } from "@/app/components/ClipCard";
import { ViralScore } from "@/app/components/ViralScore";

interface ResultsSectionProps {
  analysis: VideoAnalysis;
  videoId: string;
}

export function ResultsSection({ analysis, videoId }: ResultsSectionProps) {
  const [selectedClip, setSelectedClip] = useState<Clip>(analysis.clips[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  function handleSelectClip(clip: Clip) {
    setSelectedClip(clip);
    setIsPlaying(true); // auto-play ao selecionar
  }

  return (
    <section
      id="results"
      className="relative py-20 bg-linear-to-b from-purple-900/10 via-[#030305] to-[#030305]"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-400">
              {analysis.clips.length} cortes identificados
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Momentos Virais
          </h2>
          <p className="text-gray-400">
            Clique em um corte para pré-visualizar no player
          </p>
        </div>

        {/* Layout principal */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Player + ViralScore */}
          <div className="lg:col-span-2 space-y-6">
            {/* Aspect ratio selector */}
            <div className="flex gap-2">
              {(["9:16", "1:1", "16:9"] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    aspectRatio === ratio
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {ratio}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-500 flex items-center">
                Visualizando:{" "}
                <span className="text-white font-semibold ml-1">
                  {selectedClip.title}
                </span>
              </span>
            </div>

            <VideoPreview
              videoId={videoId}
              currentTime={selectedClip.startTime}
              duration={analysis.duration}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onSeek={() => {}}
              aspectRatio={aspectRatio}
            />

            {/* ViralScore do clip selecionado */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-300">
                  Análise do Corte Selecionado
                </h3>
              </div>
              <ViralScore
                score={selectedClip.viralScore}
                metrics={selectedClip.metrics}
              />
            </div>
          </div>

          {/* Lista de clips */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold flex items-center gap-2 text-white">
                <Target className="w-4 h-4 text-purple-400" />
                Melhores Cortes
              </h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition">
                <Download className="w-3 h-3" />
                Exportar todos
              </button>
            </div>

            <div className="space-y-4 max-h-175 overflow-y-auto pr-1 custom-scrollbar">
              {analysis.clips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  videoId={videoId}
                  isActive={selectedClip.id === clip.id}
                  onSelect={handleSelectClip}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}