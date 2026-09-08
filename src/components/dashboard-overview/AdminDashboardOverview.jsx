"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
 Users,
 Palette,
 CreditCard,
 DollarSign,
 ArrowUpRight,
 Activity,
 Loader2,
 AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const initialDashboardData = {
 totalUsers: 0,
 verifiedArtworks: 0,
 transactionsCount: 0,
 platformRevenue: 0,
 recentSales: [],
};

// Helper utility to safely construct a valid system administration JWT token context
const getAuthToken = async (base, email) => {
  const res = await fetch(`${base}/api/users/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Administrative token generation failed.");
  const { token } = await res.json();
  return token;
};

export default function AdminDashboardOverview({ session: initialSession }) {
 const router = useRouter();
 
 // Use parent session if passed, otherwise fall back to hook client
 const { data: clientSession, isPending: authLoading } = authClient.useSession();
 const session = initialSession || clientSession;
 const user = session?.user;
 const [loading, setLoading] = useState(false);
 const [dashboardData, setDashboardData] = useState(initialDashboardData);
 const [errorMessage, setErrorMessage] = useState("");

 // Auth + Role Verification Guard
 useEffect(() => {
   if (authLoading) return;
   if (!user) {
     router.replace("/login");
     return;
   }
   if (user.role !== "admin") {
     toast.error("Unauthorized access.");
     router.replace("/dashboard");
   }
 }, [authLoading, user, router]);

 // Fetch dashboard metrics through same-origin proxy router pipeline
 useEffect(() => {
   if (authLoading) return;
   if (!user || user.role !== "admin") return;
   
   let isMounted = true;
   const controller = new AbortController();
   
   const loadDashboardMetrics = async () => {
     try {
       setLoading(true);
       setErrorMessage("");
       
       // Construct precise backend gateway orchestration base string
       const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
       
       // Acquire fresh core system security verification token context
       const token = await getAuthToken(base, user.email);

       const res = await fetch(`${base}/api/admin/dashboard-stats`, {
         method: "GET",
         signal: controller.signal,
         headers: {
           "Accept": "application/json",
           "Content-Type": "application/json",
           "Authorization": `Bearer ${token}`
         },
       });
       
       const contentType = res.headers.get("content-type") || "";
       const responseBody = contentType.includes("application/json")
         ? await res.json()
         : await res.text();
         
       if (!res.ok) {
         const message =
           typeof responseBody === "object"
             ? responseBody?.message || responseBody?.error
             : responseBody;
         throw new Error(
           message || `Dashboard stats fetch failed with status: ${res.status}`
         );
       }
       
       if (!isMounted) return;
       
       const targetData = typeof responseBody === "string" ? JSON.parse(responseBody) : responseBody;
       
       setDashboardData({
         totalUsers: Number(targetData?.totalUsers || 0),
         verifiedArtworks: Number(targetData?.verifiedArtworks || 0),
         transactionsCount: Number(targetData?.transactionsCount || 0),
         platformRevenue: Number(targetData?.platformRevenue || 0),
         recentSales: Array.isArray(targetData?.recentSales)
           ? targetData.recentSales
           : [],
       });
     } catch (err) {
       if (err.name === "AbortError") return;
       console.error("Dashboard metrics load error:", err);
       if (!isMounted) return;
       const message = err?.message || "Failed to load dashboard data. Please try again.";
       setErrorMessage(message);
       toast.error(message);
     } finally {
       if (isMounted) {
         setLoading(false);
       }
     }
   };
   
   loadDashboardMetrics();
   
   return () => {
     isMounted = false;
     controller.abort();
   };
 }, [authLoading, user]);

 const stats = useMemo(
   () => [
     {
       label: "Total Users",
       value: dashboardData.totalUsers.toLocaleString(),
       icon: Users,
       change: "Registered accounts",
       color: "text-[#df6742]",
     },
     {
       label: "Verified Artworks",
       value: dashboardData.verifiedArtworks.toLocaleString(),
       icon: Palette,
       change: "Live gallery listings",
       color: "text-blue-500 dark:text-blue-400",
     },
     {
       label: "Transactions",
       value: dashboardData.transactionsCount.toLocaleString(),
       icon: CreditCard,
       change: "Successful purchases",
       color: "text-amber-500 dark:text-amber-400",
     },
     {
       label: "Platform Revenue",
       value: `$${dashboardData.platformRevenue.toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
       })}`,
       icon: DollarSign,
       change: "Gross volume processed",
       color: "text-emerald-500 dark:text-emerald-400",
     },
   ],
   [dashboardData]
 );

 if (authLoading || loading) {
   return (
     <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3 text-[var(--text-muted)]">
       <Loader2 className="w-8 h-8 animate-spin text-[#df6742]" />
       <p className="text-xs text-[var(--text-muted)]">Loading dashboard intelligence metrics...</p>
     </div>
   );
 }

 if (!user || user.role !== "admin") {
   return null;
 }

 return (
   <div className="space-y-8 p-4 md:p-6">
     <div className="flex flex-wrap items-start justify-between gap-4">
       <div>
         <h1 className="text-2xl font-bold text-[var(--text-main)]">
           System Administration Overview
         </h1>
         <p className="text-sm text-[var(--text-muted)] mt-1">
           Full platform oversight: manage users, verify listings, and monitor growth.
         </p>
       </div>
       <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1.5 border border-emerald-200 dark:border-emerald-500/10 rounded-xl">
         <Activity className="w-4 h-4 animate-pulse" />
         Live Status Active
       </div>
     </div>
     {errorMessage && (
       <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-red-700 dark:text-red-200 flex items-start gap-3">
         <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
         <div>
           <p className="font-medium">Dashboard data load failed</p>
           <p className="text-sm text-red-600 dark:text-red-200/80 mt-1">{errorMessage}</p>
         </div>
       </div>
     )}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
       {stats.map((stat) => {
         const Icon = stat.icon;
         return (
           <div
             key={stat.label}
             className="bg-[var(--surface)] border border-[var(--border-line)] rounded-xl p-5 shadow-sm"
           >
             <div className="flex items-center justify-between">
               <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
               <Icon className={`w-5 h-5 ${stat.color}`} />
             </div>
             <div className="mt-3">
               <p className="text-2xl font-black text-[var(--text-main)]">{stat.value}</p>
               <p className="text-xs text-[var(--text-subtle)] mt-1">{stat.change}</p>
             </div>
           </div>
         );
       })}
     </div>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-xl p-5 shadow-sm flex flex-col justify-between">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-base font-bold text-[var(--text-main)]">Recent Sales</h2>
           <Link
             href="/dashboard/admin/transactions"
             className="text-xs font-bold text-[#df6742] bg-[#df6742]/5 hover:bg-[#df6742]/10 border border-[#df6742]/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
           >
             View All <ArrowUpRight className="w-3.5 h-3.5" />
           </Link>
         </div>
         <div className="space-y-3 flex-1 overflow-y-auto max-h-70 pr-1">
           {dashboardData.recentSales.length === 0 ? (
             <div className="text-center py-12">
               <p className="text-[var(--text-subtle)] text-xs italic">No recent sales records found.</p>
             </div>
           ) : (
             dashboardData.recentSales.map((sale, idx) => {
               const saleId = sale?._id || sale?.id || sale?.transactionId || idx;
               return (
                 <div
                   key={saleId}
                   className="flex items-center justify-between gap-4 border-b border-[var(--border-line)] pb-3 last:border-0 last:pb-0"
                 >
                   <div className="min-w-0">
                     <p className="text-[10px] font-mono text-[var(--text-subtle)] truncate">
                       ID: {sale?.transactionId || sale?._id || "N/A"}
                     </p>
                     <p className="text-sm font-bold text-[var(--text-main)] truncate">
                       {sale?.artworkTitle || sale?.artworkName || "Artwork Purchase"}
                     </p>
                     <p className="text-xs text-[var(--text-muted)] truncate">
                       {sale?.buyerEmail || sale?.email || "N/A"}
                     </p>
                   </div>
                   <div className="text-right shrink-0">
                     <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                       ${Number(sale?.price || sale?.amount || 0).toFixed(2)}
                     </p>
                     <p className="text-[10px] uppercase font-bold text-[var(--text-subtle)] tracking-wider">
                       {sale?.status || "Success"}
                     </p>
                   </div>
                 </div>
               );
             })
           )}
         </div>
       </div>
       <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-xl p-5 shadow-sm flex flex-col justify-between">
         <div className="flex items-center justify-between">
           <div>
             <h2 className="text-base font-bold text-[var(--text-main)]">Analytics & Charts</h2>
             <p className="text-xs text-[var(--text-muted)] mt-1">
               Sales trends, category breakdown, and revenue distribution charts.
             </p>
           </div>
         </div>
         <div className="mt-6">
           <p className="text-xs text-[var(--text-muted)] mb-4 bg-[var(--hover-bg)] p-3 rounded-lg border border-[var(--border-line)]">
             View Stripe-linked financial charts and artwork category analytics in the core system module.
           </p>
           <Link
             href="/dashboard/admin/charts"
             className="inline-flex items-center gap-2 bg-[#df6742] hover:bg-[#c95835] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md w-fit"
           >
             Launch Charts <ArrowUpRight className="w-4 h-4" />
           </Link>
         </div>
       </div>
     </div>
   </div>
 );
}