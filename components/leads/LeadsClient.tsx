"use client";

import { useState, useTransition } from "react";
import { type Lead } from "@prisma/client";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime, BUSINESS_LABELS, STAGE_COLORS, SOURCE_LABELS } from "@/lib/utils";
import { LeadModal } from "./LeadModal";

type LeadWithCount = Lead & { _count: { activities: number } };

interface LeadsClientProps {
  initialLeads: LeadWithCount[];
}

const STAGES = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "NURTURE"] as const;
const BUSINESSES = ["ALL", "NATES_GYM_SERVICES", "FITVEND_GLOBAL", "FIT_ATLAS"] as const;

export function LeadsClient({ initialLeads }: LeadsClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [businessFilter, setBusinessFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [, startTransition] = useTransition();

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q);
    const matchStage = stageFilter === "ALL" || l.stage === stageFilter;
    const matchBusiness = businessFilter === "ALL" || l.business === businessFilter;
    return matchSearch && matchStage && matchBusiness;
  });

  async function refreshLeads() {
    const res = await fetch("/api/leads");
    if (res.ok) {
      const data = await res.json();
      startTransition(() => setLeads(data));
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {STAGES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Stages" : s}</option>)}
          </select>
          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {BUSINESSES.map((b) => (
              <option key={b} value={b}>
                {b === "ALL" ? "All Businesses" : BUSINESS_LABELS[b as keyof typeof BUSINESS_LABELS]}
              </option>
            ))}
          </select>
          <Button onClick={() => { setEditingLead(null); setShowModal(true); }} size="sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Stage Pill Filter (mobile-friendly quick filter) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              stageFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Business</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Source</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Stage</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Value</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Added</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {leads.length === 0 ? (
                      <div>
                        <p className="font-medium">No leads yet</p>
                        <p className="text-xs mt-1">Click "Add Lead" to get started</p>
                      </div>
                    ) : (
                      "No leads match your filters"
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => { setEditingLead(lead); setShowModal(true); }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{lead.name}</p>
                    {lead.email && <p className="text-xs text-slate-400 truncate max-w-[180px]">{lead.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell text-xs">
                    {BUSINESS_LABELS[lead.business]}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">
                    {SOURCE_LABELS[lead.source]}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[lead.stage]}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell font-medium">
                    {lead.value ? formatCurrency(lead.value) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                    {formatRelativeTime(lead.createdAt)}
                  </td>
                  <td className="px-2 py-3">
                    <ChevronDown className="w-4 h-4 text-slate-300 rotate-[-90deg]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <LeadModal
          lead={editingLead}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); refreshLeads(); }}
        />
      )}
    </>
  );
}
