export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendGmailReply, parseEmailAddress } from "@/lib/google";

// GET — list all threads needing follow-up
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.emailThread.findMany({
    where: { needsFollowUp: true },
    orderBy: { lastMessageAt: "asc" }, // oldest first — most urgent
    include: { lead: { select: { id: true, name: true, business: true, stage: true } } },
  });

  return NextResponse.json({ threads });
}

// POST — send the follow-up reply for a thread
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId, body } = await req.json() as { threadId: string; body: string };
  if (!threadId || !body) return NextResponse.json({ error: "threadId and body required" }, { status: 400 });

  const thread = await prisma.emailThread.findUnique({ where: { id: threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  // Find the contact's email (the non-user participant)
  const userEmail = session.user.email ?? "";
  const toEmail = thread.participants.find((p) => p.toLowerCase() !== userEmail.toLowerCase())
    ?? thread.lastSenderEmail
    ?? thread.participants[0];

  if (!toEmail) return NextResponse.json({ error: "Cannot determine recipient" }, { status: 400 });

  const senderInfo = parseEmailAddress(toEmail);

  try {
    await sendGmailReply(session.user.id, {
      threadId: thread.gmailId,
      to:       toEmail,
      subject:  thread.subject ?? "",
      body,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Mark as replied, clear follow-up flag
  await prisma.emailThread.update({
    where: { id: threadId },
    data: {
      needsFollowUp: false,
      lastRepliedAt: new Date(),
      followUpDraft: null,
    },
  });

  // Log activity on the linked lead if exists
  if (thread.leadId) {
    await prisma.leadActivity.create({
      data: {
        leadId:  thread.leadId,
        userId:  session.user.id,
        type:    "EMAIL_SENT",
        content: `Follow-up sent to ${senderInfo.email}: "${thread.subject}"`,
      },
    });

    // Advance lead stage from NEW → CONTACTED
    const lead = await prisma.lead.findUnique({ where: { id: thread.leadId } });
    if (lead?.stage === "NEW") {
      await prisma.lead.update({
        where: { id: thread.leadId },
        data: { stage: "CONTACTED" },
      });
    }
  }

  return NextResponse.json({ success: true });
}
