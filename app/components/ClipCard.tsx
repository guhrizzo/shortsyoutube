"use client";

// app/components/ClipCard.tsx
import { useState } from "react";
import {
  Play, Scissors, Copy, Share2, Zap,
  ChevronDown, ChevronUp, Instagram, Youtube,
} from "lucide-react";
import { Clip } from "@/app/types";
import { VideoDownloader } from "./VideoDownloader";

interface ClipCardProps {
  clip: Clip;
  videoId: string;
  isActive: boolean;
  onSelect: (clip: Clip) => void;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  shorts: <Youtube className="w-3 h-3" />,
  reels: <Instagram className="w-3 h-3" />,
  tiktok: <span className="text-[10px] font-bold">TT</span>,
};

const PLATFORM_COLORS: Record<string, string> = {
  shorts: "bg-red-500/20 text-red-400 border-red-500/30",
  reels: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  tiktok: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#ffffff10" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="16" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function CopyButton({ videoId, startTime }: { videoId: string; startTime: number }) {
  const [copied, setCopied] = useState(false);
  const link = `https://youtu.be/${videoId}?t=${Math.floor(startTime)}`;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
      title="Copiar link com timestamp"
    >
      <Copy className={`w-4 h-4 ${copied ? "text-green-400" : "text-gray-400"}`} />
    </button>
  );
}

export function ClipCard({ clip, videoId, isActive, onSelect }: ClipCardProps) {
  const [expanded, setExpanded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
        isActive
          ? "border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/10"
          : "border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/[0.07]"
      }`}
      onClick={() => onSelect(clip)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
          <img
            src={thumbnailUrl}
            alt={clip.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-current ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 text-[10px] bg-black/80 px-1 rounded text-white font-mono">
            {formatTime(clip.duration)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-white truncate mb-1">{clip.title}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="font-mono">
              {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {clip.platform.map((p) => (
              <span
                key={p}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${PLATFORM_COLORS[p]}`}
              >
                {PLATFORM_ICONS[p]}
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <ScoreRing score={clip.viralScore} />
      </div>

      {/* Hook */}
      {clip.hook && (
        <div className="mx-4 mb-3 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider">Hook</span>
          </div>
          <p className="text-xs text-gray-300 italic leading-relaxed line-clamp-2">"{clip.hook}"</p>
        </div>
      )}

      {/* Por que viral */}
      {clip.why && (
        <div className="mx-4 mb-3">
          <button
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Por que esse corte é viral?
          </button>
          {expanded && (
            <p className="mt-2 text-xs text-gray-400 leading-relaxed border-l-2 border-purple-500/40 pl-3">
              {clip.why}
            </p>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-px bg-white/5 border-t border-white/5">
        {[
          { label: "Retenção", value: clip.metrics.retention },
          { label: "Engajamento", value: clip.metrics.engagement },
          { label: "Tendência", value: clip.metrics.trendAlignment },
          { label: "Viral", value: clip.metrics.shareability },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#030305] px-3 py-2 text-center">
            <div className="text-sm font-bold text-white">{value}%</div>
            <div className="text-[10px] text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 px-3 pt-3 pb-1">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-semibold transition"
          onClick={(e) => { e.stopPropagation(); onSelect(clip); }}
        >
          <Scissors className="w-3.5 h-3.5" />
          Selecionar
        </button>
        <CopyButton videoId={videoId} startTime={clip.startTime} />
        <a
          href={`https://youtu.be/${videoId}?t=${Math.floor(clip.startTime)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
          title="Abrir no YouTube"
        >
          <Share2 className="w-4 h-4 text-gray-400" />
        </a>
      </div>

      {/* Download com FFmpeg */}
      <VideoDownloader clip={clip} videoId={videoId} />
    </div>
  );
}