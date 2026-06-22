"use client";

import { useState } from "react";
import { type Lead } from "@prisma/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BUSINESSES = [
  { value: "NATES_GYM_SERVICES", label: "Nate's Gym Services" },
  { value: "FITVEND_GLOBAL", label: "FitVend Global" },
  { value: "FIT_ATLAS", label: "Fit Atlas" },
];

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "NURTURE"];
const SOURCES = [
  { value: "EMAIL", label: "Email" },
  { value: "REFERRAL", label: "Referral" },
  { value: "SOCIAL_INSTAGRAM", label: "Instagram" },
  { value: "SOCIAL_LINKEDIN", label: "LinkedIn" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "INBOUND_WEBSITE", label: "Website" },
  { value: "WORD_OF_MOUTH", label: "Word of Mouth" },
  { value: "TRADE_SHOW", label: "Trade Show" },
  { value: "OTHER", label: "Other" },
];

const CATEGORIES = [
  { value: "CONSULTING", label: "Consulting" },
  { value: "EQUIPMENT_SALE", label: "Equipment Sale" },
  { value: "EQUIPMENT_RENTAL", label: "Equipment Rental" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "VENDING_PARTNERSHIP", label: "Vending Partnership" },
  { value: "GYM_LISTING", label: "Gym Listing" },
  { value: "MEMBERSHIP_ACCESS", label: "Membership Access" },
  { value: "OTHER", label: "Other" },
];

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSave: () => void;
}

export function LeadModal({ lead, onClose, onSave }: LeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: lead?.name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    company: lead?.company ?? "",
    business: lead?.business ?? "NATES_GYM_SERVICES",
    source: lead?.source ?? "OTHER",
    stage: lead?.stage ?? "NEW",
    category: lead?.category ?? "OTHER",
    value: lead?.value?.toString() ?? "",
    notes: lead?.notes ?? "",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form, value: form.value ? parseFloat(form.value) : null };
      const url = lead ? `/api/leads/${lead.id}` : "/api/leads";
      const method = lead ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      onSave();
    } catch (err) {
      alert("Failed to save lead");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!lead || !confirm("Delete this lead?")) return;
    setLoading(true);
    await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    setLoading(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <h2 className="font-semibold text-slate-900">{lead ? "Edit Lead" : "Add Lead"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
              <input value={form.company} onChange={(e) => set("company", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Value (AUD)</label>
              <input type="number" step="any" value={form.value} onChange={(e) => set("value", e.target.value)} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Business</label>
              <select value={form.business} onChange={(e) => set("business", e.target.value)} className="input-field">
                {BUSINESSES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stage</label>
              <select value={form.stage} onChange={(e) => set("stage", e.target.value)} className="input-field">
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)} className="input-field">
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {lead && (
              <button type="button" onClick={handleDelete} className="text-red-500 text-sm hover:text-red-700 mr-auto">
                Delete
              </button>
            )}
            <Button type="button" variant="outline" onClick={onClose} className="ml-auto">Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Lead"}</Button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s;
        }
        .input-field:focus {
          box-shadow: 0 0 0 2px #2563eb;
        }
      `}</style>
    </div>
  );
}
