import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Color = "cyan" | "green" | "purple" | "amber";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  color?: Color;
}

const STYLES: Record<Color, { bg: string; border: string; icon: string; glow: string; bar: string }> = {
  green:  { bg: "bg-emerald-950/50",  border: "border-emerald-500/30",  icon: "text-emerald-400 bg-emerald-500/15",  glow: "shadow-emerald-500/20",  bar: "bg-emerald-400" },
  cyan:   { bg: "bg-sky-950/50",      border: "border-sky-500/30",      icon: "text-sky-400 bg-sky-500/15",          glow: "shadow-sky-500/20",      bar: "bg-sky-400"     },
  purple: { bg: "bg-violet-950/50",   border: "border-violet-500/30",   icon: "text-violet-400 bg-violet-500/15",    glow: "shadow-violet-500/20",   bar: "bg-violet-400"  },
  amber:  { bg: "bg-amber-950/50",    border: "border-amber-500/30",    icon: "text-amber-400 bg-amber-500/15",      glow: "shadow-amber-500/20",    bar: "bg-amber-400"   },
};

export function StatCard({ title, value, change, positive, icon: Icon, color = "cyan" }: StatCardProps) {
  const s = STYLES[color];
  return (
    <div className={cn("relative flex flex-col gap-4 p-6 border hud-corners", s.bg, s.border, "shadow-lg", s.glow)}>
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/40">{title}</p>
        <div className={cn("p-2.5 rounded-sm", s.icon)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Big value */}
      <div>
        <p className="font-sans text-5xl font-black text-white leading-none tracking-tight" style={{
          textShadow: color === "green"  ? "0 0 30px rgba(52,211,153,0.6),  0 0 60px rgba(52,211,153,0.2)"  :
                      color === "cyan"   ? "0 0 30px rgba(56,189,248,0.6),  0 0 60px rgba(56,189,248,0.2)"  :
                      color === "purple" ? "0 0 30px rgba(167,139,250,0.6), 0 0 60px rgba(167,139,250,0.2)" :
                                          "0 0 30px rgba(251,191,36,0.6),  0 0 60px rgba(251,191,36,0.2)"
        }}>
          {value}
        </p>
        {change && (
          <p className={cn("font-mono text-xs mt-2 tracking-wider", positive ? "text-emerald-400" : "text-red-400")}>
            {positive ? "▲" : "▼"} {change}
          </p>
        )}
      </div>

      {/* Accent bar */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 opacity-60", s.bar)} />
    </div>
  );
}
