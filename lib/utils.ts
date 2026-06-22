import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export const BUSINESS_LABELS = {
  NATES_GYM_SERVICES: "Nate's Gym Services",
  FITVEND_GLOBAL: "FitVend Global",
  FIT_ATLAS: "Fit Atlas",
} as const;

export const STAGE_COLORS = {
  NEW:         "border-slate-500/50 text-slate-400",
  CONTACTED:   "border-sky-500/50 text-sky-400",
  QUALIFIED:   "border-amber-500/50 text-amber-400",
  PROPOSAL:    "border-orange-500/50 text-orange-400",
  NEGOTIATION: "border-violet-500/50 text-violet-400",
  WON:         "border-emerald-500/60 text-emerald-400",
  LOST:        "border-red-500/50 text-red-400",
  NURTURE:     "border-teal-500/50 text-teal-400",
} as const;

export const SOURCE_LABELS = {
  EMAIL: "Email",
  REFERRAL: "Referral",
  SOCIAL_INSTAGRAM: "Instagram",
  SOCIAL_LINKEDIN: "LinkedIn",
  COLD_OUTREACH: "Cold Outreach",
  INBOUND_WEBSITE: "Website",
  WORD_OF_MOUTH: "Word of Mouth",
  TRADE_SHOW: "Trade Show",
  OTHER: "Other",
} as const;
