"use client";

// app/components/UserMenu.tsx
import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { logOut } from "@/app/lib/firebase";

export function UserMenu() {
  const { user, profile, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 text-sm text-gray-300 hover:text-white transition cursor-pointer"
        >
          Entrar
        </button>
        <button
          onClick={() => router.push("/register")}
          className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          Começar Grátis
        </button>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition"
      >
        {/* Avatar */}
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
        )}

        {/* Coins */}
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <span className="text-yellow-400 text-xs">🪙</span>
          <span className="text-yellow-400 text-xs font-bold">{profile?.coins ?? 0}</span>
        </div>

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Seus coins</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">🪙</span>
                  <span className="text-yellow-400 font-bold">{profile?.coins ?? 0}</span>
                </div>
              </div>
            </div>
            <button
              onClick={async () => { await logOut(); setShowDropdown(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}