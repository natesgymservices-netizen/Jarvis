import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GmailClient } from "@/components/gmail/GmailClient";
import { Mail } from "lucide-react";

export default async function GmailPage() {
  const session = await getServerSession(authOptions);

  const [threads, syncState, unanalyzed] = await Promise.all([
    prisma.emailThread.findMany({
      orderBy: { lastMessageAt: "desc" },
      take: 100,
      include: { lead: { select: { id: true, name: true, business: true } } },
    }),
    prisma.gmailSyncState.findUnique({ where: { userId: session!.user.id } }),
    prisma.emailThread.count({ where: { aiAnalyzed: false } }),
  ]);

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-cyan-400" />
        <div>
          <h1 className="font-sans text-2xl font-black text-white tracking-wide">Comms Intelligence</h1>
          <p className="font-mono text-[11px] text-cyan-600 tracking-[0.2em] uppercase mt-0.5">
            {threads.length} threads · {unanalyzed} awaiting analysis
          </p>
        </div>
      </div>
      <GmailClient
        initialThreads={threads as Parameters<typeof GmailClient>[0]["initialThreads"]}
        lastSyncedAt={syncState?.lastSyncedAt ?? null}
        unanalyzedCount={unanalyzed}
      />
    </div>
  );
}
