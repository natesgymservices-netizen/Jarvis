import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, BUSINESS_LABELS } from "@/lib/utils";
import { RevenueCharts } from "@/components/dashboard/RevenueCharts";
import { startOfYear, subMonths, startOfMonth } from "date-fns";
import { DollarSign, TrendingUp, Target } from "lucide-react";

export default async function RevenuePage() {
  const now = new Date();
  const yearStart = startOfYear(now);

  const [byBusiness, byCategory, monthlyRaw, leadStats] = await Promise.all([
    prisma.revenue.groupBy({
      by: ["business"],
      _sum: { amount: true },
      where: { date: { gte: yearStart } },
    }),
    prisma.revenue.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: { date: { gte: yearStart } },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.revenue.findMany({
      where: { date: { gte: startOfMonth(subMonths(now, 5)) } },
      select: { amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      _count: { id: true },
      where: { stage: "WON" },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  const totalYTD = byBusiness.reduce((s, b) => s + (b._sum.amount ?? 0), 0);

  // Build 6-month series
  const months: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const key = startOfMonth(subMonths(now, i)).toISOString().slice(0, 7);
    months[key] = 0;
  }
  for (const r of monthlyRaw) {
    const key = new Date(r.date).toISOString().slice(0, 7);
    if (key in months) months[key] = (months[key] ?? 0) + r.amount;
  }
  const monthly = Object.entries(months).map(([month, amount]) => ({
    month: new Date(month + "-01").toLocaleString("en-AU", { month: "short" }),
    amount,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
        <p className="text-slate-500 text-sm mt-0.5">Year-to-date across all businesses</p>
      </div>

      {/* YTD total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-2.5 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Revenue YTD</p>
                <p className="text-2xl font-bold">{formatCurrency(totalYTD)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg"><Target className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Top Category</p>
                <p className="text-lg font-bold truncate">
                  {byCategory[0]?.category.replace(/_/g, " ") ?? "—"}
                </p>
                {byCategory[0] && (
                  <p className="text-xs text-muted-foreground">{formatCurrency(byCategory[0]._sum.amount ?? 0)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2.5 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Best Lead Source</p>
                <p className="text-lg font-bold">{leadStats[0]?.source.replace(/_/g, " ") ?? "—"}</p>
                {leadStats[0] && (
                  <p className="text-xs text-muted-foreground">{leadStats[0]._count.id} won</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RevenueCharts
        monthly={monthly}
        byBusiness={byBusiness.map((b) => ({
          name: BUSINESS_LABELS[b.business],
          value: b._sum.amount ?? 0,
        }))}
        byCategory={byCategory.map((c) => ({
          name: c.category.replace(/_/g, " "),
          value: c._sum.amount ?? 0,
        }))}
      />

      {/* Business breakdown table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Revenue by Business (YTD)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {byBusiness.map((b) => {
              const pct = totalYTD > 0 ? ((b._sum.amount ?? 0) / totalYTD) * 100 : 0;
              return (
                <div key={b.business}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{BUSINESS_LABELS[b.business]}</span>
                    <span className="text-slate-600">{formatCurrency(b._sum.amount ?? 0)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {byBusiness.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">No revenue recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
