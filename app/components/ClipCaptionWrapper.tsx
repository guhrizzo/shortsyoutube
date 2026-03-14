"use client";

// app/components/ClipCaptionWrapper.tsx
// Wrapper que adiciona o botão de legendas em cada ClipCard

import { useState } from "react";
import { Type, ChevronDown, ChevronUp } from "lucide-react";
import { Clip } from "@/app/types";
import { TranscriptionSegment } from "@/app/lib/transcriber";
import { CaptionEditor } from "./CaptionEditor";

interface ClipCaptionWrapperProps {
  clip: Clip;
  videoId: string;
  segments: TranscriptionSegment[];
  children: React.ReactNode;
}

export function ClipCaptionWrapper({
  clip,
  videoId,
  segments,
  children,
}: ClipCaptionWrapperProps) {
  const [showCaptions, setShowCaptions] = useState(false);

  return (
    <div className="space-y-2">
      {children}

      {/* Botão legendas */}
      <button
        onClick={() => setShowCaptions(!showCaptions)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
          showCaptions
            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Type className="w-4 h-4" />
        {showCaptions ? "Ocultar Legendas" : "Adicionar Legendas"}
        {showCaptions
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />
        }
      </button>

      {/* Editor */}
      {showCaptions && (
        <CaptionEditor
          videoId={videoId}
          startTime={clip.startTime}
          endTime={clip.endTime}
          segments={segments}
        />
      )}
    </div>
  );
}