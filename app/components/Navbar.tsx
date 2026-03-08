"use client";

import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/app/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Viral<span className="gradient-text">Cut</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-sm text-gray-400 hover:text-white transition">
              Como Funciona
            </button>
            <button className="text-sm text-gray-400 hover:text-white transition">
              Preços
            </button>
            <Button variant="outline" size="sm">
              Login
            </Button>
            <Button variant="gradient" size="sm">
              Começar Grátis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-white/10">
            <button className="block w-full text-left text-sm text-gray-400 hover:text-white py-2">
              Como Funciona
            </button>
            <button className="block w-full text-left text-sm text-gray-400 hover:text-white py-2">
              Preços
            </button>
            <Button variant="outline" className="w-full">
              Login
            </Button>
            <Button variant="gradient" className="w-full">
              Começar Grátis
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}