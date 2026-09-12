/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CreditCard,
  Clock,
  CheckCircle,
  Palette,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

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
        // Try local payment verification first
        let verified = false;
        try {
          const localRes = await fetch("/api/payment/verify-payment-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          if (localRes.ok) {
            verified = true;
          }
        } catch {
          // Fallback to server
        }

        if (!verified) {
          const token = await getAuthToken(user.email).catch(() => "");
          const headers = { "Content-Type": "application/json" };
          if (token) headers.Authorization = `Bearer ${token}`;

          const res = await fetch(`${base}/api/payment/verify-payment-sync`, {
            method: "POST",
            headers,
            body: JSON.stringify({ sessionId }),
          });
          if (res.ok) verified = true;
        }

        if (verified) {
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
      let list = null;

      // 1. Try local internal API first
      try {
        const localRes = await fetch(`/api/payment/my-orders?email=${encodeURIComponent(user.email)}`);
        if (localRes.ok) {
          const localData = await localRes.json();
          list = Array.isArray(localData) ? localData : (localData?.data || localData?.orders || []);
        }
      } catch (localErr) {
        console.warn("Local orders route skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!list) {
        const token = await getAuthToken(user.email).catch(() => "");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${base}/api/payment/my-orders`, {
          method: "GET",
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          list = Array.isArray(data) ? data : (data?.data || data?.orders || []);
        }
      }

      setRecentOrders((list || []).slice(0, 3));
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-white">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        <p className="text-xs text-slate-500 dark:text-white/40">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 sm:space-y-5 w-full text-slate-800 dark:text-white pb-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Payment Verified Toast Banner */}
      {paymentVerified && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            Payment successful! Your artwork has been registered in your collection.
          </p>
        </div>
      )}

      {/* 1. Sleek & Compact Welcome Header Banner */}
      <div className="bg-white dark:bg-[#243239] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-xs">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#df6742]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/20 rounded-md">
              <Sparkles size={11} className="text-[#df6742]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#df6742]">
                Collector Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Hello, {user?.name || "Art Collector"}!
            </h1>
            <p className="text-slate-500 dark:text-white/60 text-xs max-w-lg leading-relaxed">
              Track your acquired masterpieces, inspect provenance, and manage your account.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <Palette size={13} />
              <span>Browse Art</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Compact Overview Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Purchases */}
        <div className="bg-white dark:bg-[#243239] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
              Total Purchases
            </p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#df6742]" />
              ) : (
                recentOrders.length
              )}
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-white/40 block">
              Original pieces acquired
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/20 flex items-center justify-center text-[#df6742] shrink-0">
            <ShoppingBag size={18} />
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white dark:bg-[#243239] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
              Collector Status
            </p>
            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <ShieldCheck size={16} /> Verified
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-white/40 block">
              Full marketplace rights
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
        </div>

        {/* Payment Protection */}
        <div className="bg-white dark:bg-[#243239] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
              Payment Gateway
            </p>
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
              <CreditCard size={16} /> Stripe Secured
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-white/40 block">
              256-bit encrypted ledger
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CreditCard size={18} />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Left Quick Actions, Right Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Quick Actions (Compact) */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="bg-white dark:bg-[#243239] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xs space-y-3">
            <div className="border-b border-slate-200 dark:border-white/5 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Quick Actions
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-white/40">
                Collector shortcuts
              </p>
            </div>

            <div className="space-y-1.5">
              <Link
                href="/dashboard/user/purchase-history"
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-black/10 hover:bg-orange-50/50 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 transition-colors group text-xs font-semibold"
              >
                <span className="text-slate-700 dark:text-white/80 group-hover:text-[#df6742] transition-colors">
                  Purchase History
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#df6742] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/user/bought-artworks"
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-black/10 hover:bg-orange-50/50 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 transition-colors group text-xs font-semibold"
              >
                <span className="text-slate-700 dark:text-white/80 group-hover:text-[#df6742] transition-colors">
                  My Art Collection
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#df6742] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/user/profile"
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-black/10 hover:bg-orange-50/50 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 transition-colors group text-xs font-semibold"
              >
                <span className="text-slate-700 dark:text-white/80 group-hover:text-[#df6742] transition-colors">
                  Profile &amp; Security
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#df6742] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Collector Perks Box */}
          <div className="p-3.5 rounded-xl bg-orange-50/40 dark:bg-[#df6742]/5 border border-[#df6742]/20 space-y-1.5">
            <h4 className="text-[11px] font-bold text-[#df6742] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>Collector Privileges</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-white/60 leading-relaxed">
              Every acquired original piece includes verified digital provenance and insured packaging.
            </p>
          </div>
        </div>

        {/* Right Column: Recent Purchases (Contained & Responsive) */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#243239] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Recent Purchases
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-white/40">
                  Latest ledger transactions
                </p>
              </div>
              <Link
                href="/dashboard/user/purchase-history"
                className="text-xs font-bold text-[#df6742] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Orders List Container */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#df6742]" />
                  <p className="text-xs text-slate-400 dark:text-white/40">Loading purchases...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-black/10 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-white/20" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-white/80">No purchases found yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-white/40 max-w-xs mx-auto">
                    Explore original paintings, sculptures, and digital art created by independent artists.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/browse"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <Palette size={12} />
                      <span>Browse Masterpieces</span>
                    </Link>
                  </div>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const orderId = order?._id?.toString() || order?.id || "N/A";
                  const displayPrice = order?.price ?? order?.amount ?? 0;
                  const artworkTitle = order?.artworkDetails?.title || order?.artworkTitle || "Artwork Purchase";
                  const artworkImage = order?.artworkDetails?.image || order?.artworkImage || "";
                  const targetArtworkId = order?.artworkDetails?._id || order?.artworkId;

                  return (
                    <div
                      key={orderId}
                      className="p-3 bg-slate-50 dark:bg-black/15 hover:bg-slate-100/70 dark:hover:bg-black/25 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 text-xs transition-colors overflow-hidden"
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                          {artworkImage ? (
                            <img
                              src={artworkImage}
                              alt={artworkTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Palette size={18} className="text-[#df6742]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-800 dark:text-white/90 truncate text-xs sm:text-sm">
                              {artworkTitle}
                            </p>
                            {targetArtworkId && (
                              <Link
                                href={`/browse/${targetArtworkId}`}
                                className="text-slate-400 hover:text-[#df6742] shrink-0 transition-colors"
                                title="Inspect Artwork"
                              >
                                <ExternalLink size={11} />
                              </Link>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-slate-400 dark:text-white/40 truncate">
                            ID: {order?.transactionId || orderId}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Paid Badge (STRICTLY shrink-0, perfectly contained) */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-right">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
                          ${Number(displayPrice).toFixed(2)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-extrabold border border-emerald-500/20 whitespace-nowrap shrink-0">
                          {order?.status || "Paid"}
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
    </div>
  );
}