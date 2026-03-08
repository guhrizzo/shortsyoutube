"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { VideoPreview } from "./VideoPreview";
import { Timeline } from "./Timeline";
import { ViralScore } from "./ViralScore";
import { HookSuggestions } from "./HookSuggestions";
import { ExportSettings } from "./ExportSettings";
import { VideoAnalysis, ExportSettings as ExportSettingsType, ProcessingStatus } from "@/app/types";
import { extractYouTubeId, calculateViralScore } from "@/app/lib/utils";

interface VideoEditorProps {
  videoUrl: string;
  analysis: VideoAnalysis;
}

export function VideoEditor({ videoUrl, analysis }: VideoEditorProps) {
  const videoId = extractYouTubeId(videoUrl) || "";

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(30, analysis.duration));
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const [exportSettings, setExportSettings] = useState<ExportSettingsType>({
    platform: "youtube_shorts",
    quality: "1080p",
    aspectRatio: "9:16",
    autoCaptions: true,
    dynamicZoom: true,
    removeSilence: true,
    addBackgroundMusic: false,
  });

  // Update aspect ratio when platform changes
  useEffect(() => {
    setAspectRatio(exportSettings.aspectRatio);
  }, [exportSettings.aspectRatio]);

  const handleRangeChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
    setCurrentTime(start);
  };

  const handleSelectHook = (hook: typeof analysis.hooks[0]) => {
    setSelectedHookId(hook.id);
    setStartTime(hook.startTime);
    setEndTime(hook.endTime);
    setCurrentTime(hook.startTime);
  };

  const handleExport = async () => {
    setProcessingStatus({
      status: "processing",
      progress: 0,
      message: "Iniciando processamento...",
    });

    // Simulate processing steps
    const steps = [
      { progress: 20, message: "Extraindo segmento do vídeo..." },
      { progress: 40, message: "Aplicando formato vertical..." },
      { progress: 60, message: "Gerando legendas automáticas..." },
      { progress: 80, message: "Aplicando otimizações virais..." },
      { progress: 100, message: "Finalizando..." },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStatus({
        status: "processing",
        progress: step.progress,
        message: step.message,
      });
    }

    setProcessingStatus({
      status: "completed",
      progress: 100,
      message: "Corte gerado com sucesso!",
      downloadUrl: "#", // In real app, this would be the actual download URL
    });
  };

  const selectedDuration = endTime - startTime;
    const viralScore = calculateViralScore(selectedDuration, analysis.hooks);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Preview & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPreview
            videoId={videoId}
            currentTime={currentTime}
            duration={analysis.duration}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={setCurrentTime}
            aspectRatio={aspectRatio}
          />

          <Timeline
            duration={analysis.duration}
            startTime={startTime}
            endTime={endTime}
            currentTime={currentTime}
            onRangeChange={handleRangeChange}
            onSeek={setCurrentTime}
          />
        </div>

        {/* Right Column - Settings & Export */}
        <div className="space-y-4">
          <ViralScore
            score={viralScore}
            metrics={{
              retention: Math.min(viralScore + 5, 98),
              engagement: Math.min(viralScore - 3, 95),
              trendAlignment: Math.min(viralScore + 2, 92),
              shareability: Math.min(viralScore - 5, 88),
            }}
          />

          <HookSuggestions
            hooks={analysis.hooks}
            selectedHookId={selectedHookId}
            onSelectHook={handleSelectHook}
          />

          <ExportSettings
            settings={exportSettings}
            onSettingsChange={setExportSettings}
          />

          <Button
            onClick={handleExport}
            disabled={processingStatus.status === "processing"}
            variant="gradient"
            className="w-full py-6 text-lg font-bold neon-glow"
          >
            {processingStatus.status === "processing" ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {processingStatus.message}
              </>
            ) : processingStatus.status === "completed" ? (
              <>
                <Download className="w-5 h-5 mr-2" />
                Baixar Corte
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Gerar Corte Viral
              </>
            )}
          </Button>

          {processingStatus.status === "processing" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{processingStatus.message}</span>
                <span>{processingStatus.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${processingStatus.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}