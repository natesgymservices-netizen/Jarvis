"use client";
import { useState, useEffect } from "react";
import { Instagram, Linkedin, Twitter, Facebook, Play, CheckCircle, Copy, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Credential { platform: string; connected: boolean; pageId?: string; accountId?: string }

const PLATFORM_GUIDE = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-400",
    border: "border-pink-500/20",
    bg: "bg-pink-500/5",
    steps: [
      "Convert your Instagram account to a Professional/Business account",
      "Create a Meta Developer App at developers.facebook.com",
      "Add the Instagram Graph API product to your app",
      "Connect your Instagram Business account to a Facebook Page",
      "Generate a long-lived User Access Token",
      "Find your Instagram Business Account ID",
      "Paste both below when ready",
    ],
    fields: [{ key: "accessToken", label: "Access Token", placeholder: "EAAxxxxxxxx..." }, { key: "accountId", label: "Instagram Business Account ID", placeholder: "17841400..." }],
    link: "https://developers.facebook.com/docs/instagram-api/getting-started",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    steps: [
      "Create a LinkedIn Developer App at developer.linkedin.com",
      "Request access to the Marketing Developer Platform",
      "Add OAuth 2.0 redirect URL and get Client ID + Secret",
      "Use the OAuth flow to generate an access token with r_liteprofile, w_member_social scopes",
      "Get your LinkedIn Organization/Company ID from your Company Page URL",
      "Paste token and org ID below",
    ],
    fields: [{ key: "accessToken", label: "Access Token", placeholder: "AQxxxxxxxx..." }, { key: "accountId", label: "Organization ID", placeholder: "123456789" }],
    link: "https://learn.microsoft.com/en-us/linkedin/marketing/",
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: Twitter,
    color: "text-sky-400",
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    steps: [
      "Apply for a Twitter Developer account at developer.twitter.com",
      "Create a Project and App",
      "Enable OAuth 2.0 with read/write permissions",
      "Generate a Bearer Token and Access Token + Secret",
      "Set app permissions to 'Read and Write'",
    ],
    fields: [{ key: "accessToken", label: "Access Token", placeholder: "xxxxx-xxxx..." }, { key: "refreshToken", label: "Access Token Secret", placeholder: "xxxxxxxxxx..." }],
    link: "https://developer.twitter.com/en/docs/twitter-api",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "text-indigo-400",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/5",
    steps: [
      "Create a Meta Developer App at developers.facebook.com",
      "Add the Pages API product",
      "Generate a Page Access Token for your business page",
      "Get your Facebook Page ID (from Page Settings → About)",
      "Paste below — this is the same Meta app as Instagram if connected",
    ],
    fields: [{ key: "accessToken", label: "Page Access Token", placeholder: "EAAxxxxxxxx..." }, { key: "pageId", label: "Facebook Page ID", placeholder: "123456789012345" }],
    link: "https://developers.facebook.com/docs/pages-api",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: Play,
    color: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    steps: [
      "Apply for a TikTok Developer account at developers.tiktok.com",
      "Create an app and request Content Posting API access",
      "Generate an access token via the OAuth flow",
      "Note: TikTok API is in limited beta — approval may take weeks",
    ],
    fields: [{ key: "accessToken", label: "Access Token", placeholder: "act.xxxx..." }, { key: "accountId", label: "Open ID", placeholder: "MS4wLj..." }],
    link: "https://developers.tiktok.com/doc/content-posting-api-get-started",
  },
];

function PlatformCard({ guide, credential }: { guide: typeof PLATFORM_GUIDE[0]; credential?: Credential }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const Icon = guide.icon;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/marketing/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: guide.id, ...form }),
      });
      if (res.ok) { setSaved(true); setOpen(false); }
    } finally { setSaving(false); }
  }

  const isConnected = credential?.connected || saved;

  return (
    <div className={cn("relative border rounded-sm overflow-hidden", guide.border, isConnected ? "border-emerald-500/30" : "")}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current opacity-30" style={{ color: guide.color.replace("text-", "") }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-current opacity-30" style={{ color: guide.color.replace("text-", "") }} />

      <div className={cn("p-4 flex items-center justify-between cursor-pointer", guide.bg)} onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5", guide.color)} />
          <span className="font-mono text-sm text-white">{guide.label}</span>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <span className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 border border-emerald-600/40 px-2 py-1 rounded-sm">
              <CheckCircle className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="font-mono text-[9px] text-amber-700 border border-amber-800/40 px-2 py-1 rounded-sm">Not connected</span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </div>

      {open && (
        <div className="p-4 bg-black/60 border-t border-current/10 space-y-4">
          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Setup Steps</p>
              <a href={guide.link} target="_blank" rel="noopener noreferrer"
                className={cn("flex items-center gap-1 font-mono text-[9px] hover:underline", guide.color)}>
                Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-2.5 mb-1.5">
                <span className="font-mono text-[9px] text-slate-700 w-4 flex-shrink-0 pt-0.5">{i + 1}.</span>
                <p className="text-xs text-slate-500">{step}</p>
              </div>
            ))}
          </div>

          {/* Token fields */}
          <div className="space-y-3">
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Credentials</p>
            {guide.fields.map(field => (
              <div key={field.key}>
                <label className="font-mono text-[9px] text-slate-600 uppercase block mb-1">{field.label}</label>
                <input
                  type="password"
                  value={form[field.key] || ""}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/40 placeholder-slate-800"
                />
              </div>
            ))}
            <button onClick={save} disabled={saving || !form.accessToken}
              className={cn("w-full py-2 text-xs font-mono tracking-widest uppercase border rounded-sm transition-all disabled:opacity-40",
                guide.border, guide.color, guide.bg, "hover:opacity-80")}>
              {saving ? "Saving..." : "Save Credentials"}
            </button>
            <p className="font-mono text-[8px] text-slate-800">Credentials are stored in your private database. They are never logged or exposed via the API.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConnectPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);

  useEffect(() => {
    fetch("/api/marketing/credentials").then(r => r.json()).then(setCredentials).catch(() => {});
  }, []);

  function getCred(platform: string) {
    return credentials.find(c => c.platform === platform);
  }

  const connectedCount = credentials.filter(c => c.connected).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-[0.1em] text-cyan-300 mb-1">Platform Connections</h1>
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-700 uppercase">
            Connect platforms to enable automatic posting
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-cyan-400">{connectedCount}/5</p>
          <p className="font-mono text-[9px] text-slate-600">connected</p>
        </div>
      </div>

      {/* Form links */}
      <div className="mb-6 p-4 border border-cyan-500/15 bg-black/40 rounded-sm">
        <p className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mb-3">Lead Capture Form URLs — share these</p>
        {[
          { label: "Nate's Gym Services", path: "/forms/gym-services", color: "text-emerald-400" },
          { label: "FitVend Global", path: "/forms/fitvend", color: "text-cyan-400" },
          { label: "Fit Atlas", path: "/forms/fit-atlas", color: "text-violet-400" },
        ].map(f => (
          <div key={f.path} className="flex items-center gap-3 mb-2">
            <span className={cn("font-mono text-[10px] w-40 flex-shrink-0", f.color)}>{f.label}</span>
            <code className="text-[10px] text-slate-500 flex-1">localhost:3000{f.path}</code>
            <button onClick={() => navigator.clipboard.writeText(`localhost:3000${f.path}`)}
              className="text-slate-700 hover:text-cyan-400 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <Link href={f.path} target="_blank" className="text-slate-700 hover:text-cyan-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {PLATFORM_GUIDE.map(guide => (
          <PlatformCard key={guide.id} guide={guide} credential={getCred(guide.id)} />
        ))}
      </div>

      <div className="mt-6 p-4 border border-slate-800 rounded-sm">
        <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mb-2">Cron Job (auto-send email sequences)</p>
        <p className="text-xs text-slate-500 mb-2">Add this to vercel.json — it runs every hour to process due sequence emails:</p>
        <code className="block text-[10px] text-cyan-700 bg-black p-3 rounded-sm font-mono">
          {`{ "crons": [{ "path": "/api/cron/email-sequences", "schedule": "0 * * * *" }] }`}
        </code>
        <p className="font-mono text-[8px] text-slate-700 mt-2">Set CRON_SECRET env var in Vercel to secure the endpoint.</p>
      </div>
    </div>
  );
}
