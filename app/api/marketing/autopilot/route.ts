export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWeeklyContent } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { addDays, nextMonday, setHours, setMinutes } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { businesses, platforms, topicBanks, postsPerDay } = await req.json();

  const plan = await generateWeeklyContent({ businesses, platforms, topicBanks, postsPerDay: postsPerDay || 3 });
  if (!plan.length) return NextResponse.json({ error: "Generation failed" }, { status: 500 });

  // Schedule from next Monday
  const monday = nextMonday(new Date());

  const posts = await Promise.all(
    plan.map(async (item) => {
      const [h, m] = item.time.split(":").map(Number);
      const scheduledAt = setMinutes(setHours(addDays(monday, item.day), h), m);

      return prisma.marketingPost.create({
        data: {
          business: item.business as never,
          platforms: [item.platform],
          content: item.content,
          hashtags: item.hashtags,
          topic: item.hook,
          status: "SCHEDULED",
          scheduledAt,
        },
      });
    })
  );

  return NextResponse.json({ count: posts.length, posts });
}
