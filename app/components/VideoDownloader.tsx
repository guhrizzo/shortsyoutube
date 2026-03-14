"use client";

// app/components/VideoDownloader.tsx
import { useState } from "react";
import { Download, Loader2, CheckCircle2, AlertCircle, Film, Maximize2 } from "lucide-react";
import { Clip } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

const COIN_COST = 0;

interface VideoDownloaderProps {
  clip: Clip;
  videoId: string;
}

type Stage = "idle" | "processing" | "done" | "error";

export function VideoDownloader({ clip, videoId }: VideoDownloaderProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [selectedRatio, setSelectedRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  async function handleProcess() {
    if (!user) { setError("Faça login para baixar."); setStage("error"); return; }
    if ((profile?.coins ?? 0) < COIN_COST) {
      setError(`Você precisa de ${COIN_COST} coins para baixar.`);
      setStage("error");
      return;
    }

    const startTime = Number(clip.startTime);
    const endTime = Number(clip.endTime);

    if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
      setError("Timestamps inválidos neste corte. Tente outro.");
      setStage("error");
      return;
    }

    try {
      setStage("processing");
      setProgress(10);
      setError("");

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 2, 85));
      }, 2000);

      const res = await fetch("/api/process-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          startTime,
          endTime,
          aspectRatio: selectedRatio,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const text = await res.text();
        console.log("[debug] Resposta erro:", text);
        // Tenta fazer parse como JSON, senão usa o texto direto
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || text);
        } catch {
          throw new Error(text || `Erro HTTP ${res.status}`);
        }
      }

      setProgress(90);
      const blob = await res.blob();

      if (blob.size === 0) throw new Error("Arquivo gerado está vazio. Tente novamente.");

      const url = URL.createObjectURL(blob);

      // Debita coins
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { coins: increment(-COIN_COST) });
      await refreshProfile();

      setDownloadUrl(url);
      setStage("done");
      setProgress(100);

      // Download automático
      const a = document.createElement("a");
      a.href = url;
      a.download = `clipai-${videoId}-${Math.floor(startTime)}s.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err: any) {
      console.error("Process error:", err);
      setError(err.message || "Erro ao processar o vídeo.");
      setStage("error");
    }
  }

  function reset() {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setStage("idle");
    setError("");
    setDownloadUrl("");
    setProgress(0);
  }

  return (
    <div className="space-y-3 p-3 border-t border-white/5">

      {/* Seletor de proporção */}
      {stage === "idle" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              Proporção
            </span>
            <div className="flex items-center gap-1 text-yellow-400">
              🪙 <span className="font-semibold">{COIN_COST} coins</span>
            </div>
          </div>
          <div className="flex gap-2">
            {(["9:16", "1:1", "16:9"] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={(e) => { e.stopPropagation(); setSelectedRatio(ratio); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedRatio === ratio
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {stage === "processing" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processando no servidor...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-600 text-center">
            ✂️ Cortando {Math.floor(clip.startTime)}s → {Math.floor(clip.endTime)}s em {selectedRatio}
          </p>
        </div>
      )}

      {/* Erro */}
      {stage === "error" && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="break-all">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="mt-1 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Sucesso */}
      {stage === "done" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Download iniciado! ({selectedRatio})</span>
          </div>
          <div className="flex gap-2">
            <a
              href={downloadUrl}
              download={`clipai-${videoId}-${Math.floor(clip.startTime)}s.mp4`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition"
            >
              <Download className="w-3 h-3" />
              Baixar novamente
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="flex-1 flex items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition"
            >
              Novo corte
            </button>
          </div>
        </div>
      )}

      {/* Botão principal */}
      {stage === "idle" && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handleProcess(); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-600/20"
          >
            <Film className="w-4 h-4" />
            Baixar Corte ({selectedRatio})
          </button>
          <p className="text-center text-xs text-gray-600">
            Saldo: <span className="text-yellow-400">🪙 {profile?.coins ?? 0} coins</span>
          </p>
        </>
      )}
    </div>
  );
}