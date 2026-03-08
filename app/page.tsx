"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Youtube,
  Loader2,
  Scissors,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  Star,
  Users,
  Video,
  Wand2,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Copy,
  Download,
  Share2,
  ChevronDown,
  MousePointer2,
  Brain,
  Layers,
  Target,
  Rocket,
  Instagram,
  Twitter,
  Linkedin,
  Menu,
  X
} from "lucide-react";

import { VideoAnalysis } from "@/app/types";
import { VideoPreview } from "@/app/components/VideoPreview";

function extractYouTubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;

  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

// Hook para animação de entrada
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  const inputRef = useRef<HTMLInputElement>(null);

  const videoId = extractYouTubeId(url) || "";

  // Efeito de scroll para navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleAnalyze() {
    if (!url) {
      setError("Insira uma URL válida do YouTube");
      return;
    }

    if (!videoId) {
      setError("URL do YouTube inválida");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAnalysis(data);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAnalyze();
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#030305] text-white overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-purple-900/5 rounded-full blur-[100px]" />
      </div>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all border-b border-white/15 duration-500 ${
        isScrolled 
          ? "bg-[#030305]/90   backdrop-blur-xl  shadow-2xl shadow-purple-900/10" 
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/25 group-hover:shadow-purple-600/40 transition-all duration-300 group-hover:scale-105">
              <Scissors className="w-5 h-5 text-white transform group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              ClipAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("features")} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer relative group">
              Recursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer relative group">
              Como Funciona
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full  transition-all duration-300" />
            </button>
            <button onClick={() => scrollToSection("pricing")} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer relative group">
              Preços
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
              Entrar
            </button>
            <button className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-white/10 cursor-pointer">
              Começar Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#030305]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <button onClick={() => scrollToSection("features")} className="text-left text-gray-300 hover:text-white py-2">Recursos</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-left text-gray-300 hover:text-white py-2">Como Funciona</button>
            <button onClick={() => scrollToSection("pricing")} className="text-left text-gray-300 hover:text-white py-2">Preços</button>
            <hr className="border-white/10" />
            <button className="w-full py-3 bg-white text-black rounded-xl font-semibold">Começar Grátis</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8 hover:bg-purple-500/20 transition-all duration-300 cursor-pointer group">
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm font-medium text-purple-300">
              Powered by GPT-4 Vision
            </span>
            <ArrowRight className="w-3 h-3 text-purple-400 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
            Transforme vídeos em
            <span className="block mt-2 bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
              cortes virais
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Nossa IA analisa vídeos do YouTube e encontra automaticamente 
            os melhores momentos para Shorts, Reels e TikTok em segundos.
          </p>

          {/* INPUT */}
          <div className="max-w-3xl mx-auto relative">
            
            <div className="relative flex flex-col md:flex-row gap-3 bg-[#0a0a0f]/90 backdrop-blur border border-white/10 p-2 rounded-2xl shadow-2xl shadow-purple-900/20 hover:border-purple-500/30 transition-all duration-300">
              
              <div className="flex items-center flex-1 px-4 py-2">
                <div className="relative">
                  <Youtube className="w-6 h-6 text-red-500 mr-3 relative z-10" />
                  <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                </div>
                
                <input
                  ref={inputRef}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Cole o link do YouTube aqui..."
                  className="bg-transparent outline-none w-full text-white placeholder-gray-500 text-lg"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="relative overflow-hidden bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 px-8 py-4 rounded-xl font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/25 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Gerar Cortes</span>
                  </>
                )}
              </button>

            </div>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-4 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Gratuito para testar
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Sem cartão de crédito
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Cancelamento fácil
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "50K+", label: "Vídeos Processados" },
              { value: "2M+", label: "Cortes Gerados" },
              { value: "98%", label: "Satisfação" },
              { value: "10x", label: "Mais Rápido" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      {analysis && (
        <section
          id="results"
          className="relative py-20 bg-linear-to-b from-purple-900/10 via-[#030305] to-[#030305]"
        >
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-400">Análise Completa</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Momentos Identificados
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Selecione os melhores cortes para criar conteúdo viral em minutos
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Video Preview */}
              <div className="lg:col-span-2">
                <VideoPreview
                  videoId={videoId}
                  currentTime={currentTime}
                  duration={analysis.duration}
                  isPlaying={isPlaying}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onSeek={setCurrentTime}
                  aspectRatio={aspectRatio}
                />
              </div>

              {/* Sidebar com cortes */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Melhores Momentos
                  </h3>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
                        <div className="relative w-20 h-12 bg-gray-800 rounded-lg overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute bottom-1 right-1 text-[10px] bg-black/80 px-1 rounded text-white">
                            0:45
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Hook #{i + 1}</div>
                          <div className="text-xs text-gray-500">Score: 94%</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Scissors className="w-4 h-4 text-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-purple-600/25">
                    <Download className="w-4 h-4" />
                    Exportar Todos
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-white mx-auto mb-2 transition-colors" />
                    <span className="text-xs text-gray-400 group-hover:text-white">Copiar Link</span>
                  </button>
                  <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                    <Share2 className="w-5 h-5 text-gray-400 group-hover:text-white mx-auto mb-2 transition-colors" />
                    <span className="text-xs text-gray-400 group-hover:text-white">Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section id="features" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-900/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
              Recursos Poderosos
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tudo que você precisa para
              <span className="text-purple-400"> viralizar</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tecnologia de ponta para criadores de conteúdo que querem economizar tempo e maximizar alcance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="IA Avançada"
              description="Algoritmos de deep learning identificam automaticamente os momentos mais envolventes do seu vídeo."
              gradient="from-purple-600 to-blue-600"
            />
            <FeatureCard
              icon={Layers}
              title="Múltiplos Formatos"
              description="Exporte para Shorts, Reels, TikTok e Stories com um clique. Suporte a 9:16, 1:1 e 16:9."
              gradient="from-pink-600 to-purple-600"
            />
            <FeatureCard
              icon={Rocket}
              title="Score Viral"
              description="Nossa IA prevê o potencial de viralização de cada corte com base em tendências atuais."
              gradient="from-orange-600 to-pink-600"
            />
          </div>

          {/* Additional Features Grid */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Processamento Rápido", desc: "Análise em segundos" },
              { icon: Target, title: "Precisão 99%", desc: "Cortes perfeitos" },
              { icon: Shield, title: "Seguro", desc: "Seus dados protegidos" },
              { icon: Clock, title: "24/7", desc: "Disponível sempre" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 hover:border-purple-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                  <item.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-[#050508]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Como funciona
            </h2>
            <p className="text-gray-400 text-lg">Três passos simples para criar conteúdo viral</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-linear-to-r from-purple-600/0 via-purple-600/50 to-purple-600/0" />

            {[
              {
                step: "01",
                title: "Cole o Link",
                desc: "Insira a URL de qualquer vídeo do YouTube que você quer transformar em shorts.",
                icon: MousePointer2
              },
              {
                step: "02",
                title: "IA Analisa",
                desc: "Nossa inteligência artificial processa o vídeo e identifica os melhores momentos.",
                icon: Brain
              },
              {
                step: "03",
                title: "Exporte & Publique",
                desc: "Baixe seus cortes otimizados e publique diretamente nas redes sociais.",
                icon: Share2
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-purple-600/30 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 border-y border-white/5 bg-white/1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">Confiado por criadores de conteúdo</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {["YouTube", "TikTok", "Instagram", "Twitch", "Spotify"].map((brand) => (
                <span key={brand} className="text-2xl font-bold text-white/60 hover:text-white transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Pronto para viralizar?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de criadores que estão economizando horas de edição e aumentando seu alcance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => inputRef.current?.focus()}
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-2xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-5 h-5" />
              Experimentar Grátis
            </button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm cursor-pointer flex items-center justify-center gap-2">
              Ver Demonstração
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              14 dias grátis
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Sem compromisso
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#020204] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-2xl">ClipAI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                A maneira mais inteligente de criar conteúdo curto a partir de vídeos longos. Economize tempo, aumente seu alcance.
              </p>
              <div className="flex gap-4">
                {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600 transition-colors duration-300 group">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Produto</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Suporte</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contato</a></li>
                
                
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ClipAI. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Componente de Feature Card melhorado
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div 
      ref={ref}
      className={`group relative p-8 rounded-3xl bg-white/2 border border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
      
      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
        {title}
      </h3>
      
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
      
      <div className="mt-6 flex items-center text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Saiba mais
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

// Componente Feature simples (mantido para compatibilidade)
function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition">
      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">
        {description}
      </p>
    </div>
  );
}