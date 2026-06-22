"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Mail, DollarSign,
  Megaphone, Share2, Zap, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard",           label: "OVERVIEW",   icon: LayoutDashboard },
  { href: "/dashboard/leads",     label: "LEADS",      icon: Users           },
  { href: "/dashboard/gmail",     label: "COMMS",      icon: Mail            },
  { href: "/dashboard/revenue",   label: "REVENUE",    icon: DollarSign      },
  { href: "/dashboard/campaigns", label: "CAMPAIGNS",  icon: Megaphone       },
  { href: "/dashboard/social",    label: "SOCIAL",     icon: Share2          },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-black/95 border-r border-cyan-500/20 text-white shrink-0 relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      {/* Scanline */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scanline pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-6 py-6 border-b border-cyan-500/20">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400/70 flex items-center justify-center animate-pulse-glow">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-md animate-arc-pulse" />
          <div className="absolute -inset-1 rounded-full border border-cyan-400/20 animate-spin-slow" />
        </div>
        <div>
          <p className="font-sans text-sm font-black tracking-[0.15em] text-cyan-300 text-glow leading-none">
            J.A.R.V.I.S.
          </p>
          <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-600 mt-0.5 uppercase">
            System Online
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="relative px-6 py-2 border-b border-cyan-500/10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[9px] tracking-widest text-cyan-600 uppercase">All Systems Nominal</span>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-[0.15em] transition-all duration-200 relative",
                isActive
                  ? "text-cyan-300"
                  : "text-cyan-700 hover:text-cyan-400"
              )}
            >
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-cyan-400/8 border border-cyan-500/30 rounded-sm" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 glow-cyan-sm" />
                </>
              )}
              <Icon className={cn("w-4 h-4 relative z-10 transition-all", isActive ? "text-cyan-400 text-glow-sm" : "group-hover:text-cyan-500")} />
              <span className="relative z-10 font-mono">{label}</span>
              {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 animate-pulse relative z-10" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative px-3 py-4 border-t border-cyan-500/20">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 text-xs font-mono tracking-[0.15em] text-cyan-800 hover:text-cyan-500 transition-all w-full group"
        >
          <LogOut className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
          DISCONNECT
        </button>
        <p className="font-mono text-[8px] tracking-widest text-cyan-900 text-center mt-2 uppercase">
          Build v2.0 · Stark Industries
        </p>
      </div>
    </aside>
  );
}
