export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.socialPost.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { business, platform, content } = await req.json();
  const post = await prisma.socialPost.create({
    data: { business, platform, content, status: "PENDING_APPROVAL" },
  });
  return NextResponse.json(post, { status: 201 });
}
