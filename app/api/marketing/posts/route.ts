export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.marketingPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { business, platforms, content, hashtags, topic, viralScore } = await req.json();
  const post = await prisma.marketingPost.create({
    data: {
      business,
      platforms: platforms || [],
      content,
      hashtags: hashtags || [],
      topic,
      viralScore,
      status: "DRAFT",
    },
  });
  return NextResponse.json(post, { status: 201 });
}
