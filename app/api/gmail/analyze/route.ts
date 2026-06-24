export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailClient, getHeader, parseEmailAddress, extractEmailBody } from "@/lib/google";
import { analyzeEmailThread, draftFollowUp } from "@/lib/claude";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = session.user.email ?? "";

  // Grab up to 10 unanalyzed threads
  const threads = await prisma.emailThread.findMany({
    where: { aiAnalyzed: false },
    orderBy: { lastMessageAt: "desc" },
    take: 10,
  });

  if (threads.length === 0) {
    return NextResponse.json({ analyzed: 0, leadsCreated: 0, followUpsQueued: 0, message: "All threads already analyzed" });
  }

  const gmail = await getGmailClient(session.user.id);
  let leadsCreated = 0;
  let followUpsQueued = 0;

  for (const thread of threads) {
    try {
      // Fetch the full thread with message bodies
      const detail = await gmail.users.threads.get({
        userId: "me",
        id: thread.gmailId,
        format: "full",
      });

      const msgs = detail.data.messages ?? [];
      if (msgs.length === 0) {
        await prisma.emailThread.update({
          where: { id: thread.id },
          data: { aiAnalyzed: true },
        });
        continue;
      }

      const firstMsg = msgs[0];
      const firstHeaders = firstMsg.payload?.headers ?? [];
      const subject = getHeader(firstHeaders, "Subject") || thread.subject || "";
      const from    = getHeader(firstHeaders, "From");

      // Get body from the most recent message
      const lastMsg = msgs[msgs.length - 1];
      const body = extractEmailBody(lastMsg.payload as Parameters<typeof extractEmailBody>[0]);

      // Skip if no body content (empty emails, calendar invites, etc.)
      if (!body && !thread.snippet) {
        await prisma.emailThread.update({
          where: { id: thread.id },
          data: { aiAnalyzed: true },
        });
        continue;
      }

      // Run Claude analysis
      const analysis = await analyzeEmailThread({
        subject,
        from,
        body: body || thread.snippet || "",
        userEmail,
      });

      // Determine follow-up needed: AI says yes AND the last sender is NOT the user
      const lastSenderIsUser =
        thread.lastSenderEmail?.toLowerCase() === userEmail.toLowerCase();
      const needsFollowUp = analysis.needsFollowUp && !lastSenderIsUser;

      let followUpDraft: string | null = null;
      let leadId = thread.leadId;

      // Auto-create lead if detected and not already linked
      if (analysis.isLead && analysis.leadData && !thread.leadId) {
        const { leadData } = analysis;
        try {
          const lead = await prisma.lead.create({
            data: {
              business:    leadData.business,
              name:        leadData.name,
              email:       leadData.email,
              phone:       leadData.phone ?? null,
              company:     leadData.company ?? null,
              source:      "EMAIL",
              stage:       leadData.stage,
              category:    leadData.category,
              value:       leadData.estimatedValue ?? null,
              notes:       leadData.notes,
              assignedToId: session.user.id,
            },
          });

          // Log the creation activity
          await prisma.leadActivity.create({
            data: {
              leadId:  lead.id,
              userId:  session.user.id,
              type:    "CREATED",
              content: `Lead auto-created by JARVIS from email: "${subject}"`,
            },
          });

          leadId = lead.id;
          leadsCreated++;
        } catch {
          // Lead creation failed — don't block analysis
        }
      }

      // Draft follow-up if needed
      if (needsFollowUp) {
        try {
          const senderInfo = parseEmailAddress(from);
          const draft = await draftFollowUp({
            senderName:    senderInfo.name || senderInfo.email,
            senderEmail:   senderInfo.email,
            subject,
            threadSummary: analysis.summary,
            business:      analysis.leadData?.business ?? "NATES_GYM_SERVICES",
            stage:         analysis.leadData?.stage ?? "NEW",
          });
          followUpDraft = `Subject: ${draft.subject}\n\n${draft.body}`;
          followUpsQueued++;
        } catch {
          // Draft failed — still mark as needing follow-up
        }
      }

      // Save analysis results
      await prisma.emailThread.update({
        where: { id: thread.id },
        data: {
          aiAnalyzed:   true,
          isLead:       analysis.isLead,
          needsFollowUp,
          aiSummary:    analysis.summary,
          followUpDraft,
          leadId:       leadId ?? undefined,
        },
      });
    } catch (err) {
      // Mark as analyzed anyway to avoid retrying a broken thread forever
      await prisma.emailThread.update({
        where: { id: thread.id },
        data: { aiAnalyzed: true },
      });
      console.error(`Failed to analyze thread ${thread.gmailId}:`, err);
    }
  }

  return NextResponse.json({
    analyzed:        threads.length,
    leadsCreated,
    followUpsQueued,
  });
}

// GET — return analysis stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [total, unanalyzed, leads, followUps] = await Promise.all([
    prisma.emailThread.count(),
    prisma.emailThread.count({ where: { aiAnalyzed: false } }),
    prisma.emailThread.count({ where: { isLead: true } }),
    prisma.emailThread.count({ where: { needsFollowUp: true } }),
  ]);

  return NextResponse.json({ total, unanalyzed, leads, followUps });
}
