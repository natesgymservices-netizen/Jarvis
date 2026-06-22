import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLeadInsights } from "@/lib/claude";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [leads, revenue] = await Promise.all([
    prisma.lead.findMany({
      select: {
        business: true,
        source: true,
        stage: true,
        category: true,
        value: true,
        createdAt: true,
        closedAt: true,
      },
    }),
    prisma.revenue.findMany({
      select: { business: true, category: true, amount: true, date: true },
    }),
  ]);

  if (leads.length === 0 && revenue.length === 0) {
    return NextResponse.json({
      insights: [{ title: "No data yet", detail: "Add leads and revenue entries to unlock AI insights.", action: "Start by adding your first lead.", priority: "high" }],
      topRecommendation: "Add your first lead to get started.",
    });
  }

  const insights = await getLeadInsights(leads, revenue);
  return NextResponse.json(insights);
}
