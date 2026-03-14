// app/types/index.ts

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface ClipMetrics {
  retention: number;
  engagement: number;
  trendAlignment: number;
  shareability: number;
}

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
  metrics: ClipMetrics;
}

export interface VideoAnalysis {
  videoId: string;
  duration: number;
  clips: Clip[];
  transcription: TranscriptionSegment[];
}