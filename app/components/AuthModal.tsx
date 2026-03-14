"use client";

// app/components/AuthModal.tsx
import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, Loader2, Chrome } from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/app/lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleGoogle() {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth() {
    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/email-already-in-use": "Email já cadastrado.",
        "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
        "auth/invalid-email": "Email inválido.",
      };
      setError(messages[err.code] || "Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === "login"
              ? "Bem-vindo de volta!"
              : "Ganhe 10 coins grátis ao se cadastrar 🎉"}
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email + Senha */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "login" ? (
            "Entrar"
          ) : (
            "Criar conta grátis"
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-purple-400 hover:text-purple-300 font-medium transition"
          >
            {mode === "login" ? "Criar grátis" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}