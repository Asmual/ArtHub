"use client";

import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "@/components/shared/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import NotFound from "@/app/not-found";
import DashboardContentLoader from "@/components/dashboard/DashboardContentLoader";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // 1. Loading state while authentication credentials resolve
  if (isPending) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <DashboardContentLoader text="Verifying authorization clearance..." />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated access: redirect to login
  if (!user) {
    router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <DashboardContentLoader text="Redirecting to login..." />
        </div>
      </div>
    );
  }

  const role = user.role || "user";
  const isBuyer = role === "buyer" || role === "user";
  const isArtist = role === "artist";
  const isAdmin = role === "admin";

  // 3. Strict Role-Based Route Isolation
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isArtistRoute = pathname.startsWith("/dashboard/artist");
  const isUserRoute = pathname.startsWith("/dashboard/user");

  const isUnauthorized =
    (isAdminRoute && !isAdmin) ||
    (isArtistRoute && !isArtist) ||
    (isUserRoute && !isBuyer);

  // If user navigates to an unauthorized role route, render the full 404 page
  if (isUnauthorized) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto text-foreground">
          <div className="p-4 sm:p-6 md:p-8 flex-1">
            <div className="w-[98%] sm:w-[96%] lg:w-[95%] 2xl:w-[94%] mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}