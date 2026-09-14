"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import NotFound from "@/app/not-found";
import DashboardContentLoader from "@/components/dashboard/DashboardContentLoader";

export default function UserLayout({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  if (isPending) {
    return <DashboardContentLoader text="Verifying collector credentials..." />;
  }

  const role = user?.role;
  const isBuyer = role === "buyer" || role === "user";

  if (!user || !isBuyer) {
    return <NotFound />;
  }

  return <>{children}</>;
}
