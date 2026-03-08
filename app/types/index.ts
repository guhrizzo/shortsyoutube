export interface VideoAnalysis {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  viralScore: number;
  hooks: Hook[];
  segments: Segment[];
}

export interface Hook {
  id: string;
  startTime: number;
  endTime: number;
  timestamp: number;
  text: string;
  confidence: number;
  type: "curiosity" | "controversy" | "story" | "value" | "emotion";
  tags: string[];
}

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  transcript: string;
  engagementScore: number;
}

export interface ExportSettings {
  platform: "youtube_shorts" | "tiktok" | "instagram_reels" | "instagram_feed" | "twitter";
  quality: "1080p" | "4k";
  aspectRatio: "9:16" | "1:1" | "16:9";
  autoCaptions: boolean;
  dynamicZoom: boolean;
  removeSilence: boolean;
  addBackgroundMusic: boolean;
}

export interface ProcessingStatus {
  status: "idle" | "analyzing" | "processing" | "completed" | "error";
  progress: number;
  message: string;
  downloadUrl?: string;
}