"use client";

import { Monitor, Smartphone, Instagram, Twitter, Check } from "lucide-react";
import { Switch } from "./ui/switcher";
import { cn } from "@/app/lib/utils";
import { ExportSettings as ExportSettingsType } from "@/app/types";

interface ExportSettingsProps {
  settings: ExportSettingsType;
  onSettingsChange: (settings: ExportSettingsType) => void;
}

const platforms = [
  { id: "youtube_shorts", label: "YouTube Shorts", icon: <Smartphone className="w-4 h-4" />, ratio: "9:16" },
  { id: "tiktok", label: "TikTok", icon: <Smartphone className="w-4 h-4" />, ratio: "9:16" },
  { id: "instagram_reels", label: "Instagram Reels", icon: <Instagram className="w-4 h-4" />, ratio: "9:16" },
  { id: "instagram_feed", label: "Instagram Feed", icon: <Instagram className="w-4 h-4" />, ratio: "1:1" },
  { id: "twitter", label: "Twitter/X", icon: <Twitter className="w-4 h-4" />, ratio: "16:9" },
] as const;

export function ExportSettings({
  settings,
  onSettingsChange,
}: ExportSettingsProps) {
  const updateSetting = <K extends keyof ExportSettingsType>(
    key: K,
    value: ExportSettingsType[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-4">
      <h3 className="font-semibold text-sm">Configurações de Exportação</h3>

      {/* Platform Selection */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 block">Plataforma</label>
        <div className="grid grid-cols-1 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => {
                updateSetting("platform", platform.id);
                updateSetting("aspectRatio", platform.ratio as "9:16" | "1:1" | "16:9");
              }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                settings.platform === platform.id
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    settings.platform === platform.id
                      ? "bg-primary/20 text-primary"
                      : "bg-white/10 text-gray-400"
                  )}
                >
                  {platform.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{platform.label}</p>
                  <p className="text-[10px] text-gray-500">{platform.ratio}</p>
                </div>
              </div>
              {settings.platform === platform.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 block">Qualidade</label>
        <div className="flex gap-2">
          {(["1080p", "4k"] as const).map((quality) => (
            <button
              key={quality}
              onClick={() => updateSetting("quality", quality)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium border transition",
                settings.quality === quality
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              )}
            >
              {quality === "4k" ? "4K" : quality}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <ToggleItem
          label="Legendas automáticas"
          description="Gera legendas estilizadas automaticamente"
          checked={settings.autoCaptions}
          onCheckedChange={(checked) => updateSetting("autoCaptions", checked)}
        />
        <ToggleItem
          label="Zoom dinâmico"
          description="Adiciona zoom automático em momentos importantes"
          checked={settings.dynamicZoom}
          onCheckedChange={(checked) => updateSetting("dynamicZoom", checked)}
        />
        <ToggleItem
          label="Remover silêncios"
          description="Corta automaticamente pausas longas"
          checked={settings.removeSilence}
          onCheckedChange={(checked) => updateSetting("removeSilence", checked)}
        />
        <ToggleItem
          label="Música de fundo"
          description="Adiciona música trending sem direitos autorais"
          checked={settings.addBackgroundMusic}
          onCheckedChange={(checked) => updateSetting("addBackgroundMusic", checked)}
        />
      </div>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <p className="text-sm text-white">{label}</p>
        <p className="text-[10px] text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}