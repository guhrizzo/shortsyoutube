"use client";

import { useEffect, useState } from "react";
import { Scissors, ArrowRight, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#030305] text-white overflow-hidden flex items-center justify-center selection:bg-purple-500/30 selection:text-purple-200">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      <div className={`relative z-10 max-w-2xl mx-auto px-6 text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-16 group">
          <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">ClipAI</span>
        </Link>

        {/* 404 */}
        <div className="relative mb-8">
          <div className="text-[160px] md:text-[200px] font-bold leading-none bg-linear-to-b from-white/10 to-transparent bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-linear-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-600/40">
              <Search className="w-9 h-9 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Página não encontrada
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto leading-relaxed">
          Parece que esse corte não existe. Que tal voltar e criar um viral de verdade?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-2xl shadow-white/10 group"
          >
            <Home className="w-5 h-5" />
            Voltar ao início
          </Link>
          <Link
            href="/#features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
          >
            Ver recursos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

      </div>
    </main>
  );
}