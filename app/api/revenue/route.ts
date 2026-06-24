export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const revenue = await prisma.revenue.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(revenue);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { business, amount, category, description, date, leadId } = await req.json();
  const revenue = await prisma.revenue.create({
    data: {
      business,
      amount: parseFloat(amount),
      category,
      description: description || null,
      date: new Date(date),
      leadId: leadId || null,
    },
  });
  return NextResponse.json(revenue, { status: 201 });
}
