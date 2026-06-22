"use client";

import { useState } from "react";
import { type Campaign } from "@prisma/client";
import { Plus, Sparkles, Send, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_LABELS } from "@/lib/utils";

type CampaignWithCount = Campaign & { _count: { contacts: number } };

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SCHEDULED: "bg-yellow-100 text-yellow-700",
  SENDING: "bg-blue-100 text-blue-700",
  SENT: "bg-green-100 text-green-700",
  PAUSED: "bg-orange-100 text-orange-700",
};

const BUSINESSES = [
  { value: "NATES_GYM_SERVICES", label: "Nate's Gym Services" },
  { value: "FITVEND_GLOBAL", label: "FitVend Global" },
  { value: "FIT_ATLAS", label: "Fit Atlas" },
];

export function CampaignsClient({ initialCampaigns }: { initialCampaigns: CampaignWithCount[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business: "NATES_GYM_SERVICES",
    name: "",
    subject: "",
    body: "",
    target: "",
    objective: "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function generateContent() {
    if (!form.target || !form.objective) { alert("Fill in target audience and objective first"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", business: BUSINESS_LABELS[form.business as keyof typeof BUSINESS_LABELS], target: form.target, objective: form.objective }),
      });
      const data = await res.json();
      setForm((f) => ({ ...f, subject: data.subject, body: data.body }));
    } finally {
      setGenerating(false);
    }
  }

  async function saveCampaign() {
    if (!form.name || !form.subject || !form.body) { alert("Fill in name, subject and body"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business: form.business, name: form.name, subject: form.subject, body: form.body }),
      });
      if (res.ok) {
        const c = await res.json();
        setCampaigns((prev) => [{ ...c, _count: { contacts: 0 } }, ...prev]);
        setShowCreate(false);
        setForm({ business: "NATES_GYM_SERVICES", name: "", subject: "", body: "", target: "", objective: "" });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {!showCreate && (
        <div className="flex gap-3 mb-6">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </div>
      )}

      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Create Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Business</label>
                <select value={form.business} onChange={(e) => set("business", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {BUSINESSES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Name</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Gym Owner Outreach Q3" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI Content Generator
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Target Audience</label>
                  <input value={form.target} onChange={(e) => set("target", e.target.value)} placeholder="e.g. Gym owners in Brisbane" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Objective</label>
                  <input value={form.objective} onChange={(e) => set("objective", e.target.value)} placeholder="e.g. Book a free equipment audit" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                </div>
              </div>
              <Button onClick={generateContent} disabled={generating} variant="outline" size="sm" className="mt-3">
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? "Generating…" : "Generate Email Content"}
              </Button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Line</label>
              <input value={form.subject} onChange={(e) => set("subject", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Body</label>
              <textarea rows={8} value={form.body} onChange={(e) => set("body", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={saveCampaign} disabled={saving}>
                <FileText className="w-4 h-4" />
                {saving ? "Saving…" : "Save as Draft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {campaigns.length === 0 && (
          <Card className="p-10 text-center">
            <Send className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No campaigns yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first campaign to start outreach</p>
          </Card>
        )}
        {campaigns.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{c.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{c.subject}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {BUSINESS_LABELS[c.business]} · {c._count.contacts} contacts
                </p>
              </div>
              {c.status === "DRAFT" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Send className="w-3.5 h-3.5" /> Schedule
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
