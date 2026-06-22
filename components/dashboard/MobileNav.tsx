"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, DollarSign, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard",           label: "HOME",      icon: LayoutDashboard },
  { href: "/dashboard/leads",     label: "LEADS",     icon: Users           },
  { href: "/dashboard/gmail",     label: "COMMS",     icon: Mail            },
  { href: "/dashboard/revenue",   label: "REVENUE",   icon: DollarSign      },
  { href: "/dashboard/campaigns", label: "OPS",       icon: Megaphone       },
];

export function MobileNav() {
  const path = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-cyan-500/30 z-50">
      <div className="flex">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 transition-all",
                isActive ? "text-cyan-300" : "text-cyan-800"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-glow-sm")} />
              <span className={cn("font-mono text-[8px] tracking-widest", isActive ? "text-cyan-400" : "text-cyan-900")}>
                {label}
              </span>
              {isActive && <div className="w-4 h-0.5 bg-cyan-400 glow-cyan-sm rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
