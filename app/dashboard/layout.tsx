import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0 relative">
        {/* Subtle vignette from left edge */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/30 to-transparent pointer-events-none z-10" />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
