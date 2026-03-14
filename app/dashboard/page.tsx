"use client";

// app/dashboard/page.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors, Youtube, Wand2, Loader2, Sparkles,
  Clock, Coins, TrendingUp, Play, ChevronRight,
  LayoutDashboard, History, LogOut, Menu, X
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { logOut } from "@/app/lib/firebase";
import { db } from "@/app/lib/firebase";
import {
  collection, query, where, orderBy,
  limit, onSnapshot, addDoc, serverTimestamp
} from "firebase/firestore";
import { VideoAnalysis, Clip } from "@/app/types";
import { ResultsSection } from "@/app/components/ResultsSection";

function extractYouTubeId(url: string) {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
}

function formatDate(ts: any) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface HistoryItem {
  id: string;
  videoId: string;
  url: string;
  title?: string;
  duration: number;
  clipsCount: number;
  createdAt: any;
  clips: Clip[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const inputRef = useRef<HTMLInputElement>(null);

  // Redireciona se não logado
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Carrega histórico em tempo real
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "analyses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistoryItem)));
    });
    return () => unsub();
  }, [user]);

  async function handleAnalyze() {
    if (!url.trim()) { setError("Cole uma URL do YouTube."); return; }
    const videoId = extractYouTubeId(url);
    if (!videoId) { setError("URL inválida. Use youtube.com ou youtu.be"); return; }

    try {
      setAnalyzing(true);
      setError("");
      setAnalysis(null);

      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnalysis(data);

      // Salva no histórico do Firestore
      await addDoc(collection(db, "analyses"), {
        uid: user!.uid,
        videoId: data.videoId,
        url,
        duration: data.duration,
        clipsCount: data.clips.length,
        clips: data.clips,
        createdAt: serverTimestamp(),
      });

      await refreshProfile();

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (err: any) {
      setError(err.message || "Erro ao analisar. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }

  function loadFromHistory(item: HistoryItem) {
    setAnalysis({
      videoId: item.videoId,
      duration: item.duration,
      clips: item.clips,
      transcription: [],
    });
    setUrl(item.url);
    setActiveTab("analyze");
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  if (loading || !user) return null;

  const videoId = extractYouTubeId(url) || "";

  return (
    <div className="min-h-screen bg-[#030305] text-white flex">

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed top-0 left-0 h-full w-64 bg-[#08080f] border-r border-white/8
          flex flex-col z-50 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/25">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ClipAI</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-white/8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Coins */}
            <div className="mt-3 flex items-center justify-between px-3 py-2.5 bg-yellow-500/8 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">🪙</span>
                <div>
                  <p className="text-xs text-gray-400">Seus coins</p>
                  <p className="text-lg font-bold text-yellow-400 leading-none">
                    {profile?.coins ?? 0}
                  </p>
                </div>
              </div>
              <button className="text-xs text-purple-400 hover:text-purple-300 font-medium transition">
                + Comprar
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => { setActiveTab("analyze"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl text-sm font-medium transition-all ${
                activeTab === "analyze"
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Analisar Vídeo
            </button>
            <button
              onClick={() => { setActiveTab("history"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                activeTab === "history"
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <History className="w-4 h-4" />
              Histórico
              {history.length > 0 && (
                <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/8">
            <button
              onClick={async () => { await logOut(); router.push("/"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#030305]/90 backdrop-blur border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-white">
                {activeTab === "analyze" ? "Analisar Vídeo" : "Histórico"}
              </h1>
              <p className="text-xs text-gray-500">
                {activeTab === "analyze"
                  ? "Cole um link do YouTube para gerar cortes virais"
                  : `${history.length} vídeos analisados`}
              </p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">Vídeos</p>
              <p className="text-sm font-bold text-white">{history.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Cortes</p>
              <p className="text-sm font-bold text-white">
                {history.reduce((acc, h) => acc + h.clipsCount, 0)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-bold text-yellow-400">{profile?.coins ?? 0}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">

          {/* ── ABA: ANALISAR ── */}
          {activeTab === "analyze" && (
            <div className="space-y-8">

              {/* Input card */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h2 className="font-semibold text-white">Novo Vídeo</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center flex-1 gap-3 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500/50 transition-colors">
                    <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                    <input
                      ref={inputRef}
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                      placeholder="Cole o link do YouTube aqui..."
                      className="bg-transparent outline-none w-full text-white placeholder-gray-600 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-purple-600/20"
                  >
                    {analyzing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
                    ) : (
                      <><Wand2 className="w-4 h-4" /> Gerar Cortes</>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                {analyzing && (
                  <div className="space-y-2">
                    {["Buscando transcrição...", "Analisando com IA...", "Identificando cortes virais..."].map((step, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin shrink-0"
                          style={{ animationDelay: `${i * 0.2}s` }} />
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resultados */}
              {analysis && (
                <div id="results">
                  <ResultsSection analysis={analysis} videoId={analysis.videoId} />
                </div>
              )}

              {/* Empty state */}
              {!analysis && !analyzing && (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                    <Scissors className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Pronto para criar cortes virais?</p>
                    <p className="text-gray-600 text-sm mt-1">Cole um link do YouTube acima e a IA faz o resto</p>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1 mx-auto"
                    >
                      Ver histórico <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ABA: HISTÓRICO ── */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                    <History className="w-7 h-7 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Nenhum vídeo analisado ainda</p>
                    <p className="text-gray-600 text-sm mt-1">Seus vídeos aparecerão aqui após a análise</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("analyze")}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition"
                  >
                    Analisar primeiro vídeo
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: TrendingUp, label: "Vídeos analisados", value: history.length, color: "text-purple-400" },
                      { icon: Scissors, label: "Cortes gerados", value: history.reduce((a, h) => a + h.clipsCount, 0), color: "text-pink-400" },
                      { icon: Clock, label: "Coins restantes", value: profile?.coins ?? 0, color: "text-yellow-400" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="bg-white/3 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* History list */}
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="group flex items-center gap-4 p-4 bg-white/3 border border-white/8 hover:border-purple-500/30 hover:bg-white/5 rounded-xl cursor-pointer transition-all duration-200"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-800">
                          <img
                            src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                          <div className="absolute bottom-1 right-1 text-[10px] bg-black/80 px-1 rounded text-white font-mono">
                            {formatDuration(item.duration)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            youtu.be/{item.videoId}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                            <span className="text-xs text-purple-400 flex items-center gap-1">
                              <Scissors className="w-3 h-3" />
                              {item.clipsCount} cortes
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}