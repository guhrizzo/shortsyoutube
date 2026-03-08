import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// 1. Defina a interface para o objeto Hook
interface Hook {
  text: string;
  confidence: number;
  timestamp: number;
}

// 2. Agora a função funcionará corretamente
export function calculateViralScore(duration: number, hooks: Hook[]): number {
  let score = 70;
  
  // Duração ideal: 15-30 segundos
  if (duration >= 15 && duration <= 30) score += 15;
  else if (duration >= 10 && duration <= 60) score += 10;
  
  // Pontos por hooks de alta confiança
  const highConfidenceHooks = hooks.filter(h => h.confidence > 85).length;
  score += Math.min(highConfidenceHooks * 3, 15);
  
  return Math.min(score, 100);
}