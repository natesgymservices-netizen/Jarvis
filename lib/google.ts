import { google } from "googleapis";
import { prisma } from "./prisma";

// node-fetch@2.7.0 incorrectly throws ERR_STREAM_PREMATURE_CLOSE for chunked
// responses on Node.js 24 (fixResponseChunkedTransferBadEnding mis-reads the
// changed socket cleanup order). Patch ALL gaxios instances — including the
// DefaultTransporter used for OAuth token refresh — to use native fetch instead.
const nativeFetch = (url: RequestInfo | URL, init?: RequestInit) =>
  globalThis.fetch(url, { ...(init as RequestInit), cache: "no-store" });

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const GaxiosClass = (require("gaxios") as { Gaxios: any }).Gaxios;
const _origAdapter = GaxiosClass.prototype._defaultAdapter;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
GaxiosClass.prototype._defaultAdapter = function (opts: any) {
  opts.fetchImplementation ??= nativeFetch;
  return _origAdapter.call(this, opts);
};

google.options({ http2: false, headers: { "Accept-Encoding": "identity" } });

async function getOAuthClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { access_token: true, refresh_token: true, expires_at: true },
  });

  if (!account?.access_token) throw new Error("No Google account linked");

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  // If token is expired or expiring within 5 min, force a refresh
  const expiresMs = account.expires_at ? account.expires_at * 1000 : 0;
  const needsRefresh = expiresMs < Date.now() + 5 * 60 * 1000;

  auth.setCredentials({
    access_token:  account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date:   needsRefresh ? 0 : expiresMs,
  });

  // Persist refreshed tokens back to DB so future requests don't also expire
  auth.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.account.updateMany({
        where: { userId, provider: "google" },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
        },
      });
    }
  });

  return auth;
}

export async function getGmailClient(userId: string) {
  const auth = await getOAuthClient(userId);
  return google.gmail({ version: "v1", auth });
}

export async function getCalendarClient(userId: string) {
  const auth = await getOAuthClient(userId);
  return google.calendar({ version: "v3", auth });
}

export function extractEmailBody(payload: {
  body?: { data?: string | null } | null;
  parts?: unknown[] | null;
  mimeType?: string | null;
} | null | undefined): string {
  if (!payload) return "";
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    const parts = payload.parts as typeof payload[];
    // Prefer plain text
    for (const part of parts) {
      if (part?.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
    // Fall back to HTML stripped
    for (const part of parts) {
      if (part?.mimeType === "text/html" && part.body?.data) {
        const html = Buffer.from(part.body.data, "base64").toString("utf-8");
        return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);
      }
    }
    // Recurse into multipart
    for (const part of parts) {
      const body = extractEmailBody(part);
      if (body) return body;
    }
  }
  return "";
}

export async function sendGmailReply(
  userId: string,
  { threadId, to, subject, body }: { threadId: string; to: string; subject: string; body: string }
) {
  const gmail = await getGmailClient(userId);

  const raw = [
    `To: ${to}`,
    `Subject: ${subject.startsWith("Re:") ? subject : `Re: ${subject}`}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    body,
  ].join("\r\n");

  const encoded = Buffer.from(raw).toString("base64url");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded, threadId },
  });
}

export function parseEmailAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.*?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: raw, email: raw };
}

export function getHeader(headers: { name?: string | null; value?: string | null }[], name: string) {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}
