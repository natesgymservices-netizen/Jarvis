import { prisma } from "@/lib/prisma";
import { MarketingClient } from "@/components/marketing/MarketingClient";

export default async function MarketingPage() {
  const [posts, sequences] = await Promise.all([
    prisma.marketingPost.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.emailSequence.findMany({
      orderBy: { createdAt: "desc" },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    }),
  ]);

  return <MarketingClient initialPosts={posts} initialSequences={sequences} />;
}
