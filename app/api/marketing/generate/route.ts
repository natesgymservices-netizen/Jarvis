export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBulkContent } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { business, platforms, topic, tone, count } = await req.json();
  if (!business || !platforms?.length || !topic) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const posts = await generateBulkContent({ business, platforms, topic, tone: tone || "Professional", count: count || 10 });
  return NextResponse.json({ posts });
}
