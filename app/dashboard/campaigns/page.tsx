import { prisma } from "@/lib/prisma";
import { CampaignsClient } from "@/components/campaigns/CampaignsClient";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true } } },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
        <p className="text-slate-500 text-sm mt-0.5">Email campaigns and outreach workflows</p>
      </div>
      <CampaignsClient initialCampaigns={campaigns} />
    </div>
  );
}
