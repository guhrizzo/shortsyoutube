"use client";

// app/login/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { signInWithGoogle, signInWithEmail } from "@/app/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [user, loading, router]);

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

  async function handleLogin() {
    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      await signInWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "Email ou senha incorretos.",
        "auth/invalid-email": "Email inválido.",
      };
      setError(messages[err.code] || "Erro ao entrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#030305] text-white flex overflow-hidden">

      {/* ── LEFT: Branding panel ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#7c3aed30,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#4f46e520,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-blue-600/15 rounded-full blur-[80px] animate-pulse delay-1000" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ClipAI</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-purple-300 font-medium">IA Generativa</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              Transforme vídeos em
              <span className="block bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                conteúdo viral
              </span>
              em segundos.
            </h1>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Nossa IA analisa qualquer vídeo do YouTube e encontra os melhores momentos para Shorts, Reels e TikTok automaticamente.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "50K+", label: "Vídeos" },
              { value: "2M+", label: "Cortes" },
              { value: "98%", label: "Satisfação" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-sm text-gray-300 leading-relaxed italic">
              "Economizei 10 horas por semana de edição. O ClipAI encontra os cortes que eu levaria horas pra achar."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                M
              </div>
              <div>
                <div className="text-sm font-medium text-white">Marcos Silva</div>
                <div className="text-xs text-gray-500">500K seguidores • YouTube</div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-gray-600">
          © {new Date().getFullYear()} ClipAI. Todos os direitos reservados.
        </p>
      </div>

      {/* ── RIGHT: Auth form ───────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 relative">

        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-8 left-6 lg:left-16 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-linear-to-br from-purple-500 to-purple-800 rounded-xl flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">ClipAI</span>
        </div>

        <div className="max-w-sm w-full mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-sm">
              Entre para continuar gerando cortes virais
            </p>
          </div>

          {/* Google button */}
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

          {/* Form */}
          <div className="space-y-4 mb-6">
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

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-600/25 mb-6 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            Não tem conta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
            >
              Criar grátis
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}