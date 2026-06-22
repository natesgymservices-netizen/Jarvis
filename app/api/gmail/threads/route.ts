import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.emailThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: { lead: { select: { id: true, name: true, business: true } } },
  });

  const syncState = await prisma.gmailSyncState.findUnique({ where: { userId: session.user.id } });

  return NextResponse.json({ threads, lastSyncedAt: syncState?.lastSyncedAt ?? null });
}
