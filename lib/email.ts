function escapeHtml(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "JARVIS <jarvis@natesgymservices.com>";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "natesgymservices@gmail.com";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY not set — logging email instead:");
    console.log(`  TO: ${payload.to}`);
    console.log(`  SUBJECT: ${payload.subject}`);
    return { ok: true, id: "dev-noop" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from || FROM_EMAIL,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message || "Send failed" };
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[email] send error:", err);
    return { ok: false, error: String(err) };
  }
}

export async function notifyNewLead({
  business,
  name,
  email,
  phone,
  company,
  message,
  source,
}: {
  business: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  source: string;
}) {
  const bizLabel =
    business === "NATES_GYM_SERVICES" ? "Nate's Gym Services" :
    business === "FITVEND_GLOBAL"     ? "FitVend Global" :
                                        "Fit Atlas";

  const eName    = escapeHtml(name);
  const eEmail   = escapeHtml(email);
  const ePhone   = escapeHtml(phone);
  const eCompany = escapeHtml(company);
  const eMessage = escapeHtml(message);
  const eSource  = escapeHtml(source);

  return sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New Lead: ${eName} — ${bizLabel}`,
    html: `
      <div style="font-family: monospace; background: #000; color: #00d4ff; padding: 24px; border-radius: 8px; border: 1px solid #00d4ff30;">
        <h2 style="color: #00d4ff; margin: 0 0 16px;">New Lead — ${bizLabel}</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="color:#666; padding: 4px 0; width:120px;">Name</td><td style="color:#fff;">${eName}</td></tr>
          ${eEmail ? `<tr><td style="color:#666; padding: 4px 0;">Email</td><td style="color:#fff;">${eEmail}</td></tr>` : ""}
          ${ePhone ? `<tr><td style="color:#666; padding: 4px 0;">Phone</td><td style="color:#fff;">${ePhone}</td></tr>` : ""}
          ${eCompany ? `<tr><td style="color:#666; padding: 4px 0;">Company</td><td style="color:#fff;">${eCompany}</td></tr>` : ""}
          <tr><td style="color:#666; padding: 4px 0;">Source</td><td style="color:#fff;">${eSource}</td></tr>
          ${eMessage ? `<tr><td style="color:#666; padding: 4px 0; vertical-align:top;">Message</td><td style="color:#ccc; white-space:pre-wrap;">${eMessage}</td></tr>` : ""}
        </table>
        <div style="margin-top:20px;">
          <a href="https://jarvis.vercel.app/dashboard/leads" style="background:#00d4ff; color:#000; padding:10px 20px; border-radius:4px; text-decoration:none; font-weight:bold;">View in JARVIS →</a>
        </div>
        <p style="color:#333; font-size:11px; margin-top:16px;">JARVIS Business Intelligence · Stark Industries</p>
      </div>
    `,
  });
}

export async function sendSequenceEmail({
  to,
  name,
  subject,
  body,
  businessName,
}: {
  to: string;
  name: string;
  subject: string;
  body: string;
  businessName: string;
}) {
  const bodyHtml = escapeHtml(body).replace(/\n/g, "<br>");
  const safeName = escapeHtml(name) || "there";
  return sendEmail({
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hi ${safeName},</p>
        <div style="line-height: 1.7;">${bodyHtml}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">
          ${businessName}<br>
          <a href="mailto:natesgymservices@gmail.com">natesgymservices@gmail.com</a>
        </p>
        <p style="color: #bbb; font-size: 11px;">
          <a href="{{unsubscribe}}" style="color:#bbb;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}
