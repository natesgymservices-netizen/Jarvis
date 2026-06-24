export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSequenceEmail } from "@/lib/email";

// Vercel Cron: runs hourly via vercel.json
// Guards with CRON_SECRET so only Vercel can trigger it
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all active enrollments due for sending
  const dueEnrollments = await prisma.sequenceEnrollment.findMany({
    where: { status: "ACTIVE", nextSendAt: { lte: now } },
    include: {
      sequence: {
        include: { steps: { orderBy: { stepNumber: "asc" } } },
      },
    },
  });

  const results = { sent: 0, completed: 0, errors: 0 };

  for (const enrollment of dueEnrollments) {
    const { sequence } = enrollment;
    const steps = sequence.steps;
    const currentStepData = steps.find(s => s.stepNumber === enrollment.currentStep);

    if (!currentStepData) {
      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", completedAt: now },
      });
      results.completed++;
      continue;
    }

    const bizLabel =
      sequence.business === "NATES_GYM_SERVICES" ? "Nate's Gym Services" :
      sequence.business === "FITVEND_GLOBAL"      ? "FitVend Global" :
                                                    "Fit Atlas";

    const { ok } = await sendSequenceEmail({
      to: enrollment.email,
      name: enrollment.name || "",
      subject: currentStepData.subject,
      body: currentStepData.body,
      businessName: bizLabel,
    });

    if (!ok) { results.errors++; continue; }
    results.sent++;

    const nextStep = steps.find(s => s.stepNumber === enrollment.currentStep + 1);

    if (!nextStep) {
      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", completedAt: now, currentStep: enrollment.currentStep + 1 },
      });
      results.completed++;
    } else {
      const nextSendAt = new Date();
      nextSendAt.setDate(nextSendAt.getDate() + nextStep.delayDays);
      await prisma.sequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { currentStep: nextStep.stepNumber, nextSendAt },
      });
    }
  }

  return NextResponse.json({ ok: true, processed: dueEnrollments.length, ...results });
}
