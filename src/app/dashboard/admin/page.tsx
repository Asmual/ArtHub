"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AdminDashboardOverview from "@/components/dashboard-overview/AdminDashboardOverview";
import DashboardContentLoader from "@/components/dashboard/DashboardContentLoader";

export default function AdminDashboardPage() {
 const router = useRouter();
 const { data: session, isPending: authLoading } = authClient.useSession();
 const user = session?.user;

 useEffect(() => {
   if (authLoading) return;
   if (!user) {
     router.replace("/login");
     return;
   }
   if (user.role !== "admin") {
     router.replace("/dashboard");
   }
 }, [authLoading, user, router]);

 if (authLoading) {
   return <DashboardContentLoader text="Verifying administrative access..." />;
 }

 if (!user || user.role !== "admin") {
   return null;
 }

 return (
   <div className="w-full text-[var(--text-main)] p-2 md:p-4">
     <AdminDashboardOverview session={session} />
   </div>
 );
}