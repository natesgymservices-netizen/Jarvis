import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { JarvisVoice } from "@/components/dashboard/JarvisVoice";
import { DollarSign, Users, TrendingUp, Mail, Clock, Target, Activity } from "lucide-react";
import { formatCurrency, formatRelativeTime, BUSINESS_LABELS, STAGE_COLORS } from "@/lib/utils";
import { startOfMonth, subMonths } from "date-fns";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const [
    totalLeads,
    activeLeads,
    revenueThisMonth,
    revenueLastMonth,
    wonLeads,
    recentLeads,
    leadsByBusiness,
    recentThreads,
    pipelineAgg,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: { notIn: ["WON", "LOST"] } } }),
    prisma.revenue.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
    prisma.revenue.aggregate({ _sum: { amount: true }, where: { date: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.lead.count({ where: { stage: "WON" } }),
    prisma.lead.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, company: true, stage: true, business: true, createdAt: true, value: true },
    }),
    prisma.lead.groupBy({ by: ["business"], _count: { id: true } }),
    prisma.emailThread.findMany({
      take: 6,
      orderBy: { lastMessageAt: "desc" },
      select: { id: true, subject: true, participants: true, lastMessageAt: true, lead: { select: { name: true } } },
    }),
    prisma.lead.aggregate({
      _sum: { value: true },
      where: { stage: { notIn: ["WON", "LOST"] }, value: { not: null } },
    }),
  ]);

  const thisMonth    = revenueThisMonth._sum.amount ?? 0;
  const lastMonth    = revenueLastMonth._sum.amount ?? 0;
  const revChange    = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  const convRate     = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const pipelineVal  = pipelineAgg._sum.value ?? 0;
  const greeting     = getGreeting();
  const rawFirst     = session?.user?.name?.split(" ")[0] ?? "Nathan";
  const firstName    = rawFirst.endsWith("'s") ? rawFirst.slice(0, -2) : rawFirst;

  return (
    <div className="flex flex-col min-h-screen p-6 gap-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px] tracking-[0.35em] text-cyan-600 uppercase">J.A.R.V.I.S. · All Systems Online</span>
          </div>
          <h1 className="font-sans text-4xl font-black text-white tracking-wide">
            Good {greeting},{" "}
            <span className="text-cyan-300" style={{ textShadow: "0 0 30px rgba(0,200,255,0.8), 0 0 60px rgba(0,200,255,0.3)" }}>
              {firstName}
            </span>
          </h1>
        </div>
        <JarvisVoice
          greeting={`Good ${greeting}, ${firstName}`}
          brief={buildBrief(activeLeads, totalLeads, thisMonth, wonLeads)}
        />
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <StatCard title="Revenue This Month"  value={formatCurrency(thisMonth)} change={`${revChange >= 0 ? "+" : ""}${revChange.toFixed(0)}% vs last month`} positive={revChange >= 0} icon={DollarSign} color="green"  />
        <StatCard title="Active Leads"         value={String(activeLeads)}       change={`${totalLeads} total in pipeline`}                                        positive={true}            icon={Users}      color="cyan"   />
        <StatCard title="Conversion Rate"      value={`${convRate}%`}            change={`${wonLeads} deals closed`}                                               positive={convRate >= 20}  icon={Target}     color="purple" />
        <StatCard title="Pipeline Value"       value={formatCurrency(pipelineVal)} change="across active deals"                                                    positive={true}            icon={TrendingUp} color="amber"  />
      </div>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 flex-1">

        {/* ── Leads Table ── 7 cols ──────────────────────────────── */}
        <div className="col-span-7 flex flex-col border border-cyan-500/20 bg-black/60 hud-corners overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/20 shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase font-semibold">Contact Intelligence</span>
            </div>
            <a href="/dashboard/leads" className="font-mono text-[10px] tracking-[0.2em] text-cyan-600 hover:text-cyan-400 uppercase transition-colors">
              View All →
            </a>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 px-5 py-2 border-b border-cyan-500/10 shrink-0">
            <span className="col-span-1 font-mono text-[9px] tracking-widest text-cyan-700 uppercase">#</span>
            <span className="col-span-4 font-mono text-[9px] tracking-widest text-cyan-700 uppercase">Contact</span>
            <span className="col-span-3 font-mono text-[9px] tracking-widest text-cyan-700 uppercase">Business Unit</span>
            <span className="col-span-2 font-mono text-[9px] tracking-widest text-cyan-700 uppercase">Value</span>
            <span className="col-span-2 font-mono text-[9px] tracking-widest text-cyan-700 uppercase text-right">Status</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Activity className="w-8 h-8 text-cyan-800" />
                <p className="font-mono text-sm text-cyan-700 tracking-widest uppercase">No contacts on record</p>
                <a href="/dashboard/leads" className="font-mono text-[11px] text-cyan-500 hover:text-cyan-300 tracking-wider border border-cyan-500/30 px-4 py-1.5 hover:border-cyan-400/50 transition-all">
                  + Initialize Database
                </a>
              </div>
            ) : (
              recentLeads.map((lead, i) => (
                <div
                  key={lead.id}
                  className="grid grid-cols-12 items-center px-5 py-4 border-b border-cyan-500/10 hover:bg-cyan-950/25 transition-colors group"
                >
                  <span className="col-span-1 font-mono text-xs text-cyan-800">{String(i + 1).padStart(2, "0")}</span>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 border border-cyan-500/30 bg-cyan-950/50 flex items-center justify-center font-mono text-sm text-cyan-400 font-bold shrink-0 group-hover:border-cyan-400/60 transition-colors">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-white font-semibold truncate">{lead.name}</p>
                      <p className="font-mono text-[10px] text-cyan-600 truncate">{lead.company ?? "—"}</p>
                    </div>
                  </div>
                  <span className="col-span-3 font-mono text-[11px] text-cyan-500 tracking-wide truncate">
                    {BUSINESS_LABELS[lead.business].split(" ")[0]}
                  </span>
                  <span className="col-span-2 font-mono text-sm text-emerald-400 font-semibold">
                    {lead.value ? formatCurrency(lead.value) : <span className="text-cyan-800">—</span>}
                  </span>
                  <div className="col-span-2 flex justify-end">
                    <span className={`font-mono text-[10px] px-2.5 py-1 tracking-[0.1em] uppercase border ${STAGE_COLORS[lead.stage]}`}>
                      {lead.stage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right column ── 5 cols ─────────────────────────────── */}
        <div className="col-span-5 flex flex-col gap-4">

          {/* Business Unit Distribution */}
          <div className="border border-cyan-500/20 bg-black/60 hud-corners overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-cyan-500/20">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase font-semibold">Business Units</span>
            </div>
            <div className="p-5 space-y-5">
              {[
                { key: "NATES_GYM_SERVICES", color: "bg-sky-400",    text: "text-sky-400"    },
                { key: "FITVEND_GLOBAL",     color: "bg-violet-400", text: "text-violet-400" },
                { key: "FIT_ATLAS",          color: "bg-amber-400",  text: "text-amber-400"  },
              ].map(({ key, color, text }) => {
                const unit = leadsByBusiness.find((b) => b.business === key);
                const count = unit?._count.id ?? 0;
                const pct   = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-white/70 tracking-wider">{BUSINESS_LABELS[key as keyof typeof BUSINESS_LABELS]}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${text}`}>{count}</span>
                        <span className="font-mono text-[10px] text-cyan-700">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%`, boxShadow: `0 0 8px currentColor` }}
                      />
                    </div>
                  </div>
                );
              })}
              {leadsByBusiness.length === 0 && (
                <p className="font-mono text-xs text-cyan-800 text-center py-2 tracking-widest">Awaiting data</p>
              )}
            </div>
          </div>

          {/* Comms — Gmail Threads */}
          <div className="flex-1 border border-cyan-500/20 bg-black/60 hud-corners overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/20 shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs tracking-[0.2em] text-cyan-300 uppercase font-semibold">Comms — Inbox</span>
              </div>
              <a href="/dashboard/gmail" className="font-mono text-[10px] tracking-[0.2em] text-cyan-600 hover:text-cyan-400 uppercase transition-colors">
                Open →
              </a>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recentThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <p className="font-mono text-xs text-cyan-700 tracking-wider">No transmissions received</p>
                  <a href="/dashboard/gmail" className="font-mono text-[10px] text-cyan-500 hover:text-cyan-300 border border-cyan-500/30 px-3 py-1 transition-all">
                    Sync Gmail
                  </a>
                </div>
              ) : (
                recentThreads.map((thread) => (
                  <div key={thread.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-cyan-500/10 hover:bg-cyan-950/25 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm text-white/80 truncate leading-snug">{thread.subject ?? "(No subject)"}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-cyan-700 shrink-0" />
                        <span className="font-mono text-[10px] text-cyan-700 tracking-wider">
                          {thread.lastMessageAt ? formatRelativeTime(thread.lastMessageAt) : "Unknown"}
                        </span>
                        {thread.lead && (
                          <>
                            <span className="text-cyan-800">·</span>
                            <span className="font-mono text-[10px] text-cyan-600 truncate">{thread.lead.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function buildBrief(activeLeads: number, totalLeads: number, revenue: number, wonLeads: number): string {
  const parts: string[] = ["All systems are online."];
  if (totalLeads === 0) {
    parts.push("Your pipeline is empty. Ready to log your first lead.");
  } else {
    parts.push(`You have ${activeLeads} active lead${activeLeads !== 1 ? "s" : ""} across your three business units.`);
  }
  if (revenue > 0) {
    parts.push(`Revenue this month stands at ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(revenue)}.`);
  } else {
    parts.push("No revenue recorded this month yet.");
  }
  if (wonLeads > 0) parts.push(`${wonLeads} deal${wonLeads !== 1 ? "s" : ""} closed to date.`);
  parts.push("Awaiting your command.");
  return parts.join(" ");
}
