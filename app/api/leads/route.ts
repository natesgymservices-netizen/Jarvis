export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activities: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      business: body.business,
      source: body.source,
      stage: body.stage,
      category: body.category,
      value: body.value ?? null,
      notes: body.notes || null,
      assignedToId: session.user.id,
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: session.user.id,
      type: "CREATED",
      content: `Lead created`,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
