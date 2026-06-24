export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lead = await prisma.lead.update({
    where: { id },
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
      closedAt: ["WON", "LOST"].includes(body.stage) ? (existing.closedAt ?? new Date()) : null,
    },
  });

  if (existing.stage !== body.stage) {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: "STAGE_CHANGE",
        content: `Stage changed from ${existing.stage} to ${body.stage}`,
      },
    });
  }

  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
