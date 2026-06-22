import { prisma } from "@/lib/prisma";
import { SocialClient } from "@/components/campaigns/SocialClient";

export default async function SocialPage() {
  const posts = await prisma.socialPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Social Content</h1>
        <p className="text-slate-500 text-sm mt-0.5">Generate, approve and schedule Instagram & LinkedIn posts</p>
      </div>
      <SocialClient initialPosts={posts} />
    </div>
  );
}
