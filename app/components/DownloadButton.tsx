"use client";

// app/components/DownloadButton.tsx
import { useState } from "react";
import { Download, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Clip } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

const COIN_COST = 0; // custo em coins por download

interface DownloadButtonProps {
  clip: Clip;
  videoId: string;
  variant?: "full" | "icon"; // full = botão completo, icon = só ícone
}

type Status = "idle" | "loading" | "success" | "error";

export function DownloadButton({ clip, videoId, variant = "full" }: DownloadButtonProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [quality, setQuality] = useState("");

  async function handleDownload() {
    if (!user) {
      setError("Faça login para baixar.");
      setStatus("error");
      return;
    }

    if ((profile?.coins ?? 0) < COIN_COST) {
      setError(`Coins insuficientes. Você precisa de ${COIN_COST} coins.`);
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setError("");

      // Busca o link de download
      const res = await fetch("/api/download-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          startTime: clip.startTime,
          endTime: clip.endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Debita coins do usuário
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { coins: increment(-COIN_COST) });
      await refreshProfile();

      setDownloadUrl(data.downloadUrl);
      setQuality(data.quality);
      setStatus("success");

      // Abre o download automaticamente
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = data.filename;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();

    } catch (err: any) {
      setError(err.message || "Erro ao baixar. Tente novamente.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setError("");
    setDownloadUrl("");
  }

  // ── Variant: icon ─────────────────────────────────────────────
  if (variant === "icon") {
    return (
      <button
        onClick={status === "idle" || status === "error" ? handleDownload : undefined}
        disabled={status === "loading"}
        title={`Baixar corte (${COIN_COST} coins)`}
        className="p-2 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 rounded-lg transition-all group"
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : status === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <Download className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
        )}
      </button>
    );
  }

  // ── Variant: full ─────────────────────────────────────────────
  return (
    <div className="space-y-2">

      {/* Custo em coins */}
      {status === "idle" && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Download do corte completo</span>
          <div className="flex items-center gap-1 text-yellow-400">
            <span>🪙</span>
            <span className="font-semibold">{COIN_COST} coins</span>
          </div>
        </div>
      )}

      {/* Erro */}
      {status === "error" && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={reset} className="underline hover:no-underline">Tentar novamente</button>
        </div>
      )}

      {/* Sucesso */}
      {status === "success" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Download iniciado! ({quality})</span>
          </div>
          <div className="flex gap-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir link
            </a>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition"
            >
              Baixar novamente
            </button>
          </div>
        </div>
      )}

      {/* Botão principal */}
      {(status === "idle" || status === "loading") && (
        <button
          onClick={handleDownload}
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando link...</>
          ) : (
            <><Download className="w-4 h-4" /> Baixar Corte</>
          )}
        </button>
      )}

      {/* Saldo atual */}
      {status === "idle" && (
        <p className="text-center text-xs text-gray-600">
          Saldo: <span className="text-yellow-400 font-medium">🪙 {profile?.coins ?? 0} coins</span>
        </p>
      )}
    </div>
  );
}