"use client";

import { useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPreviewProps {
  videoId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  aspectRatio: "9:16" | "1:1" | "16:9";
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export function VideoPreview({
  videoId,
  currentTime,
  duration,
  isPlaying,
  aspectRatio,
  onPlayPause,
  onSeek,
}: VideoPreviewProps) {

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Atualiza tempo do vídeo
  useEffect(() => {
    if (!iframeRef.current) return;

    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [currentTime, true],
      }),
      "*"
    );
  }, [currentTime]);

  // Play / Pause
  useEffect(() => {
    if (!iframeRef.current) return;

    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: isPlaying ? "playVideo" : "pauseVideo",
      }),
      "*"
    );
  }, [isPlaying]);

  function getAspectClass() {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16]";
      case "1:1":
        return "aspect-square";
      case "16:9":
        return "aspect-video";
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

      {/* PLAYER */}
      <div
        className={`relative overflow-hidden rounded-xl ${getAspectClass()}`}
      >

        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          allow="autoplay; encrypted-media"
        />

        {/* OVERLAY CONTROLS */}
        <button
          onClick={onPlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition"
        >
          {isPlaying ? (
            <Pause className="w-14 h-14 text-white" />
          ) : (
            <Play className="w-14 h-14 text-white" />
          )}
        </button>
      </div>

      {/* TIME INFO */}
      <div className="flex justify-between text-xs text-gray-400 mt-3">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}