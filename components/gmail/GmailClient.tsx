"use client";

import { useState } from "react";
import { type EmailThread, type Lead } from "@prisma/client";
import { RefreshCw, Mail, User, Clock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRelativeTime, BUSINESS_LABELS } from "@/lib/utils";

type ThreadWithLead = EmailThread & {
  lead: Pick<Lead, "id" | "name" | "business"> | null;
};

interface GmailClientProps {
  initialThreads: ThreadWithLead[];
  lastSyncedAt: Date | null;
}

export function GmailClient({ initialThreads, lastSyncedAt }: GmailClientProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState(lastSyncedAt);
  const [search, setSearch] = useState("");

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        alert("Sync failed: " + err.error);
        return;
      }
      const { synced } = await res.json();
      const data = await fetch("/api/gmail/threads").then((r) => r.json());
      setThreads(data.threads);
      setSyncedAt(new Date());
      alert(`Synced ${synced} threads`);
    } finally {
      setSyncing(false);
    }
  }

  const filtered = threads.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.subject?.toLowerCase().includes(q) || t.participants.some((p) => p.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Gmail"}
        </Button>
      </div>

      {syncedAt && (
        <p className="text-xs text-slate-400 mb-3">
          Last synced {formatRelativeTime(syncedAt)}
        </p>
      )}

      {threads.length === 0 && (
        <Card className="p-10 text-center">
          <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No emails synced yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Sync Gmail" to import your inbox threads</p>
          <Button onClick={handleSync} disabled={syncing} className="mt-4">
            {syncing ? "Syncing…" : "Sync Now"}
          </Button>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map((thread) => (
          <Card key={thread.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {thread.subject ?? "(No subject)"}
                  </p>
                  {thread.messageCount > 1 && (
                    <span className="shrink-0 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                      {thread.messageCount}
                    </span>
                  )}
                </div>
                {thread.snippet && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{thread.snippet}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{thread.participants.slice(0, 2).join(", ")}</span>
                  </div>
                  {thread.lastMessageAt && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(thread.lastMessageAt)}
                    </div>
                  )}
                </div>
              </div>
              {thread.lead ? (
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <Link2 className="w-3 h-3" />
                    {thread.lead.name}
                  </div>
                  <p className="text-xs text-slate-400">{BUSINESS_LABELS[thread.lead.business]}</p>
                </div>
              ) : (
                <button className="shrink-0 text-xs text-slate-400 hover:text-blue-600 transition-colors">
                  Link lead
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
