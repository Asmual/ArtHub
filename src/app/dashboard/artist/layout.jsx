"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import NotFound from "@/app/not-found";
import DashboardContentLoader from "@/components/dashboard/DashboardContentLoader";

export default function ArtistLayout({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  if (isPending) {
    return <DashboardContentLoader text="Verifying artist credentials..." />;
  }

  if (!user || user.role !== "artist") {
    return <NotFound />;
  }

  return <>{children}</>;
}
