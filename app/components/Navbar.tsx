"use client";

// app/components/Navbar.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Menu, X } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface NavbarProps {
  onScrollToSection?: (id: string) => void;
}

interface NavLink {
  label: string;
  type: "scroll" | "redirect";
  id?: string;
  href?: string;
}

export function Navbar({ onScrollToSection }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(id: string) {
    onScrollToSection?.(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }

  function handleNavigation(link: NavLink) {
    if (link.type === "scroll" && link.id) {
      scrollToSection(link.id);
    } else if (link.type === "redirect" && link.href) {
      setMobileMenuOpen(false);
      router.push(link.href);
    }
  }

  const navLinks: NavLink[] = [
    { label: "Recursos", type: "scroll", id: "features" },
    { label: "Como Funciona", type: "scroll", id: "how-it-works" },
    { label: "Preços", type: "redirect", href: "/coins" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled
          ? "bg-[#030305]/90 backdrop-blur-xl shadow-2xl shadow-purple-900/10 border-white/10"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => scrollToSection("hero")}>
          <div className="relative w-10 h-10 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/25 group-hover:shadow-purple-600/50 transition-all duration-300 group-hover:scale-105">
            <Scissors className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ClipAI
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link)}
              className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </button>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          <UserMenu />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white rounded-lg hover:bg-white/5 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen
            ? <X className="w-6 h-6" />
            : <Menu className="w-6 h-6" />
          }
        </button>
      </div>

       {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#030305]/97 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-2 animate-in slide-in-from-top-3 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link)}
              className="text-left text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all"
            >
              {link.label}
            </button>
          ))}
          <hr className="border-white/10 my-2" />
          <div className="flex flex-col gap-3">
            <UserMenu />
          </div>
        </div>
      )}
    </nav>
  );
}