"use client";

import { TrendingUp, Users, Clock, Sparkles } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface ViralScoreProps {
  score: number;
  metrics: {
    retention: number;
    engagement: number;
    trendAlignment: number;
    shareability: number;
  };
}

export function ViralScore({ score, metrics }: ViralScoreProps) {
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-400";
    if (s >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreText = (s: number) => {
    if (s >= 90) return "Viral Potencial!";
    if (s >= 80) return "Muito Bom";
    if (s >= 60) return "Bom";
    return "Precisa Melhorar";
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 text-center uppercase tracking-wider">
        Potencial Viral
      </h3>

      <div className="relative w-32 h-32 mx-auto mb-4">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff006e" />
              <stop offset="100%" stopColor="#8338ec" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-black", getScoreColor(score))}>
            {score}
          </span>
          <span className="text-[10px] text-gray-500 uppercase">de 100</span>
        </div>
      </div>

      <p className={cn("text-center font-medium mb-4", getScoreColor(score))}>
        {getScoreText(score)}
      </p>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricBar
          icon={<Clock className="w-4 h-4" />}
          label="Retenção"
          value={metrics.retention}
          color="bg-primary"
        />
        <MetricBar
          icon={<Users className="w-4 h-4" />}
          label="Engajamento"
          value={metrics.engagement}
          color="bg-secondary"
        />
        <MetricBar
          icon={<TrendingUp className="w-4 h-4" />}
          label="Tendências"
          value={metrics.trendAlignment}
          color="bg-accent"
        />
        <MetricBar
          icon={<Sparkles className="w-4 h-4" />}
          label="Compartilhamento"
          value={metrics.shareability}
          color="bg-pink-500"
        />
      </div>
    </div>
  );
}

function MetricBar({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-2 text-gray-400">
          {icon}
          {label}
        </span>
        <span className="text-white font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}