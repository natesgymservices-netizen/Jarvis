import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
