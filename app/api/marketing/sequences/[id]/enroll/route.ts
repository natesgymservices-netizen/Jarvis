import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { leadId, email, name } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const sequence = await prisma.emailSequence.findUnique({
    where: { id },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
  if (!sequence) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  if (!sequence.steps.length) return NextResponse.json({ error: "Sequence has no steps" }, { status: 400 });

  // Check not already enrolled
  const existing = await prisma.sequenceEnrollment.findFirst({
    where: { sequenceId: id, email, status: "ACTIVE" },
  });
  if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

  const firstStep = sequence.steps[0];
  const nextSendAt = new Date();
  nextSendAt.setDate(nextSendAt.getDate() + firstStep.delayDays);

  const enrollment = await prisma.sequenceEnrollment.create({
    data: {
      sequenceId: id,
      leadId: leadId || null,
      email,
      name: name || null,
      currentStep: 1,
      status: "ACTIVE",
      nextSendAt,
    },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
