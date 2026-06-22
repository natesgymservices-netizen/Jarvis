import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGmailClient, getHeader, parseEmailAddress } from "@/lib/google";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const gmail = await getGmailClient(session.user.id);

    const threadsRes = await gmail.users.threads.list({
      userId: "me",
      maxResults: 50,
      labelIds: ["INBOX"],
    });

    const threads = threadsRes.data.threads ?? [];
    let synced = 0;

    for (const t of threads) {
      if (!t.id) continue;

      const detail = await gmail.users.threads.get({ userId: "me", id: t.id, format: "metadata", metadataHeaders: ["Subject", "From", "To", "Date"] });
      const msgs = detail.data.messages ?? [];
      if (msgs.length === 0) continue;

      const firstMsg = msgs[0];
      const lastMsg = msgs[msgs.length - 1];
      const headers = firstMsg.payload?.headers ?? [];

      const subject = getHeader(headers, "subject");
      const from = getHeader(headers, "from");
      const to = getHeader(headers, "to");

      const participants = [from, to]
        .filter(Boolean)
        .flatMap((r) => r.split(","))
        .map((r) => parseEmailAddress(r.trim()).email)
        .filter((e) => e && e.includes("@"));

      const lastDate = lastMsg.internalDate
        ? new Date(parseInt(lastMsg.internalDate))
        : null;

      await prisma.emailThread.upsert({
        where: { gmailId: t.id },
        update: {
          subject: subject || null,
          snippet: detail.data.snippet || null,
          participants,
          messageCount: msgs.length,
          lastMessageAt: lastDate,
          updatedAt: new Date(),
        },
        create: {
          gmailId: t.id,
          subject: subject || null,
          snippet: detail.data.snippet || null,
          participants,
          messageCount: msgs.length,
          lastMessageAt: lastDate,
        },
      });
      synced++;
    }

    await prisma.gmailSyncState.upsert({
      where: { userId: session.user.id },
      update: { lastSyncedAt: new Date() },
      create: { userId: session.user.id },
    });

    return NextResponse.json({ synced });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Gmail sync error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
