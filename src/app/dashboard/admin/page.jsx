"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AdminDashboardOverview from "@/components/dashboard-overview/AdminDashboardOverview";
import Loading from "@/app/loading";

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
   return <Loading />;
 }

 if (!user || user.role !== "admin") {
   return null;
 }

 return (
   <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] p-4 md:p-6">
     <AdminDashboardOverview session={session} />
   </div>
 );
}