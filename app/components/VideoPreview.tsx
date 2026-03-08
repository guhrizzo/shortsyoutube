"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn, formatTime } from "@/app/lib/utils";

interface VideoPreviewProps {
  videoId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  aspectRatio: "9:16" | "1:1" | "16:9";
}

export function VideoPreview({
  videoId,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  aspectRatio,
}: VideoPreviewProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const aspectRatioClass = {
    "9:16": "aspect-[9/16] max-w-sm",
    "1:1": "aspect-square max-w-md",
    "16:9": "aspect-video max-w-2xl",
  }[aspectRatio];

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Preview do Corte
        </h3>
        <div className="flex gap-2">
          {(["9:16", "1:1", "16:9"] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onSeek(0)} // Reset ao mudar formato
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium border transition",
                aspectRatio === ratio
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
              )}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "relative bg-black rounded-xl overflow-hidden mx-auto group",
          aspectRatioClass
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* YouTube Embed */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(currentTime)}&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Overlay Controls */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Play/Pause Center Button */}
          <button
            onClick={onPlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition group-hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white fill-current" />
            ) : (
              <Play className="w-8 h-8 text-white fill-current ml-1" />
            )}
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/80 hover:text-white transition"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="flex-1">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <span className="text-xs text-white/80 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <button className="text-white/80 hover:text-white transition">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Crop Overlay Guides */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[60%] border-2 border-dashed border-white/30 rounded-lg">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/50 bg-black/50 px-2 rounded">
              Área de foco
            </div>
          </div>
          {/* Safe zones */}
          <div className="absolute top-4 left-4 right-4 h-8 border border-red-500/30 rounded flex items-center justify-center">
            <span className="text-[10px] text-red-400/50">Evitar (título/corte)</span>
          </div>
          <div className="absolute bottom-16 left-4 right-4 h-12 border border-red-500/30 rounded flex items-center justify-center">
            <span className="text-[10px] text-red-400/50">Evitar (legendas)</span>
          </div>
        </div>
      </div>
    </div>
  );
}