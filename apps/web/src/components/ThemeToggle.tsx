"use client";
import * as React from "react";
import { Moon, Sun, Waves, Sunset, Leaf, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const themes = [
  { name: "Forest Light", value: "light", icon: Sun, color: "bg-[#F9F8F6] text-[#2D6A4F]" },
  { name: "Forest Dark", value: "dark", icon: Moon, color: "bg-[#1A1817] text-[#E27555]" },
  { name: "Ocean Waves", value: "ocean", icon: Waves, color: "bg-[#F0F8FF] text-[#0077B6]" },
  { name: "Golden Sunset", value: "sunset", icon: Sunset, color: "bg-[#2E1A29] text-[#F94144]" },
  { name: "Earthy Clay", value: "earth", icon: Leaf, color: "bg-[#F4EEDD] text-[#8D6E63]" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-10 h-10 rounded-full glass opacity-50">
        <Palette className="h-5 w-5" />
      </Button>
    );
  }

  const currentThemeObj = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentThemeObj.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="w-full h-11 rounded-xl glass hover:bg-[var(--surface)] transition-all flex items-center justify-start gap-3 px-4 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        <CurrentIcon className="h-5 w-5 text-[var(--primary)] shrink-0" />
        <span className="font-bold text-sm text-[var(--text-primary)] truncate">{currentThemeObj.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute left-0 bottom-14 mb-2 w-full min-w-[220px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg p-2 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs font-bold text-[var(--text-secondary)] px-3 py-2 uppercase tracking-wider mb-1 border-b border-[var(--border)]/50">
            Platform Theme
          </p>
          <div className="flex flex-col gap-1">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setTheme(t.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-bold transition-all text-left ${
                    isActive 
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
                      : "text-[var(--text-primary)] hover:bg-[var(--background)]"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-black/10 dark:border-white/10 ${t.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
