import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_PLATFORMS = ["instagram", "linkedin", "twitter", "facebook", "tiktok"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const creds = await prisma.platformCredential.findMany();
  // Never return tokens — only connection status
  return NextResponse.json(
    creds.map(c => ({
      platform: c.platform,
      connected: !!c.accessToken,
      pageId: c.pageId,
      accountId: c.accountId,
      expiresAt: c.expiresAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, accessToken, refreshToken, pageId, accountId } = await req.json();
  if (!platform || !accessToken) {
    return NextResponse.json({ error: "Platform and accessToken required" }, { status: 400 });
  }
  if (!ALLOWED_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const cred = await prisma.platformCredential.upsert({
    where: { platform },
    create: { platform, accessToken, refreshToken, pageId, accountId },
    update: { accessToken, refreshToken, pageId, accountId, updatedAt: new Date() },
  });

  return NextResponse.json({ platform: cred.platform, connected: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform } = await req.json();
  if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  await prisma.platformCredential.delete({ where: { platform } });
  return NextResponse.json({ ok: true });
}
