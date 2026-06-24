"use client";

import { useState } from "react";
import { type MarketingPost, type EmailSequence } from "@prisma/client";
import {
  Sparkles, Calendar, Mail, Zap, BarChart2,
  Instagram, Linkedin, Twitter, Facebook, Play,
  CheckCircle, Clock, Trash2, ChevronLeft,
  ChevronRight, Plus, TrendingUp, Hash,
  Target, Send, ArrowRight, Bot, UserPlus, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmailSequenceWithSteps = EmailSequence & {
  steps: { id: string; stepNumber: number; delayDays: number; subject: string; body: string }[];
};

interface GeneratedPost {
  platform: string;
  hook: string;
  content: string;
  hashtags: string[];
}

interface ViralAnalysis {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  rewrite: string;
  bestPlatforms: string[];
}

type Tab = "generate" | "calendar" | "sequences" | "virallab" | "autopilot" | "metrics";

// ─── Constants ───────────────────────────────────────────────────────────────

const BUSINESSES = [
  { value: "NATES_GYM_SERVICES", label: "Nate's Gym Services", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { value: "FITVEND_GLOBAL",     label: "FitVend Global",      color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/30"    },
  { value: "FIT_ATLAS",          label: "Fit Atlas",            color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/30" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-400",   border: "border-pink-500/40" },
  { value: "linkedin",  label: "LinkedIn",  icon: Linkedin,  color: "text-blue-400",   border: "border-blue-500/40" },
  { value: "twitter",   label: "Twitter/X", icon: Twitter,   color: "text-sky-400",    border: "border-sky-500/40"  },
  { value: "facebook",  label: "Facebook",  icon: Facebook,  color: "text-indigo-400", border: "border-indigo-500/40" },
  { value: "tiktok",    label: "TikTok",    icon: Play,      color: "text-red-400",    border: "border-red-500/40"  },
];

const TONES = ["Professional", "Casual", "Motivational", "Educational", "Promotional", "Storytelling"];
const COUNTS = [5, 10, 20];

const HASHTAG_BANKS: Record<string, { category: string; tags: string[] }[]> = {
  NATES_GYM_SERVICES: [
    { category: "Equipment", tags: ["gymequipment", "fitnessequipment", "strengthequipment", "cardioequipment", "commercialgym", "exerciseequipment", "gymrenovation"] },
    { category: "Business", tags: ["gymowner", "fitnessowner", "gymbusiness", "fitnessbusiness", "gymmanagement", "gymconsulting", "gymdesign"] },
    { category: "Services", tags: ["gymmaintenance", "equipmentsales", "equipmentrental", "gymservices", "fitnessservices", "gymconsultant"] },
  ],
  FITVEND_GLOBAL: [
    { category: "Revenue", tags: ["passiveincome", "gymrevenue", "revenueshare", "gymincome", "fitnessrevenue", "vendingpartnership", "gympassiveincome"] },
    { category: "Vending", tags: ["vendingmachines", "vendingbusiness", "healthyvending", "fitnessvending", "gymsnacks", "gymproducts", "vendingoperator"] },
    { category: "Fitness", tags: ["proteinsnacks", "gymnutrition", "fitnessfood", "gymowners", "gymcommunity", "healthysnacks"] },
  ],
  FIT_ATLAS: [
    { category: "Discovery", tags: ["gymfinder", "gymlocator", "gymnearme", "gymsearch", "fitnesstravel", "gymapp", "gymdiscovery"] },
    { category: "Membership", tags: ["gymmembership", "gymaccess", "gympass", "fitnesstraveler", "gymnetwork", "gymcommunity"] },
    { category: "Platform", tags: ["fitatlas", "gymdirectory", "fitnessplatform", "gymlistings", "gymmarketplace", "fitnesscommunity"] },
  ],
};

const BEST_TIMES: { platform: string; times: string[]; icon: React.ElementType; color: string }[] = [
  { platform: "Instagram",  times: ["7–9am", "11am–1pm", "5–7pm"],  icon: Instagram, color: "text-pink-400"   },
  { platform: "LinkedIn",   times: ["7–8am", "12pm", "5–6pm"],       icon: Linkedin,  color: "text-blue-400"  },
  { platform: "Twitter/X",  times: ["8–10am", "12–1pm", "5pm"],      icon: Twitter,   color: "text-sky-400"   },
  { platform: "Facebook",   times: ["9am–12pm", "1–3pm"],            icon: Facebook,  color: "text-indigo-400"},
  { platform: "TikTok",     times: ["6–10am", "7–11pm"],             icon: Play,      color: "text-red-400"   },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Shared sub-components ───────────────────────────────────────────────────

function HudCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative border border-cyan-500/20 bg-black/60 rounded-sm p-4", className)}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60" />
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "text-slate-400 border-slate-600",
    APPROVED: "text-emerald-400 border-emerald-600",
    SCHEDULED: "text-cyan-400 border-cyan-600",
    POSTED: "text-green-400 border-green-600",
  };
  return (
    <span className={cn("font-mono text-[9px] tracking-widest border px-1.5 py-0.5 rounded-sm uppercase", map[status] || "text-slate-400 border-slate-600")}>
      {status}
    </span>
  );
}

function PlatformIcon({ platform, size = "sm" }: { platform: string; size?: "sm" | "md" }) {
  const p = PLATFORMS.find(p => p.value === platform);
  if (!p) return null;
  const Icon = p.icon;
  return <Icon className={cn(p.color, size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5")} />;
}

// ─── Generate Tab ────────────────────────────────────────────────────────────

function GenerateTab({ onSave }: { onSave: (post: MarketingPost) => void }) {
  const [business, setBusiness] = useState("NATES_GYM_SERVICES");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "linkedin"]);
  const [tone, setTone] = useState("Professional");
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPost[]>([]);
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenerated([]);
    setSaved(new Set());
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, platforms: selectedPlatforms, topic, tone, count }),
      });
      const data = await res.json();
      setGenerated(data.posts || []);
    } finally {
      setGenerating(false);
    }
  }

  async function savePost(post: GeneratedPost, idx: number) {
    setSaving(prev => new Set(prev).add(idx));
    try {
      const res = await fetch("/api/marketing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business,
          platforms: [post.platform],
          content: post.content,
          hashtags: post.hashtags,
          topic,
        }),
      });
      if (res.ok) {
        const saved_post = await res.json();
        onSave(saved_post);
        setSaved(prev => new Set(prev).add(idx));
      }
    } finally {
      setSaving(prev => { const n = new Set(prev); n.delete(idx); return n; });
    }
  }

  async function saveAll() {
    const unsaved = generated.filter((_, i) => !saved.has(i));
    for (let i = 0; i < unsaved.length; i++) {
      const origIdx = generated.indexOf(unsaved[i]);
      await savePost(unsaved[i], origIdx);
    }
  }

  return (
    <div className="space-y-6">
      {/* Config */}
      <HudCard>
        <div className="space-y-5">
          {/* Business selector */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-600 uppercase mb-2">Business Unit</p>
            <div className="flex flex-wrap gap-2">
              {BUSINESSES.map(b => (
                <button
                  key={b.value}
                  onClick={() => setBusiness(b.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-mono tracking-wide border rounded-sm transition-all",
                    business === b.value ? b.bg + " " + b.color : "border-slate-800 text-slate-600 hover:border-slate-600"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform selector */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-600 uppercase mb-2">Target Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const Icon = p.icon;
                const sel = selectedPlatforms.includes(p.value);
                return (
                  <button
                    key={p.value}
                    onClick={() => togglePlatform(p.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wide border rounded-sm transition-all",
                      sel ? `${p.border} ${p.color} bg-white/5` : "border-slate-800 text-slate-600 hover:border-slate-600"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic + tone + count */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-600 uppercase mb-2">Topic / Angle</p>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generate()}
                placeholder="e.g. Why gyms need vending machines"
                className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-600 uppercase mb-2">Tone</p>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/60 font-mono"
              >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-600 uppercase mb-2">Posts to Generate</p>
              <div className="flex gap-2">
                {COUNTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={cn(
                      "flex-1 py-2 text-sm font-mono border rounded-sm transition-all",
                      count === c ? "border-cyan-500/60 text-cyan-400 bg-cyan-500/10" : "border-slate-800 text-slate-600 hover:border-slate-600"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating || !topic.trim() || !selectedPlatforms.length}
            className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className={cn("w-4 h-4", generating && "animate-spin")} />
            {generating ? "Generating Content..." : "Generate with JARVIS AI"}
          </button>
        </div>
      </HudCard>

      {/* Results */}
      {generating && (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-sm tracking-widest">JARVIS is crafting viral content...</span>
          </div>
        </div>
      )}

      {generated.length > 0 && !generating && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-cyan-600 uppercase">{generated.length} posts generated</span>
            </div>
            <button
              onClick={saveAll}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono tracking-wide border border-emerald-500/40 text-emerald-400 rounded-sm hover:bg-emerald-500/10 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Save All
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {generated.map((post, i) => {
              const p = PLATFORMS.find(x => x.value === post.platform);
              return (
                <HudCard key={i}>
                  <div className="space-y-3">
                    {/* Platform + status */}
                    <div className="flex items-center justify-between">
                      <div className={cn("flex items-center gap-1.5 text-xs font-mono", p?.color || "text-slate-400")}>
                        <PlatformIcon platform={post.platform} />
                        {p?.label || post.platform}
                      </div>
                      {saved.has(i) && (
                        <span className="text-[9px] font-mono text-emerald-400 tracking-widest">SAVED</span>
                      )}
                    </div>

                    {/* Hook */}
                    <p className="text-cyan-300 text-xs font-mono italic border-l-2 border-cyan-500/40 pl-2 line-clamp-2">
                      &ldquo;{post.hook}&rdquo;
                    </p>

                    {/* Content */}
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-6">{post.content}</p>

                    {/* Hashtags */}
                    {post.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.slice(0, 6).map(h => (
                          <span key={h} className="text-[9px] font-mono text-cyan-700 bg-cyan-500/5 border border-cyan-500/20 px-1.5 py-0.5 rounded-sm">
                            #{h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => savePost(post, i)}
                      disabled={saving.has(i) || saved.has(i)}
                      className={cn(
                        "w-full py-1.5 text-xs font-mono tracking-wide border rounded-sm transition-all",
                        saved.has(i)
                          ? "border-emerald-600 text-emerald-400 bg-emerald-500/10 cursor-not-allowed"
                          : "border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                      )}
                    >
                      {saving.has(i) ? "Saving..." : saved.has(i) ? "✓ Saved" : "Save to Calendar"}
                    </button>
                  </div>
                </HudCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calendar Tab ────────────────────────────────────────────────────────────

function CalendarTab({ posts, onUpdate, onDelete }: {
  posts: MarketingPost[];
  onUpdate: (post: MarketingPost) => void;
  onDelete: (id: string) => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<MarketingPost | null>(null);
  const [scheduling, setScheduling] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }

  function getPostsForDay(day: number) {
    return posts.filter(p => {
      if (!p.scheduledAt) return false;
      const d = new Date(p.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const unscheduled = posts.filter(p => !p.scheduledAt && p.status === "DRAFT");

  async function schedulePost(id: string, dateStr: string) {
    setScheduling(id);
    try {
      const res = await fetch(`/api/marketing/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(dateStr).toISOString(), status: "SCHEDULED" }),
      });
      if (res.ok) { const p = await res.json(); onUpdate(p); }
    } finally { setScheduling(null); }
  }

  async function deletePost(id: string) {
    await fetch(`/api/marketing/posts/${id}`, { method: "DELETE" });
    onDelete(id);
    setSelected(null);
  }

  const bizColor: Record<string, string> = {
    NATES_GYM_SERVICES: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    FITVEND_GLOBAL: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    FIT_ATLAS: "bg-violet-500/20 border-violet-500/40 text-violet-300",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1.5 border border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 rounded-sm transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-sm tracking-[0.2em] text-cyan-400 uppercase">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-1.5 border border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 rounded-sm transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="border border-cyan-500/10 rounded-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-cyan-500/10">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center font-mono text-[9px] tracking-widest text-cyan-800 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="min-h-[80px] border-b border-r border-cyan-500/5 bg-black/20" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              const isToday = now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[80px] border-b border-r border-cyan-500/5 p-1.5 cursor-pointer transition-all hover:bg-cyan-500/5",
                    isToday && "bg-cyan-500/5"
                  )}
                >
                  <span className={cn(
                    "font-mono text-[10px] block mb-1",
                    isToday ? "text-cyan-400 font-bold" : "text-slate-600"
                  )}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={cn(
                          "w-full text-left text-[9px] font-mono px-1 py-0.5 border rounded-sm truncate block",
                          bizColor[p.business] || "bg-slate-800 text-slate-400"
                        )}
                      >
                        {(p.platforms as string[])[0]?.slice(0,2).toUpperCase()} · {p.content.slice(0, 20)}…
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[8px] text-cyan-800 font-mono pl-1">+{dayPosts.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {BUSINESSES.map(b => (
            <div key={b.value} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-sm border", b.bg)} />
              <span className="font-mono text-[9px] text-slate-600">{b.label.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        {selected ? (
          <HudCard>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="text-slate-700 hover:text-slate-400 font-mono text-xs">✕</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(selected.platforms as string[]).map(p => (
                  <div key={p} className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                    <PlatformIcon platform={p} size="sm" />
                    {p}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selected.content}</p>
              {(selected.hashtags as string[]).length > 0 && (
                <p className="text-[9px] font-mono text-cyan-700">
                  {(selected.hashtags as string[]).map(h => `#${h}`).join(" ")}
                </p>
              )}
              {!selected.scheduledAt && (
                <div>
                  <p className="font-mono text-[9px] text-cyan-600 mb-1">Schedule for</p>
                  <input
                    type="datetime-local"
                    className="w-full bg-black border border-slate-700 rounded-sm px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60"
                    onChange={e => e.target.value && schedulePost(selected.id, e.target.value)}
                  />
                </div>
              )}
              {selected.scheduledAt && (
                <p className="text-[10px] font-mono text-cyan-500">
                  Scheduled: {new Date(selected.scheduledAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => deletePost(selected.id)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-red-700 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete Post
              </button>
            </div>
          </HudCard>
        ) : (
          <HudCard>
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Click a post to view details</p>
            <p className="text-xs text-slate-600">Select any scheduled post on the calendar to edit, reschedule, or delete it.</p>
          </HudCard>
        )}

        {/* Unscheduled queue */}
        {unscheduled.length > 0 && (
          <HudCard>
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Unscheduled Queue ({unscheduled.length})</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unscheduled.map(p => (
                <div key={p.id} className="flex items-start gap-2">
                  <div className="flex gap-1 pt-0.5">
                    {(p.platforms as string[]).map(pl => <PlatformIcon key={pl} platform={pl} size="sm" />)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 truncate">{p.content.slice(0, 50)}…</p>
                    <input
                      type="datetime-local"
                      className="w-full mt-1 bg-black border border-slate-800 rounded-sm px-1.5 py-1 text-[9px] text-slate-500 font-mono focus:outline-none focus:border-cyan-500/60"
                      onChange={e => e.target.value && schedulePost(p.id, e.target.value)}
                      disabled={scheduling === p.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          </HudCard>
        )}
      </div>
    </div>
  );
}

// ─── Sequences Tab ───────────────────────────────────────────────────────────

function SequencesTab({ sequences, onAdd }: {
  sequences: EmailSequenceWithSteps[];
  onAdd: (seq: EmailSequenceWithSteps) => void;
}) {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selected, setSelected] = useState<EmailSequenceWithSteps | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ business: "NATES_GYM_SERVICES", name: "", target: "", stepCount: 5 });
  const [steps, setSteps] = useState<{ stepNumber: number; delayDays: number; subject: string; body: string }[]>([]);

  function setF(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })); }

  async function generateSteps() {
    if (!form.name || !form.target) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/sequences/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSteps(data.steps || []);
    } finally { setGenerating(false); }
  }

  async function saveSequence() {
    if (!steps.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/marketing/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, steps }),
      });
      if (res.ok) {
        const seq = await res.json();
        onAdd(seq);
        setView("list");
        setForm({ business: "NATES_GYM_SERVICES", name: "", target: "", stepCount: 5 });
        setSteps([]);
      }
    } finally { setSaving(false); }
  }

  if (view === "detail" && selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-xs font-mono text-cyan-600 hover:text-cyan-400 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to sequences
        </button>
        <HudCard>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-mono text-sm text-cyan-300 tracking-wide">{selected.name}</h3>
              <p className="font-mono text-[9px] text-cyan-700 mt-0.5">{BUSINESSES.find(b => b.value === selected.business)?.label} · {selected.steps.length} steps · Target: {selected.target || "All"}</p>
            </div>
            <StatusBadge status={selected.status} />
          </div>
          <div className="space-y-3">
            {selected.steps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[9px] text-cyan-400">{step.stepNumber}</span>
                  </div>
                  {i < selected.steps.length - 1 && <div className="w-px flex-1 bg-cyan-500/20" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] text-cyan-700 uppercase tracking-widest">
                      {step.delayDays === 0 ? "Day 0 · Immediately" : `Day ${step.delayDays}`}
                    </span>
                  </div>
                  <div className="border border-slate-800 bg-black/40 rounded-sm p-3">
                    <p className="font-mono text-xs text-cyan-300 mb-2">Subject: {step.subject}</p>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </HudCard>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="space-y-6">
        <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-xs font-mono text-cyan-600 hover:text-cyan-400 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <HudCard>
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-4">New Email Sequence</p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1.5">Business</p>
                <select value={form.business} onChange={e => setF("business", e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60">
                  {BUSINESSES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1.5">Number of Emails</p>
                <div className="flex gap-2">
                  {[3, 5, 7].map(n => (
                    <button key={n} onClick={() => setF("stepCount", n)}
                      className={cn("flex-1 py-2 text-sm font-mono border rounded-sm transition-all",
                        form.stepCount === n ? "border-cyan-500/60 text-cyan-400 bg-cyan-500/10" : "border-slate-800 text-slate-600 hover:border-slate-600")}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1.5">Sequence Name</p>
              <input value={form.name} onChange={e => setF("name", e.target.value)}
                placeholder="e.g. New Gym Owner Onboarding"
                className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60 placeholder-slate-700" />
            </div>
            <div>
              <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1.5">Target Audience</p>
              <input value={form.target} onChange={e => setF("target", e.target.value)}
                placeholder="e.g. New gym owners who just opened a facility"
                className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60 placeholder-slate-700" />
            </div>
            <button onClick={generateSteps} disabled={generating || !form.name || !form.target}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-cyan-500/20 disabled:opacity-40 transition-all">
              <Mail className={cn("w-4 h-4", generating && "animate-pulse")} />
              {generating ? "Generating Sequence..." : "Generate with AI"}
            </button>
          </div>
        </HudCard>

        {steps.length > 0 && (
          <div className="space-y-3">
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest">{steps.length} emails generated — review & save</p>
            {steps.map((step, i) => (
              <HudCard key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full border border-cyan-500/40 flex items-center justify-center">
                    <span className="font-mono text-[9px] text-cyan-400">{step.stepNumber}</span>
                  </div>
                  <span className="font-mono text-[9px] text-cyan-700">{step.delayDays === 0 ? "Immediately" : `After ${step.delayDays} days`}</span>
                </div>
                <p className="text-xs font-mono text-cyan-300 mb-1.5">Subject: {step.subject}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>
              </HudCard>
            ))}
            <button onClick={saveSequence} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
              <Send className="w-4 h-4" />
              {saving ? "Saving..." : "Save Sequence"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
    {enrolling && (
      <EnrollModal
        sequenceId={enrolling}
        onClose={() => setEnrolling(null)}
        onDone={() => setEnrolling(null)}
      />
    )}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest">{sequences.length} sequences</p>
        <button onClick={() => setView("create")}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono border border-cyan-500/40 text-cyan-400 rounded-sm hover:bg-cyan-500/10 transition-all">
          <Plus className="w-3.5 h-3.5" />
          New Sequence
        </button>
      </div>

      {sequences.length === 0 && (
        <HudCard>
          <div className="text-center py-8">
            <Mail className="w-10 h-10 text-cyan-900 mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-600">No email sequences yet</p>
            <p className="font-mono text-[10px] text-slate-700 mt-1">Create automated drip campaigns to nurture leads</p>
          </div>
        </HudCard>
      )}

      {sequences.map(seq => {
        const biz = BUSINESSES.find(b => b.value === seq.business);
        return (
          <HudCard key={seq.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("font-mono text-xs tracking-wide", biz?.color)}>{seq.name}</span>
                  <StatusBadge status={seq.status} />
                </div>
                <p className="font-mono text-[9px] text-slate-600">{biz?.label} · {seq.steps.length} emails · Target: {seq.target || "General"}</p>
                {seq.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{seq.description}</p>}
              </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setEnrolling(seq.id)}
                  className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 hover:text-emerald-400 transition-colors border border-emerald-900/50 hover:border-emerald-600/40 px-2 py-1 rounded-sm">
                  <UserPlus className="w-3 h-3" /> Enroll
                </button>
                <button onClick={() => { setSelected(seq); setView("detail"); }}
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-700 hover:text-cyan-400 transition-colors">
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </HudCard>
        );
      })}
    </div>
  );
}

// ─── Viral Lab Tab ───────────────────────────────────────────────────────────

function ViralLabTab() {
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null);
  const [selectedBiz, setSelectedBiz] = useState("NATES_GYM_SERVICES");
  const [copied, setCopied] = useState<string | null>(null);

  async function analyze() {
    if (!content.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/marketing/viral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setAnalysis(await res.json());
    } finally { setAnalyzing(false); }
  }

  function copyTags(tags: string[]) {
    const text = tags.map(t => `#${t}`).join(" ");
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const scoreColor = analysis
    ? analysis.score >= 80 ? "text-emerald-400" : analysis.score >= 60 ? "text-cyan-400" : analysis.score >= 40 ? "text-amber-400" : "text-red-400"
    : "text-slate-600";

  const hashtagBanks = HASHTAG_BANKS[selectedBiz] || [];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Content analyzer */}
      <div className="space-y-4">
        <HudCard>
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Content Viral Analyzer</p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            placeholder="Paste your social post, caption, or email subject line here..."
            className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2.5 text-sm text-slate-300 placeholder-slate-700 font-mono focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
          />
          <button
            onClick={analyze}
            disabled={analyzing || !content.trim()}
            className="mt-3 flex items-center gap-2 px-5 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-cyan-500/20 disabled:opacity-40 transition-all"
          >
            <Zap className={cn("w-4 h-4", analyzing && "animate-pulse")} />
            {analyzing ? "Analyzing..." : "Analyze Viral Potential"}
          </button>
        </HudCard>

        {analysis && (
          <HudCard>
            {/* Score */}
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <p className={cn("font-mono text-5xl font-bold", scoreColor)}>{analysis.score}</p>
                <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Viral Score</p>
              </div>
              <div className="text-center">
                <p className={cn("font-mono text-4xl font-bold", scoreColor)}>{analysis.grade}</p>
                <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Grade</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1">Best Platforms</p>
                <div className="flex gap-1.5">
                  {analysis.bestPlatforms?.map(p => <PlatformIcon key={p} platform={p} size="md" />)}
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="h-2 bg-slate-900 rounded-full mb-4 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", analysis.score >= 80 ? "bg-emerald-500" : analysis.score >= 60 ? "bg-cyan-500" : analysis.score >= 40 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            {/* Strengths */}
            {analysis.strengths?.length > 0 && (
              <div className="mb-3">
                <p className="font-mono text-[9px] text-emerald-600 uppercase tracking-widest mb-2">Strengths</p>
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-400">{s}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements?.length > 0 && (
              <div className="mb-3">
                <p className="font-mono text-[9px] text-amber-600 uppercase tracking-widest mb-2">Improvements</p>
                {analysis.improvements.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-400">{s}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Rewrite */}
            {analysis.rewrite && (
              <div>
                <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-2">AI Rewrite</p>
                <div className="bg-black/60 border border-cyan-500/20 rounded-sm p-3">
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{analysis.rewrite}</p>
                </div>
                <button
                  onClick={() => setContent(analysis.rewrite)}
                  className="mt-2 text-[10px] font-mono text-cyan-700 hover:text-cyan-500 transition-colors"
                >
                  Use rewrite → analyze again
                </button>
              </div>
            )}
          </HudCard>
        )}
      </div>

      {/* Right: Hashtag banks + best times */}
      <div className="space-y-4">
        <HudCard>
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Hashtag Banks</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {BUSINESSES.map(b => (
              <button key={b.value} onClick={() => setSelectedBiz(b.value)}
                className={cn("px-2.5 py-1 text-[10px] font-mono border rounded-sm transition-all",
                  selectedBiz === b.value ? `${b.bg} ${b.color}` : "border-slate-800 text-slate-600 hover:border-slate-600")}>
                {b.label.split(" ")[0]}
              </button>
            ))}
          </div>
          {hashtagBanks.map(bank => (
            <div key={bank.category} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {bank.category}
                </p>
                <button onClick={() => copyTags(bank.tags)}
                  className="text-[9px] font-mono text-cyan-700 hover:text-cyan-500 transition-colors">
                  {copied?.includes(bank.tags[0]) ? "Copied!" : "Copy all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {bank.tags.map(tag => (
                  <button key={tag} onClick={() => { navigator.clipboard.writeText(`#${tag}`); }}
                    className="text-[9px] font-mono text-cyan-700 bg-cyan-500/5 border border-cyan-500/15 px-1.5 py-0.5 rounded-sm hover:bg-cyan-500/10 hover:text-cyan-500 transition-all">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </HudCard>

        <HudCard>
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Best Posting Times</p>
          <div className="space-y-3">
            {BEST_TIMES.map(({ platform, times, icon: Icon, color }) => (
              <div key={platform} className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
                <div className="flex-1">
                  <p className="font-mono text-[9px] text-slate-500 mb-1">{platform}</p>
                  <div className="flex flex-wrap gap-1">
                    {times.map(t => (
                      <span key={t} className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-sm">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[8px] text-slate-700 mt-3">Times in local timezone · Tue–Thu generally best for all platforms</p>
        </HudCard>
      </div>
    </div>
  );
}

// ─── Metrics Tab ─────────────────────────────────────────────────────────────

function MetricsTab({ posts }: { posts: MarketingPost[] }) {
  const thisMonth = posts.filter(p => {
    const d = new Date(p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const scheduled = posts.filter(p => p.status === "SCHEDULED");
  const posted = posts.filter(p => p.status === "POSTED");
  const avgScore = posts.filter(p => p.viralScore).reduce((sum, p) => sum + (p.viralScore || 0), 0) / (posts.filter(p => p.viralScore).length || 1);

  const platformCounts: Record<string, number> = {};
  posts.forEach(p => {
    (p.platforms as string[]).forEach(pl => {
      platformCounts[pl] = (platformCounts[pl] || 0) + 1;
    });
  });

  const bizCounts: Record<string, number> = {};
  posts.forEach(p => {
    bizCounts[p.business] = (bizCounts[p.business] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month", value: thisMonth.length, unit: "posts", color: "text-cyan-400", border: "border-cyan-500/20" },
          { label: "Scheduled", value: scheduled.length, unit: "queued", color: "text-blue-400", border: "border-blue-500/20" },
          { label: "Published", value: posted.length, unit: "posts", color: "text-emerald-400", border: "border-emerald-500/20" },
          { label: "Avg Viral Score", value: posts.filter(p => p.viralScore).length ? Math.round(avgScore) : "—", unit: "/100", color: "text-violet-400", border: "border-violet-500/20" },
        ].map(card => (
          <HudCard key={card.label} className={cn("border", card.border)}>
            <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mb-1">{card.label}</p>
            <p className={cn("font-mono text-3xl font-bold", card.color)}>{card.value}</p>
            <p className="font-mono text-[9px] text-slate-700">{card.unit}</p>
          </HudCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Posts by platform */}
        <HudCard>
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-4">Content by Platform</p>
          {PLATFORMS.map(pl => {
            const count = platformCounts[pl.value] || 0;
            const max = Math.max(...Object.values(platformCounts), 1);
            return (
              <div key={pl.value} className="flex items-center gap-3 mb-3">
                <pl.icon className={cn("w-4 h-4 flex-shrink-0", pl.color)} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[9px] text-slate-500">{pl.label}</span>
                    <span className="font-mono text-[9px] text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", pl.color.replace("text-", "bg-").replace("-400", "-500") + "/40")}
                      style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </HudCard>

        {/* Posts by business */}
        <HudCard>
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-4">Content by Business</p>
          {BUSINESSES.map(biz => {
            const count = bizCounts[biz.value] || 0;
            const max = Math.max(...Object.values(bizCounts), 1);
            return (
              <div key={biz.value} className="flex items-center gap-3 mb-3">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0 border", biz.bg)} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[9px] text-slate-500">{biz.label}</span>
                    <span className="font-mono text-[9px] text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", biz.color.replace("text-", "bg-") + "/40")}
                      style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Platform connections */}
          <div className="mt-6 pt-4 border-t border-slate-900">
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Platform Connections</p>
            {PLATFORMS.map(pl => (
              <div key={pl.value} className="flex items-center justify-between py-1.5 border-b border-slate-900 last:border-0">
                <div className="flex items-center gap-2">
                  <pl.icon className={cn("w-3.5 h-3.5", pl.color)} />
                  <span className="font-mono text-[10px] text-slate-500">{pl.label}</span>
                </div>
                <span className="font-mono text-[9px] text-amber-700 border border-amber-800/40 px-1.5 py-0.5 rounded-sm">Not connected</span>
              </div>
            ))}
            <p className="font-mono text-[8px] text-slate-700 mt-2">Connect via each platform&apos;s Business API to enable auto-posting</p>
          </div>
        </HudCard>
      </div>
    </div>
  );
}

// ─── Autopilot Tab ───────────────────────────────────────────────────────────

const DEFAULT_TOPICS: Record<string, string[]> = {
  NATES_GYM_SERVICES: [
    "Why gym equipment maintenance matters",
    "5 signs your gym needs a fitout",
    "Equipment rental vs buying: what gym owners need to know",
    "How to design a gym members love",
    "Common gym maintenance mistakes",
  ],
  FITVEND_GLOBAL: [
    "How gyms earn passive income with vending",
    "Top protein snacks gym members buy",
    "Zero cost, real revenue: vending machine partnerships",
    "Why smart gyms are adding vending",
    "Vending machine ROI for gym owners",
  ],
  FIT_ATLAS: [
    "Find the perfect gym near you",
    "Why gym access memberships beat single-gym memberships",
    "Top gyms to discover in your city",
    "How Fit Atlas helps travellers stay fit",
    "List your gym and get more members",
  ],
};

function AutopilotTab({ onPostsCreated }: { onPostsCreated: (posts: MarketingPost[]) => void }) {
  const [selectedBiz, setSelectedBiz] = useState<string[]>(["NATES_GYM_SERVICES", "FITVEND_GLOBAL", "FIT_ATLAS"]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "linkedin"]);
  const [topics, setTopics] = useState<Record<string, string[]>>(DEFAULT_TOPICS);
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [newTopic, setNewTopic] = useState<Record<string, string>>({});

  function toggleBiz(b: string) {
    setSelectedBiz(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  }
  function togglePlatform(p: string) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }
  function addTopic(biz: string) {
    const t = newTopic[biz]?.trim();
    if (!t) return;
    setTopics(prev => ({ ...prev, [biz]: [...(prev[biz] || []), t] }));
    setNewTopic(prev => ({ ...prev, [biz]: "" }));
  }
  function removeTopic(biz: string, idx: number) {
    setTopics(prev => ({ ...prev, [biz]: prev[biz].filter((_, i) => i !== idx) }));
  }

  async function runAutopilot() {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/marketing/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businesses: selectedBiz,
          platforms: selectedPlatforms,
          topicBanks: topics,
          postsPerDay,
        }),
      });
      const data = await res.json();
      if (data.posts) { onPostsCreated(data.posts); setResult({ count: data.count }); }
    } finally { setGenerating(false); }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <HudCard className="border-cyan-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm text-cyan-300 tracking-wide mb-1">Content Autopilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              JARVIS generates a full week of content across all your businesses and platforms,
              then schedules every post at optimal times — starting next Monday.
            </p>
          </div>
        </div>
      </HudCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <HudCard>
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Businesses</p>
            <div className="space-y-2">
              {BUSINESSES.map(b => (
                <button key={b.value} onClick={() => toggleBiz(b.value)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 border rounded-sm transition-all text-xs font-mono",
                    selectedBiz.includes(b.value) ? `${b.bg} ${b.color}` : "border-slate-800 text-slate-600 hover:border-slate-600")}>
                  <div className={cn("w-3 h-3 rounded-sm border flex items-center justify-center",
                    selectedBiz.includes(b.value) ? "border-current bg-current/20" : "border-slate-700")}>
                    {selectedBiz.includes(b.value) && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                  </div>
                  {b.label}
                </button>
              ))}
            </div>
          </HudCard>

          <HudCard>
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const Icon = p.icon;
                const sel = selectedPlatforms.includes(p.value);
                return (
                  <button key={p.value} onClick={() => togglePlatform(p.value)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border rounded-sm transition-all",
                      sel ? `${p.border} ${p.color} bg-white/5` : "border-slate-800 text-slate-600 hover:border-slate-600")}>
                    <Icon className="w-3 h-3" />{p.label}
                  </button>
                );
              })}
            </div>
          </HudCard>

          <HudCard>
            <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Posts per Day</p>
            <div className="flex gap-2">
              {[2, 3, 5].map(n => (
                <button key={n} onClick={() => setPostsPerDay(n)}
                  className={cn("flex-1 py-2 text-sm font-mono border rounded-sm transition-all",
                    postsPerDay === n ? "border-cyan-500/60 text-cyan-400 bg-cyan-500/10" : "border-slate-800 text-slate-600 hover:border-slate-600")}>
                  {n}/day
                </button>
              ))}
            </div>
            <p className="font-mono text-[9px] text-slate-700 mt-2">{postsPerDay * 7} total posts for the week</p>
          </HudCard>

          <button onClick={runAutopilot} disabled={generating || !selectedBiz.length || !selectedPlatforms.length}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Bot className={cn("w-5 h-5", generating && "animate-pulse")} />
            {generating ? `Generating ${postsPerDay * 7} posts...` : "Run Autopilot — Generate Full Week"}
          </button>

          {result && (
            <HudCard className="border-emerald-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-mono text-xs text-emerald-300">{result.count} posts scheduled</p>
                  <p className="font-mono text-[9px] text-slate-600">Starting next Monday · check the Calendar tab</p>
                </div>
              </div>
            </HudCard>
          )}
        </div>

        {/* Topic banks */}
        <div className="space-y-4">
          <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest">Topic Banks</p>
          {BUSINESSES.filter(b => selectedBiz.includes(b.value)).map(biz => (
            <HudCard key={biz.value}>
              <p className={cn("font-mono text-[9px] uppercase tracking-widest mb-3", biz.color)}>{biz.label}</p>
              <div className="space-y-1.5 mb-3">
                {(topics[biz.value] || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
                    <span className="text-xs text-slate-400 flex-1">{t}</span>
                    <button onClick={() => removeTopic(biz.value, i)}
                      className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTopic[biz.value] || ""}
                  onChange={e => setNewTopic(prev => ({ ...prev, [biz.value]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addTopic(biz.value)}
                  placeholder="Add topic idea..."
                  className="flex-1 bg-black border border-slate-800 rounded-sm px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/40 placeholder-slate-700"
                />
                <button onClick={() => addTopic(biz.value)}
                  className="px-2 py-1.5 border border-slate-800 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/40 rounded-sm transition-all">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </HudCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Enroll Modal ─────────────────────────────────────────────────────────────

function EnrollModal({ sequenceId, onClose, onDone }: { sequenceId: string; onClose: () => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function enroll() {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/marketing/sequences/${sequenceId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      onDone();
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <HudCard className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-xs text-cyan-300 tracking-wide">Enroll in Sequence</p>
          <button onClick={onClose} className="text-slate-700 hover:text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1.5">Email *</p>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              placeholder="contact@email.com"
              className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60 placeholder-slate-700" />
          </div>
          <div>
            <p className="font-mono text-[9px] text-cyan-600 uppercase mb-1.5">Name</p>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="First name"
              className="w-full bg-black border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60 placeholder-slate-700" />
          </div>
          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
          <button onClick={enroll} disabled={loading || !email}
            className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-xs tracking-widest uppercase rounded-sm hover:bg-cyan-500/20 disabled:opacity-40 transition-all">
            <UserPlus className="w-3.5 h-3.5" />
            {loading ? "Enrolling..." : "Enroll Contact"}
          </button>
        </div>
      </HudCard>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "generate",  label: "AI GENERATE",  icon: Sparkles    },
  { id: "calendar",  label: "CALENDAR",     icon: Calendar    },
  { id: "sequences", label: "SEQUENCES",    icon: Mail        },
  { id: "virallab",  label: "VIRAL LAB",    icon: TrendingUp  },
  { id: "autopilot", label: "AUTOPILOT",    icon: Bot         },
  { id: "metrics",   label: "METRICS",      icon: BarChart2   },
];

export function MarketingClient({
  initialPosts,
  initialSequences,
}: {
  initialPosts: MarketingPost[];
  initialSequences: EmailSequenceWithSteps[];
}) {
  const [tab, setTab] = useState<Tab>("generate");
  const [posts, setPosts] = useState<MarketingPost[]>(initialPosts);
  const [sequences, setSequences] = useState<EmailSequenceWithSteps[]>(initialSequences);

  function handleSavePost(post: MarketingPost) {
    setPosts(prev => [post, ...prev]);
  }

  function handleUpdatePost(updated: MarketingPost) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function handleDeletePost(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  function handleAddSequence(seq: EmailSequenceWithSteps) {
    setSequences(prev => [seq, ...prev]);
  }

  function handleAutopilotPosts(newPosts: MarketingPost[]) {
    setPosts(prev => [...newPosts, ...prev]);
  }

  const totalScheduled = posts.filter(p => p.status === "SCHEDULED").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="absolute left-6 w-1 h-8 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0" />
            <h1 className="font-mono text-2xl font-bold tracking-[0.1em] text-cyan-300 text-glow">MARKETING ENGINE</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-700 uppercase">
            Automated content · Viral optimization · Email sequences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalScheduled > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-cyan-500/30 bg-cyan-500/5 rounded-sm">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-xs text-cyan-400">{totalScheduled} scheduled</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-800 border border-cyan-900/40 px-2 py-1 rounded-sm">
            <Target className="w-3 h-3" />
            {posts.length} posts total
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border border-cyan-500/20 rounded-sm overflow-hidden mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-mono tracking-[0.15em] uppercase transition-all border-r border-cyan-500/20 last:border-r-0",
              tab === id
                ? "bg-cyan-500/10 text-cyan-300 border-b-2 border-b-cyan-400"
                : "text-cyan-800 hover:text-cyan-600 hover:bg-cyan-500/5"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "generate"  && <GenerateTab onSave={handleSavePost} />}
      {tab === "calendar"  && <CalendarTab posts={posts} onUpdate={handleUpdatePost} onDelete={handleDeletePost} />}
      {tab === "sequences" && <SequencesTab sequences={sequences} onAdd={handleAddSequence} />}
      {tab === "virallab"  && <ViralLabTab />}
      {tab === "autopilot" && <AutopilotTab onPostsCreated={handleAutopilotPosts} />}
      {tab === "metrics"   && <MetricsTab posts={posts} />}
    </div>
  );
}
