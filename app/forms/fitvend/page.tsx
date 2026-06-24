"use client";
import { useState } from "react";
import { CheckCircle, Zap, TrendingUp } from "lucide-react";

const GYM_SIZES = ["Under 100 members", "100–300 members", "300–500 members", "500–1000 members", "1000+ members"];
const GYM_TYPES = ["Commercial gym", "Boutique studio", "CrossFit box", "Council/leisure centre", "Hotel gym", "Corporate gym", "Other"];

export default function FitVendForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", gymName: "", gymType: "", gymSize: "", location: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: "FITVEND_GLOBAL",
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.gymName,
          message: `Gym type: ${form.gymType}\nGym size: ${form.gymSize}\nLocation: ${form.location}\n\n${form.message}`,
          category: "VENDING_PARTNERSHIP",
          source: "INBOUND_WEBSITE",
        }),
      });
      setDone(true);
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-400/70 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl" />
          </div>
          <h2 className="font-mono text-2xl font-bold text-cyan-300 tracking-wide mb-3">Application Received</h2>
          <p className="text-slate-400 mb-2">Thanks, <span className="text-white">{form.name}</span>.</p>
          <p className="text-slate-500 text-sm">We&apos;ll review your gym details and reach out within 48 hours with a revenue projection.</p>
          <div className="mt-8 text-[10px] font-mono text-slate-700 tracking-widest">FITVEND GLOBAL · FUEL YOUR FITNESS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-400/70 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl animate-pulse" />
          </div>
          <h1 className="font-mono text-3xl font-bold text-white tracking-wide mb-2">FitVend Global</h1>
          <p className="text-slate-400 text-sm">Turn your gym&apos;s dead space into passive income — zero upfront cost</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            {["$0 upfront", "Revenue share", "We handle everything"].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-700">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative border border-cyan-500/20 bg-black/60 rounded-sm p-8">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />

          <p className="font-mono text-[9px] tracking-[0.25em] text-cyan-600 uppercase mb-6">Partnership Application</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Your Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono"
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Gym Name *</label>
                <input required value={form.gymName} onChange={e => set("gymName", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono"
                  placeholder="Iron Temple Gym" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono"
                  placeholder="owner@gym.com" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono"
                  placeholder="04XX XXX XXX" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Location</label>
              <input value={form.location} onChange={e => set("location", e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono"
                placeholder="e.g. Sydney CBD, NSW" />
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Gym Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {GYM_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => set("gymType", t)}
                    className={`text-left px-3 py-2 text-xs font-mono border rounded-sm transition-all ${
                      form.gymType === t
                        ? "border-cyan-500/60 text-cyan-300 bg-cyan-500/10"
                        : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Approximate Membership Size</label>
              <div className="grid grid-cols-2 gap-2">
                {GYM_SIZES.map(s => (
                  <button key={s} type="button" onClick={() => set("gymSize", s)}
                    className={`text-left px-3 py-2 text-xs font-mono border rounded-sm transition-all ${
                      form.gymSize === s
                        ? "border-cyan-500/60 text-cyan-300 bg-cyan-500/10"
                        : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Anything else?</label>
              <textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 font-mono resize-none"
                placeholder="Any specific areas you'd like machines placed, existing vending setups, etc." />
            </div>

            <button type="submit" disabled={loading || !form.name || !form.email || !form.gymType}
              className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <Zap className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Submitting..." : "Apply for Partnership"}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[9px] text-slate-700 mt-6 tracking-widest">
          FITVEND GLOBAL · FUEL YOUR FITNESS · fitvend.com.au
        </p>
      </div>
    </div>
  );
}
