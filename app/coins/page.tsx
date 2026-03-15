"use client";

// app/coins/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors, ArrowLeft, Sparkles, Zap,
  CheckCircle2, Loader2, CreditCard, QrCode,
  Crown, Flame, Star, ChevronRight, Shield
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const PACKAGES = [
  {
    id: "starter",
    coins: 50,
    price: 9.90,
    label: "Starter",
    icon: Zap,
    color: "from-blue-600 to-blue-800",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    iconColor: "text-blue-400",
    perks: ["50 cortes de vídeo", "Legendas automáticas", "Formato 9:16, 1:1, 16:9"],
    popular: false,
  },
  {
    id: "pro",
    coins: 150,
    price: 24.90,
    label: "Pro",
    icon: Flame,
    color: "from-purple-600 to-pink-600",
    border: "border-purple-500/40",
    bg: "bg-purple-500/5",
    iconColor: "text-purple-400",
    perks: ["150 cortes de vídeo", "Legendas automáticas", "Score viral por corte", "Prioridade no processamento"],
    popular: true,
  },
  {
    id: "ultra",
    coins: 400,
    price: 59.90,
    label: "Ultra",
    icon: Crown,
    color: "from-yellow-500 to-orange-500",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    iconColor: "text-yellow-400",
    perks: ["400 cortes de vídeo", "Legendas automáticas", "Score viral por corte", "Prioridade máxima", "Suporte dedicado"],
    popular: false,
  },
];

type PaymentMethod = "pix" | "card";
type Step = "select" | "payment" | "success";

export default function CoinsPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [selected, setSelected] = useState<string>("pro");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [step, setStep] = useState<Step>("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const pkg = PACKAGES.find((p) => p.id === selected)!;

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  async function handlePurchase() {
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) { setError("Número do cartão inválido."); return; }
      if (!cardName.trim()) { setError("Insira o nome no cartão."); return; }
      if (cardExpiry.length < 5) { setError("Data de validade inválida."); return; }
      if (cardCvc.length < 3) { setError("CVV inválido."); return; }
    }

    try {
      setLoading(true);
      setError("");

      // Aqui você integra com seu gateway (Stripe, Mercado Pago, etc.)
      // Exemplo: await fetch("/api/create-payment", { method: "POST", body: JSON.stringify({ packageId: selected, method }) })
      await new Promise((r) => setTimeout(r, 2000)); // simula processamento

      await refreshProfile();
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/8 rounded-full blur-[128px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => step === "payment" ? setStep("select") : router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {step === "payment" ? "Voltar" : "Dashboard"}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">ClipAI</span>
          </div>

          {/* Coins atuais */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="text-base">🪙</span>
            <span className="text-sm font-bold text-yellow-400">{profile?.coins ?? 0}</span>
          </div>
        </div>

        {/* ── STEP: SELECT ── */}
        {step === "select" && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-yellow-300 font-medium">Recarga de coins</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Escolha seu pacote</h1>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Coins não expiram. Use no seu ritmo para gerar cortes virais.
              </p>
            </div>

            {/* Packages */}
            <div className="grid md:grid-cols-3 gap-4">
              {PACKAGES.map((p) => {
                const Icon = p.icon;
                const isSelected = selected === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`relative flex flex-col p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? `${p.border} ${p.bg} scale-[1.02] shadow-2xl`
                        : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
                    }`}
                  >
                    {/* Popular badge */}
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold text-white shadow-lg shadow-purple-600/30 whitespace-nowrap">
                        ⚡ Mais popular
                      </div>
                    )}

                    {/* Icon + label */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-gray-300 mb-1">{p.label}</p>

                    {/* Coins + price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{p.coins}</span>
                        <span className="text-base text-yellow-400 font-medium">🪙</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        R$ {(p.price / p.coins).toFixed(2).replace(".", ",")} por coin
                      </p>
                    </div>

                    {/* Perks */}
                    <ul className="space-y-2 flex-1">
                      {p.perks.map((perk, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${p.iconColor}`} />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setStep("payment")}
                className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-purple-600/25"
              >
                <Sparkles className="w-5 h-5" />
                Comprar {pkg.coins} coins por R$ {pkg.price.toFixed(2).replace(".", ",")}
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-3.5 h-3.5" />
                Pagamento 100% seguro · Coins não expiram
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: PAYMENT ── */}
        {step === "payment" && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">Finalizar compra</h2>
              <p className="text-gray-400 text-sm">
                {pkg.coins} coins · R$ {pkg.price.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Resumo */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${pkg.border} ${pkg.bg}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center shrink-0`}>
                <pkg.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Pacote {pkg.label}</p>
                <p className="text-xs text-gray-400">{pkg.coins} coins · sem expiração</p>
              </div>
              <p className="text-lg font-bold text-white">R$ {pkg.price.toFixed(2).replace(".", ",")}</p>
            </div>

            {/* Método de pagamento */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Método de pagamento</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("pix")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    method === "pix"
                      ? "border-green-500/40 bg-green-500/10 text-green-300"
                      : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  PIX
                </button>
                <button
                  onClick={() => setMethod("card")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    method === "card"
                      ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                      : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Cartão
                </button>
              </div>
            </div>

            {/* PIX */}
            {method === "pix" && (
              <div className="space-y-4 p-5 bg-green-500/5 border border-green-500/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Pague com PIX</p>
                    <p className="text-xs text-gray-400">Aprovação em segundos · sem taxas</p>
                  </div>
                </div>
                <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center">
                  <div className="w-24 h-24 bg-[repeating-linear-gradient(45deg,#000_0px,#000_3px,transparent_3px,transparent_6px)] rounded" />
                </div>
                <p className="text-center text-xs text-gray-500">QR Code gerado após confirmar o pagamento</p>
              </div>
            )}

            {/* Cartão */}
            {method === "card" && (
              <div className="space-y-3">
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Número do cartão"
                    value={cardNumber}
                    onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setError(""); }}
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nome no cartão"
                  value={cardName}
                  onChange={(e) => { setCardName(e.target.value.toUpperCase()); setError(""); }}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => { setCardExpiry(formatExpiry(e.target.value)); setError(""); }}
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardCvc}
                    onChange={(e) => { setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Confirmar */}
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
              ) : (
                <>{method === "pix" ? <QrCode className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  Pagar R$ {pkg.price.toFixed(2).replace(".", ",")}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5" />
              Pagamento criptografado e seguro
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === "success" && (
          <div className="max-w-md mx-auto text-center space-y-8 py-12">
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🪙</div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Pagamento confirmado!</h2>
              <p className="text-gray-400">
                <span className="text-yellow-400 font-bold">{pkg.coins} coins</span> foram adicionados à sua conta
              </p>
            </div>

            <div className="p-5 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl flex items-center justify-center gap-4">
              <span className="text-4xl">🪙</span>
              <div className="text-left">
                <p className="text-xs text-gray-500">Saldo atual</p>
                <p className="text-3xl font-bold text-yellow-400">{(profile?.coins ?? 0) + pkg.coins}</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold text-base hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl mx-auto cursor-pointer"
            >
              <Scissors className="w-5 h-5" />
              Criar cortes virais agora
            </button>
          </div>
        )}
      </div>
    </main>
  );
}