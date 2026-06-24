import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BUSINESS_CONTEXT = `
You are JARVIS, an AI assistant for Nate's three businesses:
1. Nate's Gym Services (NATES_GYM_SERVICES) — gym consulting, equipment sales/rental, maintenance
2. FitVend Global (FITVEND_GLOBAL) — vending machine revenue-share partnerships with gyms
3. Fit Atlas (FIT_ATLAS) — gym discovery marketplace, gym listings, membership access

Nate's email is natesgymservices@gmail.com.
`;

export interface EmailAnalysis {
  isLead: boolean;
  needsFollowUp: boolean;
  summary: string;
  leadData?: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    business: "NATES_GYM_SERVICES" | "FITVEND_GLOBAL" | "FIT_ATLAS";
    stage: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "NURTURE";
    category: "CONSULTING" | "EQUIPMENT_SALE" | "EQUIPMENT_RENTAL" | "MAINTENANCE" | "VENDING_PARTNERSHIP" | "GYM_LISTING" | "MEMBERSHIP_ACCESS" | "OTHER";
    estimatedValue?: number;
    notes: string;
  };
}

export async function analyzeEmailThread({
  subject,
  from,
  body,
  userEmail,
}: {
  subject: string;
  from: string;
  body: string;
  userEmail: string;
}): Promise<EmailAnalysis> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `${BUSINESS_CONTEXT}

Analyze this email and determine if it's a business lead or inquiry.

FROM: ${from}
SUBJECT: ${subject}
BODY:
${body.slice(0, 3000)}

Determine:
1. Is this a genuine business lead/inquiry for one of Nate's businesses? (not spam, newsletters, automated emails, receipts, or personal emails)
2. Does it need a follow-up reply? (i.e. the sender is waiting for a response and it hasn't been replied to)
3. Extract contact details if it is a lead

Respond in JSON only:
{
  "isLead": true/false,
  "needsFollowUp": true/false,
  "summary": "One sentence summary of what this email is about",
  "leadData": {
    "name": "Contact's full name",
    "email": "their email",
    "company": "their company or null",
    "phone": "phone if mentioned or null",
    "business": "NATES_GYM_SERVICES | FITVEND_GLOBAL | FIT_ATLAS",
    "stage": "NEW | CONTACTED | QUALIFIED | PROPOSAL | NEGOTIATION | NURTURE",
    "category": "CONSULTING | EQUIPMENT_SALE | EQUIPMENT_RENTAL | MAINTENANCE | VENDING_PARTNERSHIP | GYM_LISTING | MEMBERSHIP_ACCESS | OTHER",
    "estimatedValue": number or null,
    "notes": "Key details from the email"
  }
}
Only include "leadData" if isLead is true. If not a lead, omit the leadData field entirely.`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { isLead: false, needsFollowUp: false, summary: "Could not analyze" };
  }
}

export async function draftFollowUp({
  senderName,
  senderEmail,
  subject,
  threadSummary,
  business,
  stage,
}: {
  senderName: string;
  senderEmail: string;
  subject: string;
  threadSummary: string;
  business: string;
  stage: string;
}): Promise<{ subject: string; body: string }> {
  const businessName =
    business === "NATES_GYM_SERVICES" ? "Nate's Gym Services" :
    business === "FITVEND_GLOBAL"     ? "FitVend Global" :
                                        "Fit Atlas";

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `${BUSINESS_CONTEXT}

Draft a follow-up email reply from Nate at ${businessName}.

Contact: ${senderName} (${senderEmail})
Original subject: ${subject}
Context: ${threadSummary}
Lead stage: ${stage}

Write a short, professional, friendly follow-up. Don't be pushy. Keep it under 100 words.
Sound like a real person — warm and direct.

Respond in JSON only:
{
  "subject": "Re: ${subject}",
  "body": "email body text only, no HTML"
}`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { subject: `Re: ${subject}`, body: "Hi, just following up on my previous message. Let me know if you have any questions!" };
  }
}

export async function getLeadInsights(leads: unknown[], revenue: unknown[]) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are Jarvis, a business intelligence assistant for three businesses: Nate's Gym Services (consulting & equipment), FitVend Global (vending machine revenue-share partnerships), and Fit Atlas (gym access marketplace).

Analyze this lead and revenue data and provide 3-5 specific, actionable insights. Focus on:
- Where revenue leaks exist
- Which lead sources convert best
- Follow-up gaps or response time issues
- Which segments or categories are most profitable
- Where to focus effort for maximum return

Lead data: ${JSON.stringify(leads)}
Revenue data: ${JSON.stringify(revenue)}

Respond in JSON with this shape:
{
  "insights": [
    { "title": "...", "detail": "...", "action": "...", "priority": "high|medium|low" }
  ],
  "topRecommendation": "..."
}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return { insights: [], topRecommendation: text };
  }
}

export async function generateSocialContent(
  business: string,
  platform: "instagram" | "linkedin",
  topic: string
) {
  const platformGuide = platform === "instagram"
    ? "Instagram: casual, emoji-friendly, 150-200 words, strong hook, call to action"
    : "LinkedIn: professional, value-focused, 200-300 words, thought leadership angle";

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a social media post for ${business} on ${platform}.
Platform style: ${platformGuide}
Topic: ${topic}

Return JSON: { "content": "...", "hashtags": ["..."] }`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return { content: text, hashtags: [] };
  }
}

export async function generateEmailContent(
  business: string,
  target: string,
  objective: string
) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 768,
    messages: [
      {
        role: "user",
        content: `Write a professional outreach email for ${business}.
Target audience: ${target}
Objective: ${objective}

Return JSON: { "subject": "...", "body": "..." }
Body should be 150-250 words, conversational, no hard sell.`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return { subject: "", body: text };
  }
}

export interface BulkGeneratedPost {
  platform: string;
  content: string;
  hashtags: string[];
  hook: string;
}

export async function generateBulkContent({
  business,
  platforms,
  topic,
  tone,
  count,
}: {
  business: string;
  platforms: string[];
  topic: string;
  tone: string;
  count: number;
}): Promise<BulkGeneratedPost[]> {
  const platformGuides: Record<string, string> = {
    instagram: "Instagram: casual, emoji-friendly, 150-200 words, strong scroll-stopping hook, CTA, 5-10 hashtags",
    linkedin: "LinkedIn: professional, thought leadership, 200-300 words, insights + story structure, 3-5 hashtags",
    twitter: "Twitter/X: punchy, 240 chars max, hook-first, shareable, 1-3 hashtags",
    facebook: "Facebook: conversational, 100-200 words, community feel, question or story opener",
    tiktok: "TikTok: script format — 3-line hook + body + CTA, 150 words, high energy, 5-8 hashtags",
  };

  const businessName =
    business === "NATES_GYM_SERVICES" ? "Nate's Gym Services (gym consulting, equipment sales/rental, maintenance)" :
    business === "FITVEND_GLOBAL" ? "FitVend Global (vending machine revenue-share partnerships with gyms)" :
    "Fit Atlas (gym discovery marketplace, gym listings, membership access)";

  const guides = platforms.map(p => `- ${platformGuides[p] || p}`).join("\n");
  const postsPerPlatform = Math.ceil(count / platforms.length);

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `${BUSINESS_CONTEXT}

Generate ${postsPerPlatform} social media posts per platform for ${businessName}.

Topic: ${topic}
Tone: ${tone}
Platforms and their style guides:
${guides}

Create ${postsPerPlatform} unique posts for EACH platform (total ${postsPerPlatform * platforms.length} posts).
Make each post genuinely unique — different angles, hooks, formats.
Focus on going viral: strong hooks, emotional triggers, curiosity gaps, social proof.

Return JSON array only:
[
  {
    "platform": "instagram|linkedin|twitter|facebook|tiktok",
    "hook": "First 10 words that stop the scroll",
    "content": "Full post content",
    "hashtags": ["tag1", "tag2"]
  }
]`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

export interface ViralAnalysis {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  rewrite: string;
  bestPlatforms: string[];
}

export async function analyzeViralScore(content: string): Promise<ViralAnalysis> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `${BUSINESS_CONTEXT}

Analyze this social media content for viral potential. Be an expert social media strategist.

Content:
"""
${content.slice(0, 2000)}
"""

Score it on:
- Hook strength (does it stop the scroll?)
- Emotional resonance (curiosity, motivation, relatability, fear of missing out)
- Value delivery (useful, entertaining, or inspiring)
- Call to action (clear next step)
- Platform fit

Return JSON only:
{
  "score": 0-100,
  "grade": "A|B|C|D|F",
  "strengths": ["..."],
  "improvements": ["specific actionable changes"],
  "rewrite": "improved version of the content",
  "bestPlatforms": ["instagram", "linkedin", etc]
}`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { score: 0, grade: "F", strengths: [], improvements: [], rewrite: "", bestPlatforms: [] };
  }
}

export interface SequenceStep {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string;
}

export interface WeeklyPlan {
  day: number; // 0=Mon … 6=Sun
  time: string; // e.g. "08:00"
  business: string;
  platform: string;
  content: string;
  hashtags: string[];
  hook: string;
}

export async function generateWeeklyContent({
  businesses,
  platforms,
  topicBanks,
  postsPerDay,
}: {
  businesses: string[];
  platforms: string[];
  topicBanks: Record<string, string[]>;
  postsPerDay: number;
}): Promise<WeeklyPlan[]> {
  const bizDescriptions: Record<string, string> = {
    NATES_GYM_SERVICES: "Nate's Gym Services (gym consulting, equipment sales/rental/maintenance)",
    FITVEND_GLOBAL: "FitVend Global (vending machine revenue-share partnerships with gyms)",
    FIT_ATLAS: "Fit Atlas (gym discovery marketplace, listings, membership access)",
  };

  const topicLines = businesses.map(b =>
    `${bizDescriptions[b] || b}: ${(topicBanks[b] || []).join(", ")}`
  ).join("\n");

  const platformList = platforms.join(", ");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 6000,
    messages: [{
      role: "user",
      content: `${BUSINESS_CONTEXT}

Create a full 7-day social media content calendar. Generate ${postsPerDay} posts per day across the 3 businesses.

Businesses and their topic ideas:
${topicLines}

Platforms to use: ${platformList}

Rules:
- Spread posts across different businesses and platforms each day
- Use optimal posting times (7–9am, 12pm, 5–7pm AEST)
- Each post must be unique with a strong hook
- Rotate through the topic ideas naturally
- Make content genuinely viral-worthy

Return JSON array only — one object per post:
[
  {
    "day": 0,
    "time": "08:00",
    "business": "NATES_GYM_SERVICES|FITVEND_GLOBAL|FIT_ATLAS",
    "platform": "instagram|linkedin|twitter|facebook|tiktok",
    "hook": "First line only (max 15 words)",
    "content": "Full post content",
    "hashtags": ["tag1", "tag2", "tag3"]
  }
]

day 0 = Monday, day 6 = Sunday. Generate exactly ${postsPerDay * 7} posts total.`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

export async function generateEmailSequence({
  business,
  name,
  target,
  stepCount,
}: {
  business: string;
  name: string;
  target: string;
  stepCount: number;
}): Promise<SequenceStep[]> {
  const businessName =
    business === "NATES_GYM_SERVICES" ? "Nate's Gym Services" :
    business === "FITVEND_GLOBAL" ? "FitVend Global" :
    "Fit Atlas";

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: `${BUSINESS_CONTEXT}

Create a ${stepCount}-step email drip sequence for ${businessName}.

Sequence name: ${name}
Target audience: ${target}

Follow this proven sequence structure:
1. Day 0 - Welcome/Intro (warm, value-driven)
2. Day 2 - Education/Story (build trust)
3. Day 5 - Social proof/Results (credibility)
4. Day 8 - Objection handling (remove friction)
5. Day 12 - Soft pitch (value + offer)
6. Day 16 - Urgency/Scarcity (if applicable)
7. Day 20 - Final follow-up (breakup email style)

Emails should be 80-120 words, conversational, never pushy. Each subject line should be curiosity-driven.

Return JSON array only:
[
  {
    "stepNumber": 1,
    "delayDays": 0,
    "subject": "...",
    "body": "Full email body..."
  }
]

Generate exactly ${stepCount} steps.`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}
