"use client";

import { useState } from "react";
import { Link, Wand2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn, extractYouTubeId } from "@/app/lib/utils";

interface VideoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function VideoInput({ onSubmit, isLoading }: VideoInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Por favor, insira um link do YouTube");
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setError("Link do YouTube inválido. Use youtube.com ou youtu.be");
      return;
    }

    onSubmit(url);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Cole o link do YouTube aqui..."
            className={cn(
              "w-full bg-black/30 border rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none transition",
              error ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-primary"
            )}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          variant="gradient"
          className="px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Analisar Vídeo
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
        <span>Funciona com:</span>
        <span className="px-2 py-1 rounded bg-white/5">youtube.com/watch</span>
        <span className="px-2 py-1 rounded bg-white/5">youtu.be</span>
        <span className="px-2 py-1 rounded bg-white/5">youtube.com/shorts</span>
      </div>
    </div>
  );
}