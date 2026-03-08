"use client";

import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { VideoInput } from "./components/VideoInput";
import { VideoEditor } from "./components/VideoEditor";
import { VideoAnalysis, ProcessingStatus } from "./types";
import { Zap, Crop, Type } from "lucide-react";

// Mock data para demonstração
{/*
  const mockAnalysis: VideoAnalysis = {
  id: "demo-123",
  title: "Como Criar Conteúdo Viral em 2024",
  duration: 300,
  thumbnail: "https://i.ytimg.com/vi/demo/maxresdefault.jpg",
  viralScore: 87,
  hooks: [
    {
      id: "1",
      startTime: 23,
      endTime: 45,
      text: "Você não vai acreditar no que aconteceu quando testei essa estratégia...",
      confidence: 98,
      type: "curiosity",
      tags: ["🔥 Curiosidade", "⚡ Alto impacto"],
    },
    {
      id: "2",
      startTime: 72,
      endTime: 94,
      text: "O erro que custou R$ 1 milhão e como evitá-lo",
      confidence: 85,
      type: "controversy",
      tags: ["💰 Dinheiro", "❌ Erro"],
    },
    {
      id: "3",
      startTime: 165,
      endTime: 185,
      text: "3 segredos que ninguém te conta sobre o algoritmo",
      confidence: 72,
      type: "value",
      tags: ["🎓 Educação", "🔒 Segredo"],
    },
  ],
  segments: [],
};

  */}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setVideoUrl(url);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setAnalysis(analysis);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Transforme vídeos longos em
            <br />
            <span className="gradient-text">cortes virais</span> em segundos
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Extraia os melhores momentos de qualquer vídeo do YouTube e converta
            em conteúdo otimizado para Shorts, Reels e TikTok.
          </p>
        </div>

        {/* Input Section */}
        <VideoInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Editor Section */}
        {analysis && !isLoading && (
          <div className="mt-12">
            <VideoEditor videoUrl={videoUrl} analysis={analysis} />
          </div>
        )}

        {/* Features Grid */}
        {!analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-white" />}
              title="Detecção de Hooks"
              description="IA analisa o vídeo e identifica automaticamente os melhores momentos com maior potencial de retenção."
              gradient="from-pink-500 to-rose-600"
            />
            <FeatureCard
              icon={<Crop className="w-6 h-6 text-white" />}
              title="Corte Inteligente"
              description="Remove automaticamente pausas, 'hums' e partes sem graça. Mantém apenas o conteúdo engajante."
              gradient="from-violet-500 to-purple-600"
            />
            <FeatureCard
              icon={<Type className="w-6 h-6 text-white" />}
              title="Legendas Automáticas"
              description="Gera legendas animadas e estilizadas automaticamente com 95% de precisão em português."
              gradient="from-blue-500 to-cyan-600"
            />
          </div>
        )}
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 hover:bg-white/5 transition group">
      <div
        className={`w-12 h-12 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}