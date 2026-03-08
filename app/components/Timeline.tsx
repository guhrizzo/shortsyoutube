"use client";

import { useState, useRef, useEffect } from "react";
import { Scissors, Zap, Flame, BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn, formatTime } from "@/app/lib/utils";
import { Slider } from "../components/ui/slider";

interface TimelineProps {
  duration: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  onRangeChange: (start: number, end: number) => void;
  onSeek: (time: number) => void;
}

export function Timeline({
  duration,
  startTime,
  endTime,
  currentTime,
  onRangeChange,
  onSeek,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"start" | "end" | "move" | null>(null);

  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;
  const currentPercent = (currentTime / duration) * 100;
  const selectionWidth = endPercent - startPercent;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percent / 100) * duration;
    onSeek(time);
  };

  const setPreset = (type: "hook" | "viral" | "story") => {
    const presets = {
      hook: { start: currentTime, end: Math.min(currentTime + 3, duration) },
      viral: { start: currentTime, end: Math.min(currentTime + 30, duration) },
      story: { start: currentTime, end: Math.min(currentTime + 60, duration) },
    };
    onRangeChange(presets[type].start, presets[type].end);
  };

  // Generate waveform bars
  const waveformBars = Array.from({ length: 50 }, (_, i) => ({
    height: Math.random() * 60 + 20,
    key: i,
  }));

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Scissors className="w-4 h-4 text-secondary" />
          Timeline
        </h3>
        <span className="text-xs text-gray-400">
          Duração selecionada:{" "}
          <span className="text-white font-mono font-bold">
            {formatTime(endTime - startTime)}
          </span>
        </span>
      </div>

      <div
        ref={timelineRef}
        className="relative h-24 bg-black/40 rounded-xl overflow-hidden cursor-pointer select-none"
        onClick={handleTimelineClick}
      >
        {/* Waveform */}
        <div className="absolute inset-0 flex items-center gap-px opacity-30 px-2">
          {waveformBars.map((bar) => (
            <div
              key={bar.key}
              className="flex-1 bg-white rounded-full transition-all duration-300"
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>

        {/* Time markers */}
        <div className="absolute bottom-0 left-0 right-0 h-6 flex justify-between px-2 text-[10px] text-gray-500 font-mono border-t border-white/10 items-center">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>{formatTime((duration / 5) * i)}</span>
          ))}
        </div>

        {/* Selection Range */}
        <div
          className="absolute top-0 bottom-6 bg-linear-to-r from-primary/30 to-secondary/30 border-x-2 border-primary cursor-move"
          style={{ left: `${startPercent}%`, width: `${selectionWidth}%` }}
        >
          {/* Start handle */}
          <div
            className="absolute -top-1 left-0 w-3 h-3 bg-primary rounded-full cursor-ew-resize transform -translate-x-1/2 hover:scale-125 transition shadow-lg"
            onMouseDown={() => setIsDragging("start")}
          />
          {/* End handle */}
          <div
            className="absolute -top-1 right-0 w-3 h-3 bg-primary rounded-full cursor-ew-resize transform translate-x-1/2 hover:scale-125 transition shadow-lg"
            onMouseDown={() => setIsDragging("end")}
          />
          {/* Time label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 px-2 py-1 rounded text-xs font-mono whitespace-nowrap pointer-events-none">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none z-10"
          style={{ left: `${currentPercent}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-white rounded-full shadow-lg" />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreset("hook")}
          className="flex-1 text-xs"
        >
          <Zap className="w-3 h-3 mr-1 text-yellow-500" />
          Auto Hook (3s)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreset("viral")}
          className="flex-1 text-xs"
        >
          <Flame className="w-3 h-3 mr-1 text-orange-500" />
          Viral Cut (30s)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreset("story")}
          className="flex-1 text-xs"
        >
          <BookOpen className="w-3 h-3 mr-1 text-blue-500" />
          Story (60s)
        </Button>
      </div>

      {/* Fine-tune Slider */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Ajuste fino</span>
        </div>
        <Slider
          defaultValue={[startTime, endTime]}
          max={duration}
          step={0.1}
          onValueChange={([start, end]) => onRangeChange(start, end)}
        />
      </div>
    </div>
  );
}