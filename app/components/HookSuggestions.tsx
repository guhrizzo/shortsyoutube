"use client";

import { Sparkles, Clock, Tag } from "lucide-react";
import { cn, formatTime } from "@/app/lib/utils";
import { Hook } from "@/app/types";

interface HookSuggestionsProps {
  hooks: Hook[];
  selectedHookId: string | null;
  onSelectHook: (hook: Hook) => void;
}

const hookTypeConfig = {
  curiosity: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: "❓" },
  controversy: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "🔥" },
  story: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "📖" },
  value: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: "💎" },
  emotion: { color: "bg-pink-500/20 text-pink-400 border-pink-500/30", icon: "❤️" },
};

export function HookSuggestions({
  hooks,
  selectedHookId,
  onSelectHook,
}: HookSuggestionsProps) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        Hooks Sugeridos pela IA
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
        {hooks.map((hook) => {
          const config = hookTypeConfig[hook.type];
          const isSelected = selectedHookId === hook.id;

          return (
            <button
              key={hook.id}
              onClick={() => onSelectHook(hook)}
              className={cn(
                "w-full p-3 rounded-xl text-left transition-all duration-200 border",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">
                    {formatTime(hook.startTime)} - {formatTime(hook.endTime)}
                  </span>
                  <Clock className="w-3 h-3 text-gray-500" />
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border",
                    config.color
                  )}
                >
                  {hook.confidence}% match
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                {config.icon} {hook.text}
              </p>

              <div className="flex flex-wrap gap-1">
                {hook.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-gray-500 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {hooks.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum hook detectado ainda.
          <br />
          Analise um vídeo para começar.
        </div>
      )}
    </div>
  );
}