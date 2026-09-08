"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

// Dashboard root redirector based on user authentication and role
export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  // Route user to role-specific dashboard or login
  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "admin") {
      router.replace("/dashboard/admin");
    } else if (user.role === "artist") {
      router.replace("/dashboard/artist");
    } else {
      router.replace("/dashboard/user");
    }
  }, [user, isPending, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[var(--text-main)]">
      <Loader2 className="w-8 h-8 animate-spin text-[#df6742]" />
      <p className="text-xs text-[var(--text-muted)]">Navigating to your dashboard...</p>
    </div>
  );
}
