"use client";
import { useState } from "react";
import { CheckCircle, Zap, MapPin } from "lucide-react";

type FormType = "list" | "access";

export default function FitAtlasForm() {
  const [formType, setFormType] = useState<FormType>("list");
  const [form, setForm] = useState({ name: "", email: "", phone: "", gymName: "", location: "", website: "", memberCount: "", message: "" });
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
          business: "FIT_ATLAS",
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.gymName || undefined,
          message: formType === "list"
            ? `List gym: ${form.gymName}\nLocation: ${form.location}\nWebsite: ${form.website}\nMembers: ${form.memberCount}\n\n${form.message}`
            : `Membership access request\nLocation: ${form.location}\n\n${form.message}`,
          category: formType === "list" ? "GYM_LISTING" : "MEMBERSHIP_ACCESS",
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
            <div className="w-20 h-20 rounded-full border-2 border-violet-400/70 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-violet-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-violet-400/10 blur-xl" />
          </div>
          <h2 className="font-mono text-2xl font-bold text-violet-300 tracking-wide mb-3">
            {formType === "list" ? "Listing Submitted" : "Request Received"}
          </h2>
          <p className="text-slate-400 mb-2">Thanks, <span className="text-white">{form.name}</span>.</p>
          <p className="text-slate-500 text-sm">
            {formType === "list"
              ? "We'll review your gym and have it live on Fit Atlas within 2–3 business days."
              : "We'll connect you with the best gym access option in your area shortly."}
          </p>
          <div className="mt-8 text-[10px] font-mono text-slate-700 tracking-widest">FIT ATLAS · FIND YOUR GYM</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-violet-400/70 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-violet-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-violet-400/10 blur-xl animate-pulse" />
          </div>
          <h1 className="font-mono text-3xl font-bold text-white tracking-wide mb-2">Fit Atlas</h1>
          <p className="text-slate-400 text-sm">Australia&apos;s gym discovery & access platform</p>
        </div>

        {/* Toggle */}
        <div className="flex border border-violet-500/20 rounded-sm overflow-hidden mb-6">
          {([["list", "List Your Gym"], ["access", "Get Gym Access"]] as [FormType, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setFormType(val)}
              className={`flex-1 py-2.5 text-xs font-mono tracking-widest uppercase transition-all ${
                formType === val
                  ? "bg-violet-500/10 text-violet-300 border-b-2 border-b-violet-400"
                  : "text-slate-600 hover:text-slate-400"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="relative border border-violet-500/20 bg-black/60 rounded-sm p-8">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-400/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-400/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-400/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-400/60" />

          <p className="font-mono text-[9px] tracking-[0.25em] text-violet-600 uppercase mb-6">
            {formType === "list" ? "Gym Listing Request" : "Membership Access Request"}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Your Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                  placeholder="Alex Johnson" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                  placeholder="alex@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                  placeholder="04XX XXX XXX" />
              </div>
              {formType === "list" ? (
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Gym Name *</label>
                  <input required={formType === "list"} value={form.gymName} onChange={e => set("gymName", e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                    placeholder="Power House Fitness" />
                </div>
              ) : (
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Suburb / City</label>
                  <input value={form.location} onChange={e => set("location", e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                    placeholder="e.g. Bondi Beach, NSW" />
                </div>
              )}
            </div>

            {formType === "list" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Location</label>
                    <input value={form.location} onChange={e => set("location", e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                      placeholder="Suburb, State" />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Approx. Members</label>
                    <input value={form.memberCount} onChange={e => set("memberCount", e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                      placeholder="e.g. 250" />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">Website</label>
                  <input type="url" value={form.website} onChange={e => set("website", e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono"
                    placeholder="https://yourgym.com.au" />
                </div>
              </>
            )}

            <div>
              <label className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block mb-1.5">
                {formType === "list" ? "Anything to highlight about your gym?" : "What are you looking for?"}
              </label>
              <textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-sm px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/60 font-mono resize-none"
                placeholder={formType === "list"
                  ? "Specialisations, equipment, class schedule, opening hours..."
                  : "Training goals, preferred times, any specific equipment needs..."} />
            </div>

            <button type="submit" disabled={loading || !form.name || !form.email}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-500/10 border border-violet-500/40 text-violet-300 font-mono text-sm tracking-widest uppercase rounded-sm hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <Zap className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Submitting..." : formType === "list" ? "Submit My Gym" : "Find My Gym"}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[9px] text-slate-700 mt-6 tracking-widest">
          FIT ATLAS · AUSTRALIA&apos;S GYM DISCOVERY PLATFORM
        </p>
      </div>
    </div>
  );
}
