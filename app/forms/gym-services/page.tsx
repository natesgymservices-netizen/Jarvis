"use client";
import { useState } from "react";
import { Wrench, CheckCircle, Zap } from "lucide-react";

const SERVICES = [
  "Gym Design & Consulting",
  "Equipment Sales",
  "Equipment Rental",
  "Equipment Maintenance",
  "Full Gym Fitout",
  "Other",
];

export default function GymServicesForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", service: "", message: "" });
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
          business: "NATES_GYM_SERVICES",
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message: `Service: ${form.service}\n\n${form.message}`,
          category: form.service.includes("Sale") ? "EQUIPMENT_SALE" :
                    form.service.includes("Rental") ? "EQUIPMENT_RENTAL" :
                    form.service.includes("Maintenance") ? "MAINTENANCE" : "CONSULTING",
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
            <div className="w-20 h-20 rounded-full border-2 border-emerald-400/70 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl" />
          </div>
          <h2 className="font-mono text-2xl font-bold text-emerald-300 tracking-wide mb-3">Request Received</h2>
          <p className="text-slate-400 mb-2">Thanks, <span className="text-white">{form.name}</span>.</p>
          <p className="text-slate-500 text-sm">Nate will be in touch within 24 hours to discuss your gym project.</p>
          <div className="mt-8 text-[10px] font-mono text-slate-700 tracking-widest">NATE&apos;S GYM SERVICES · AUSTRALIA</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-400/70 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl animate-pulse" />
          </div>
          <h1 className="font-mono text-3xl font-bold text-white tracking-wide mb-2">Nate&apos;s Gym Services</h1>
          <p className="text-slate-400 text-sm">Gym consulting, equipment & maintenance across Australia</p>
        </div>

        {/* Form */}
        <div className="relative border border-emerald-500/20 bg-black/60 rounded-sm p-8">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400/60" />

          <p className="font-mono text-[9px] tracking-[0.25em] text-emerald-600 uppercase mb-6">Get a Free Quote</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
                  placeholder="John Smith" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Gym / Company</label>
                <input value={form.company} onChange={e => set("company", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
                  placeholder="Fitness First CBD" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
                  placeholder="john@gym.com.au" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
                  placeholder="04XX XXX XXX" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Service Needed *</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map(s => (
                  <button key={s} type="button" onClick={() => set("service", s)}
                    className={`text-left px-3 py-2 text-xs font-mono border rounded-sm transition-all ${
                      form.service === s
                        ? "border-emerald-500/60 text-emerald-300 bg-emerald-500/10"
                        : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Tell us about your project</label>
              <textarea rows={4} value={form.message} onChange={e => set("message", e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors resize-none"
                placeholder="Size of your gym, current setup, what you're looking to achieve..." />
            </div>

            <button type="submit" disabled={loading || !form.name || !form.email || !form.service}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <Zap className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Submitting..." : "Request Free Quote"}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[9px] text-slate-700 mt-6 tracking-widest">
          NATE&apos;S GYM SERVICES · AUSTRALIA · natesgymservices@gmail.com
        </p>
      </div>
    </div>
  );
}
