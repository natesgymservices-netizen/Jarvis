import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/email";

const ALLOWED_BUSINESSES = ["NATES_GYM_SERVICES", "FITVEND_GLOBAL", "FIT_ATLAS"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  return v.trim().slice(0, max) || undefined;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const business = str(body.business, 50);
  const name     = str(body.name, 100);

  if (!business || !name) {
    return NextResponse.json({ error: "Name and business required" }, { status: 400 });
  }
  if (!ALLOWED_BUSINESSES.includes(business as typeof ALLOWED_BUSINESSES[number])) {
    return NextResponse.json({ error: "Invalid business" }, { status: 400 });
  }

  const email    = str(body.email, 254);
  const phone    = str(body.phone, 30);
  const company  = str(body.company, 150);
  const message  = str(body.message, 2000);
  const category = str(body.category, 50);
  const source   = str(body.source, 50);

  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      business,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      notes: message || null,
      source: source || "INBOUND_WEBSITE",
      stage: "NEW",
      category: category || "OTHER",
    },
  });

  // Fire-and-forget — don't await so form response is instant
  notifyNewLead({ business, name, email, phone, company, message, source: "Website Form" }).catch(console.error);

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
