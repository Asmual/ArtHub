/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ShoppingBag, User as UserIcon, ShieldCheck,
  ArrowRight, Loader2, CreditCard, Clock, CheckCircle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const getAuthToken = async (base, email) => {
  const res = await fetch(`${base}/api/users/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Token generation failed.");
  const { token } = await res.json();
  return token;
};

export default function UserDashboardLanding() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;
  const searchParams = useSearchParams();

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || !user?.email) return;

    const verifyPayment = async () => {
      try {
        const token = await getAuthToken(base, user.email);
        const res = await fetch(`${base}/api/payment/verify-payment-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          setPaymentVerified(true);
          toast.success("Payment verified! Your artwork has been added to your collection.");
          window.history.replaceState({}, "", "/dashboard/user");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
      }
    };

    verifyPayment();
  }, [searchParams, user?.email, base]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const token = await getAuthToken(base, user.email);

      // Maps perfectly with the newly created backend endpoint using accurate singular base path
      const res = await fetch(`${base}/api/payment/my-orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders from server endpoint.");
     
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.orders || []);
      setRecentOrders(list.slice(0, 3));
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [base, user?.email]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user, fetchDashboardData, paymentVerified]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-white">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        <p className="text-xs text-slate-500 dark:text-white/40">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800 dark:text-white">
      {paymentVerified && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
            Payment successful! Your artwork has been added to your collection.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-[#243239] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#df6742]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-block px-2.5 py-0.5 bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/20 rounded-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#df6742]">Buyer Account Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-800 dark:text-white">
            Hello, {user?.name || "Art Collector"}!
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-xs sm:text-sm max-w-xl leading-relaxed">
            Welcome to your ArtHub dashboard. Track your purchases, manage your profile, and explore your art collection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#243239] p-5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/10 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#df6742]" /> : recentOrders.length}
            </h3>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-[#df6742]/10 rounded-xl border border-[#df6742]/20">
            <ShoppingBag className="w-5 h-5 text-[#df6742]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#243239] p-5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/10 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Account Security</p>
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4" /> Verified
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/10">
            <UserIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#243239] p-5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/10 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Payment Gateway</p>
            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <CreditCard className="w-4 h-4" /> Stripe Secured
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/10">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-[#243239] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-4 h-fit">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Quick Actions</h3>
            <p className="text-[11px] text-slate-500 dark:text-white/40">Navigate your dashboard</p>
          </div>
          <div className="space-y-2 pt-2">
            {[
              { href: "/dashboard/user/purchase-history", label: "Purchase History" },
              { href: "/dashboard/user/bought-artworks", label: "My Art Collection" },
              { href: "/dashboard/user/profile", label: "Edit Profile" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/10 hover:bg-slate-100 dark:hover:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 transition-all group text-sm"
              >
                <span className="text-slate-700 dark:text-white/80 group-hover:text-[#df6742] transition-colors">{label}</span>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-white/20 group-hover:text-[#df6742] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#243239] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Orders</h3>
              <p className="text-[11px] text-slate-500 dark:text-white/40">Your last 3 purchases</p>
            </div>
            <Link href="/dashboard/user/purchase-history" className="text-xs font-bold text-[#df6742] hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#df6742]" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-black/5 rounded-xl border border-slate-200 dark:border-white/5">
                <Clock className="w-5 h-5 mx-auto text-slate-300 dark:text-white/20 mb-1" />
                <p className="text-xs text-slate-500 dark:text-white/40">No orders yet. Browse artworks to get started!</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const orderId = order?._id?.toString() || order?.id || "N/A";
                const displayPrice = order?.price ?? order?.amount ?? 0;
                
                return (
                  <div
                    key={orderId}
                    className="p-3.5 bg-slate-50 dark:bg-black/10 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-white/90">{order?.artworkTitle || "Artwork Purchase"}</p>
                      <p className="font-mono text-[10px] text-slate-400 dark:text-white/40 truncate max-w-md">
                        ID: {order?.transactionId || orderId}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-200 dark:border-white/5 pt-2 sm:pt-0">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ${Number(displayPrice).toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold border border-emerald-200 dark:border-emerald-500/20">
                        {order?.status || "paid"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}