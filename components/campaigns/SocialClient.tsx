"use client";

import { useState } from "react";
import { type SocialPost } from "@prisma/client";
import { Sparkles, Instagram, Linkedin, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_LABELS } from "@/lib/utils";

const BUSINESSES = [
  { value: "NATES_GYM_SERVICES", label: "Nate's Gym Services" },
  { value: "FITVEND_GLOBAL", label: "FitVend Global" },
  { value: "FIT_ATLAS", label: "Fit Atlas" },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  DRAFT: <Clock className="w-4 h-4 text-slate-400" />,
  PENDING_APPROVAL: <Clock className="w-4 h-4 text-yellow-500" />,
  APPROVED: <CheckCircle className="w-4 h-4 text-green-500" />,
  SCHEDULED: <Clock className="w-4 h-4 text-blue-500" />,
  POSTED: <CheckCircle className="w-4 h-4 text-green-600" />,
  REJECTED: <XCircle className="w-4 h-4 text-red-500" />,
};

export function SocialClient({ initialPosts }: { initialPosts: SocialPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business: "NATES_GYM_SERVICES",
    platform: "INSTAGRAM",
    topic: "",
    content: "",
    hashtags: [] as string[],
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function generate() {
    if (!form.topic) { alert("Enter a topic first"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social",
          business: BUSINESS_LABELS[form.business as keyof typeof BUSINESS_LABELS],
          platform: form.platform.toLowerCase(),
          topic: form.topic,
        }),
      });
      const data = await res.json();
      setForm((f) => ({ ...f, content: data.content, hashtags: data.hashtags ?? [] }));
    } finally {
      setGenerating(false);
    }
  }

  async function savePost() {
    if (!form.content) { alert("Generate or write content first"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business: form.business, platform: form.platform, content: form.content }),
      });
      if (res.ok) {
        const p = await res.json();
        setPosts((prev) => [p, ...prev]);
        setShowCreate(false);
        setForm({ business: "NATES_GYM_SERVICES", platform: "INSTAGRAM", topic: "", content: "", hashtags: [] });
      }
    } finally {
      setSaving(false);
    }
  }

  async function approvePost(id: string) {
    await fetch(`/api/social/${id}/approve`, { method: "POST" });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: "APPROVED" as const } : p));
  }

  return (
    <div>
      {!showCreate && (
        <Button onClick={() => setShowCreate(true)} className="mb-6">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      )}

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Create Social Post</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Business</label>
                <select value={form.business} onChange={(e) => set("business", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {BUSINESSES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Platform</label>
                <select value={form.platform} onChange={(e) => set("platform", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                <input value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Benefits of vending machines" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <Button onClick={generate} disabled={generating} variant="outline" size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? "Generating…" : "Generate with AI"}
            </Button>

            {form.content && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
                <textarea rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
                {form.hashtags.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">{form.hashtags.map((h) => `#${h}`).join(" ")}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={savePost} disabled={saving || !form.content}>
                {saving ? "Saving…" : "Save for Approval"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {posts.length === 0 && (
          <Card className="p-10 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No posts yet</p>
            <p className="text-sm text-slate-400 mt-1">Generate your first social post with AI</p>
          </Card>
        )}
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {post.platform === "INSTAGRAM"
                  ? <Instagram className="w-4 h-4 text-pink-500" />
                  : <Linkedin className="w-4 h-4 text-blue-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500">{BUSINESS_LABELS[post.business]}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <div className="flex items-center gap-1">
                    {STATUS_ICON[post.status]}
                    <span className="text-xs text-slate-500">{post.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
              </div>
              {post.status === "PENDING_APPROVAL" && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => approvePost(post.id)}>Approve</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
