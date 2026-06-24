"use client";

import { useState } from "react";
import { RefreshCw, Mail, Clock, Zap, Brain, Send, CheckCircle, AlertCircle, User } from "lucide-react";
import { formatRelativeTime, BUSINESS_LABELS } from "@/lib/utils";

type ThreadRow = {
  id: string;
  gmailId: string;
  subject: string | null;
  snippet: string | null;
  participants: string[];
  messageCount: number;
  lastMessageAt: Date | string | null;
  lastSenderEmail: string | null;
  aiAnalyzed: boolean;
  isLead: boolean | null;
  needsFollowUp: boolean;
  aiSummary: string | null;
  followUpDraft: string | null;
  lastRepliedAt: Date | string | null;
  lead: { id: string; name: string; business: string } | null;
};

interface GmailClientProps {
  initialThreads: ThreadRow[];
  lastSyncedAt: Date | null;
  unanalyzedCount: number;
}

export function GmailClient({ initialThreads, lastSyncedAt, unanalyzedCount: initialUnanalyzed }: GmailClientProps) {
  const [threads, setThreads]           = useState(initialThreads);
  const [syncing, setSyncing]           = useState(false);
  const [analyzing, setAnalyzing]       = useState(false);
  const [syncedAt, setSyncedAt]         = useState(lastSyncedAt);
  const [search, setSearch]             = useState("");
  const [activeThread, setActiveThread] = useState<ThreadRow | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [sending, setSending]           = useState(false);
  const [toast, setToast]               = useState<string | null>(null);
  const [unanalyzed, setUnanalyzed]     = useState(initialUnanalyzed);
  const [analyzeStats, setAnalyzeStats] = useState<{ leadsCreated: number; followUpsQueued: number } | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function refreshThreads() {
    const data = await fetch("/api/gmail/threads").then((r) => r.json());
    setThreads(data.threads);
    const stats = await fetch("/api/gmail/analyze").then((r) => r.json());
    setUnanalyzed(stats.unanalyzed ?? 0);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      if (!res.ok) { showToast("Sync failed — check Gmail connection"); return; }
      const { synced } = await res.json();
      await refreshThreads();
      setSyncedAt(new Date());
      showToast(`✓ ${synced} threads synced`);
    } finally {
      setSyncing(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeStats(null);
    try {
      const res = await fetch("/api/gmail/analyze", { method: "POST" });
      if (!res.ok) { showToast("Analysis failed"); return; }
      const data = await res.json();
      await refreshThreads();
      setAnalyzeStats(data);
      if (data.message) {
        showToast(data.message);
      } else {
        showToast(`✓ ${data.analyzed} analyzed · ${data.leadsCreated} leads created · ${data.followUpsQueued} follow-ups queued`);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSendFollowUp() {
    if (!activeThread || !editingDraft) return;
    setSending(true);
    try {
      const res = await fetch("/api/gmail/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: activeThread.id, body: editingDraft }),
      });
      if (!res.ok) { showToast("Send failed"); return; }
      showToast("✓ Follow-up sent!");
      setActiveThread(null);
      await refreshThreads();
    } finally {
      setSending(false);
    }
  }

  const filtered = threads.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.subject?.toLowerCase().includes(q) || t.participants.some((p) => p.toLowerCase().includes(q));
  });

  const followUpCount = threads.filter((t) => t.needsFollowUp).length;
  const leadCount     = threads.filter((t) => t.isLead).length;

  return (
    <div className="flex flex-col gap-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 font-mono text-xs bg-cyan-950 border border-cyan-400/50 text-cyan-300 px-4 py-2.5 shadow-lg shadow-cyan-500/20">
          {toast}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Threads", value: threads.length, color: "text-cyan-400"    },
          { label: "Leads Found",   value: leadCount,      color: "text-emerald-400" },
          { label: "Follow-ups",    value: followUpCount,  color: "text-amber-400"   },
        ].map((s) => (
          <div key={s.label} className="border border-cyan-500/20 bg-black/50 px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-700 uppercase mb-1">{s.label}</p>
            <p className={`font-sans text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-700" />
          <input
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-cyan-500/25 text-cyan-200 placeholder-cyan-800 font-mono text-xs focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 border border-cyan-500/40 bg-black/60 font-mono text-[11px] tracking-widest text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 transition-all uppercase disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync"}
        </button>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || unanalyzed === 0}
          className="flex items-center gap-2 px-4 py-2 border border-violet-500/50 bg-violet-950/30 font-mono text-[11px] tracking-widest text-violet-300 hover:border-violet-400 hover:bg-violet-950/50 transition-all uppercase disabled:opacity-40"
        >
          <Brain className={`w-3.5 h-3.5 ${analyzing ? "animate-pulse" : ""}`} />
          {analyzing ? "Analyzing..." : `AI Analyze${unanalyzed > 0 ? ` (${unanalyzed})` : ""}`}
        </button>
      </div>

      {syncedAt && (
        <p className="font-mono text-[10px] text-cyan-800 tracking-wider -mt-2">
          Last synced {formatRelativeTime(syncedAt)}
        </p>
      )}

      {/* Follow-up panel */}
      {activeThread && (
        <div className="border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs tracking-widest text-amber-300 uppercase font-semibold">
                Draft Follow-up — {activeThread.subject}
              </span>
            </div>
            <button onClick={() => setActiveThread(null)} className="font-mono text-[10px] text-cyan-700 hover:text-cyan-400">
              CLOSE ×
            </button>
          </div>
          <textarea
            value={editingDraft}
            onChange={(e) => setEditingDraft(e.target.value)}
            rows={6}
            className="w-full bg-black/60 border border-amber-500/25 text-cyan-200 font-mono text-xs p-3 focus:outline-none focus:border-amber-400/50 resize-none"
            placeholder="Edit the draft follow-up..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSendFollowUp}
              disabled={sending || !editingDraft.trim()}
              className="flex items-center gap-2 px-5 py-2 border border-emerald-500/50 bg-emerald-950/30 font-mono text-[11px] tracking-widest text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/50 transition-all uppercase disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Sending..." : "Send Reply"}
            </button>
            <button
              onClick={() => setActiveThread(null)}
              className="px-4 py-2 border border-cyan-500/25 font-mono text-[11px] tracking-widest text-cyan-700 hover:text-cyan-400 transition-all uppercase"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      {threads.length === 0 ? (
        <div className="border border-cyan-500/20 bg-black/60 flex flex-col items-center justify-center py-16 gap-3">
          <Mail className="w-8 h-8 text-cyan-800" />
          <p className="font-mono text-xs text-cyan-700 tracking-widest uppercase">No transmissions received</p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="font-mono text-[11px] text-cyan-500 hover:text-cyan-300 border border-cyan-500/30 px-5 py-1.5 hover:border-cyan-400/50 transition-all tracking-widest"
          >
            {syncing ? "Syncing..." : "Sync Gmail Now"}
          </button>
        </div>
      ) : (
        <div className="border border-cyan-500/15 bg-black/40 divide-y divide-cyan-500/10">
          {filtered.map((thread) => (
            <div
              key={thread.id}
              className={`flex items-start gap-3 px-5 py-4 hover:bg-cyan-950/20 transition-colors ${
                thread.needsFollowUp ? "border-l-2 border-amber-500/60" : ""
              }`}
            >
              {/* Status dot */}
              <div className="mt-1.5 shrink-0">
                {!thread.aiAnalyzed ? (
                  <div className="w-2 h-2 rounded-full bg-cyan-700/50" title="Not yet analyzed" />
                ) : thread.isLead ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-400" title="Lead detected" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-cyan-900" title="Not a lead" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-white font-semibold truncate leading-snug">
                      {thread.subject ?? "(No subject)"}
                    </p>
                    {thread.aiSummary ? (
                      <p className="font-mono text-[11px] text-cyan-500 mt-0.5 truncate">{thread.aiSummary}</p>
                    ) : thread.snippet ? (
                      <p className="font-mono text-[11px] text-cyan-700 mt-0.5 truncate">{thread.snippet}</p>
                    ) : null}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {thread.lastMessageAt && (
                      <span className="font-mono text-[10px] text-cyan-700 whitespace-nowrap">
                        {formatRelativeTime(thread.lastMessageAt)}
                      </span>
                    )}
                    {thread.messageCount > 1 && (
                      <span className="font-mono text-[9px] bg-cyan-950 border border-cyan-500/25 text-cyan-500 px-1.5 py-0.5">
                        {thread.messageCount} msgs
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {thread.participants[0] && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-700" />
                      <span className="font-mono text-[10px] text-cyan-600 truncate max-w-[180px]">
                        {thread.participants[0]}
                      </span>
                    </div>
                  )}

                  {thread.lead && (
                    <span className="font-mono text-[10px] text-emerald-500 border border-emerald-500/30 px-2 py-0.5">
                      ↳ {thread.lead.name}
                    </span>
                  )}

                  {thread.isLead && !thread.lead && (
                    <span className="font-mono text-[10px] text-emerald-600 border border-emerald-700/30 px-2 py-0.5">
                      ✓ Lead auto-created
                    </span>
                  )}

                  {thread.needsFollowUp && (
                    <button
                      onClick={() => {
                        const draftText = thread.followUpDraft
                          ? thread.followUpDraft.replace(/^Subject:.*\n\n/, "")
                          : "";
                        setEditingDraft(draftText);
                        setActiveThread(thread);
                      }}
                      className="flex items-center gap-1 font-mono text-[10px] text-amber-400 border border-amber-500/40 px-2 py-0.5 hover:bg-amber-950/30 transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      Follow up
                    </button>
                  )}

                  {thread.lastRepliedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="font-mono text-[10px] text-emerald-700">
                        Replied {formatRelativeTime(thread.lastRepliedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
