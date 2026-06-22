import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GmailClient } from "@/components/gmail/GmailClient";

export default async function GmailPage() {
  const session = await getServerSession(authOptions);

  const [threads, syncState] = await Promise.all([
    prisma.emailThread.findMany({
      orderBy: { lastMessageAt: "desc" },
      take: 100,
      include: { lead: { select: { id: true, name: true, business: true } } },
    }),
    prisma.gmailSyncState.findUnique({ where: { userId: session!.user.id } }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gmail</h1>
          <p className="text-slate-500 text-sm mt-0.5">{threads.length} threads synced</p>
        </div>
      </div>
      <GmailClient initialThreads={threads} lastSyncedAt={syncState?.lastSyncedAt ?? null} />
    </div>
  );
}
