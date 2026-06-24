import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateEmailSequence } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { business, name, target, stepCount } = await req.json();
  if (!business || !name || !target) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const steps = await generateEmailSequence({ business, name, target, stepCount: stepCount || 5 });
  return NextResponse.json({ steps });
}
