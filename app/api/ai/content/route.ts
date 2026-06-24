import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSocialContent, generateEmailContent } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, business, platform, topic, target, objective } = await req.json();

  if (type === "social") {
    const result = await generateSocialContent(business, platform, topic);
    return NextResponse.json(result);
  }

  if (type === "email") {
    const result = await generateEmailContent(business, target, objective);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
