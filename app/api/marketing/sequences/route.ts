export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sequences = await prisma.emailSequence.findMany({
    orderBy: { createdAt: "desc" },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
  return NextResponse.json(sequences);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { business, name, description, target, steps } = await req.json();
  const sequence = await prisma.emailSequence.create({
    data: {
      business,
      name,
      description,
      target,
      steps: {
        create: (steps || []).map((s: { stepNumber: number; delayDays: number; subject: string; body: string }) => ({
          stepNumber: s.stepNumber,
          delayDays: s.delayDays,
          subject: s.subject,
          body: s.body,
        })),
      },
    },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
  return NextResponse.json(sequence, { status: 201 });
}
