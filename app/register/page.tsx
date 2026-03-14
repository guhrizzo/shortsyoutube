"use client";

// app/register/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors, Mail, Lock, Eye, EyeOff,
  Loader2, ArrowLeft, Sparkles, User, CheckCircle2
} from "lucide-react";
import {
  signInWithGoogle,
  signUpWithEmail,
} from "@/app/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/app/context/AuthContext";

const perks = [
  "10 coins grátis ao criar sua conta",
  "Análise de vídeos com IA em segundos",
  "Cortes otimizados para Shorts, Reels e TikTok",
  "Score de viralização por corte",
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [user, loading, router]);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Muito fraca", "Fraca", "Razoável", "Boa", "Forte"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][passwordStrength];

  async function handleGoogle() {
    try {
      setIsLoading(true);
      setError("");
      await signInWithGoogle();
      router.push("/");
    } catch {
      setError("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister() {
    if (!name.trim()) { setError("Insira seu nome."); return; }
    if (!email) { setError("Insira seu email."); return; }
    if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }

    try {
      setIsLoading(true);
      setError("");
      const userCredential = await signUpWithEmail(email, password);
      await updateProfile(userCredential, { displayName: name.trim() });
      router.push("/");
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "Este email já está cadastrado.",
        "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
        "auth/invalid-email": "Email inválido.",
      };
      setError(messages[err.code] || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#030305] text-white flex overflow-hidden">

      {/* ── LEFT: Branding ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#7c3aed25,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#db277720,transparent_55%)]" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-pink-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ClipAI</span>
        </div>

        {/* Content */}
        <div className="relative space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs text-pink-300 font-medium">Comece gratuitamente</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Crie sua conta e
              <span className="block bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                ganhe 10 coins grátis
              </span>
              agora mesmo.
            </h1>
            <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
              Sem cartão de crédito. Cancele quando quiser. Comece a criar conteúdo viral em minutos.
            </p>
          </div>

          {/* Perks */}
          <ul className="space-y-3">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300">{perk}</span>
              </li>
            ))}
          </ul>

          {/* Coins card */}
          <div className="bg-linear-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="text-4xl">🪙</div>
            <div>
              <p className="font-bold text-white">10 coins de boas-vindas</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Use para baixar clipes, adicionar legendas e muito mais.
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-gray-600">
          © {new Date().getFullYear()} ClipAI. Todos os direitos reservados.
        </p>
      </div>

      {/* ── RIGHT: Form ────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 relative">

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-8 left-6 lg:left-16 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">ClipAI</span>
        </div>

        <div className="max-w-sm w-full mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Criar conta</h2>
            <p className="text-gray-400 text-sm">
              Já tem conta?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
              >
                Entrar
              </button>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 mb-6 disabled:opacity-50 shadow-lg shadow-black/20 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600 font-medium">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">

            {/* Name */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 pl-11 pr-11 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength ? strengthColor : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Força da senha:{" "}
                    <span className={`font-medium ${
                      passwordStrength <= 2 ? "text-red-400" :
                      passwordStrength === 3 ? "text-yellow-400" : "text-green-400"
                    }`}>
                      {strengthLabel}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className={`w-full bg-white/5 border rounded-xl py-3.5 pl-11 pr-11 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-500/50 focus:border-red-500/60"
                    : confirmPassword && confirmPassword === password
                    ? "border-green-500/50 focus:border-green-500/60"
                    : "border-white/10 focus:border-purple-500/60"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {confirmPassword && confirmPassword === password && (
                <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-3.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-600/25 mb-6 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Criar conta grátis
              </>
            )}
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-200">
            Ao criar uma conta você concorda com nossos{" "}
            <a href="#" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">Termos</a>{" "}
            e{" "}
            <a href="#" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">Privacidade</a>.
          </p>
        </div>
      </div>
    </main>
  );
}