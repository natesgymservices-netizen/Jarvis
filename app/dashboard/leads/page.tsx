import { prisma } from "@/lib/prisma";
import { LeadsClient } from "@/components/leads/LeadsClient";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { activities: true } },
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leads.length} total leads across all businesses</p>
        </div>
      </div>
      <LeadsClient initialLeads={leads} />
    </div>
  );
}
