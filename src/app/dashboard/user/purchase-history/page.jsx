"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Calendar, ShoppingCart, ArrowLeft, ExternalLink, ImageOff } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/loading";
import { getAuthToken } from "@/lib/auth-utils";

export default function PurchaseHistoryPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch purchase history for the authenticated user
  useEffect(() => {
    if (!user?.email) return;

    const fetchOrderHistory = async () => {
      try {
        let list = null;

        // 1. Try local API first
        try {
          const localRes = await fetch(`/api/payment/my-orders?email=${encodeURIComponent(user.email)}`);
          if (localRes.ok) {
            const localData = await localRes.json();
            list = Array.isArray(localData) ? localData : (localData?.data || localData?.orders || []);
          }
        } catch (localErr) {
          console.warn("Local my-orders fetch skipped, trying external gateway:", localErr);
        }

        // 2. Fallback to external backend if needed
        if (!list) {
          const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
          const token = await getAuthToken(user.email);

          const response = await fetch(`${base}/api/payment/my-orders`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            list = Array.isArray(data) ? data : (data?.data || data?.orders || []);
          }
        }

        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Purchase history fetch error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user?.email]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-white">
        <Loading />
        <p className="text-xs text-slate-500 dark:text-white/40">Loading purchase records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-slate-800 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold">Purchase History</h1>
          <p className="text-xs text-slate-500 dark:text-white/40">Overview of all your acquired art orders and payments</p>
        </div>
        <Link
          href="/dashboard/user"
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-white/60 hover:text-[#df6742] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#243239] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-3">
          <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 dark:text-white/20" />
          <p className="text-sm font-medium text-slate-600 dark:text-white/60">No purchases found</p>
          <p className="text-xs text-slate-400 dark:text-white/30">You have not completed any artwork purchases yet.</p>
          <Link
            href="/browse"
            className="inline-block mt-2 bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-3">
          {orders.map((order) => {
            const orderId = order?._id?.toString() || order?.id || order?.transactionId;
            const targetArtworkId = order?.artworkDetails?._id || order?.artworkId;
            const artworkImg = order?.artworkDetails?.image || order?.artworkImage;
            const title = order?.artworkDetails?.title || order?.artworkTitle || "Original Artwork";

            return (
              <div
                key={orderId}
                className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all"
              >
                {/* Artwork Thumbnail and Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-black/20 shrink-0 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                    {artworkImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={artworkImg} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="w-5 h-5 text-slate-400 dark:text-white/20" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                        {title}
                      </h3>
                      {targetArtworkId && (
                        <Link
                          href={`/browse/${targetArtworkId}`}
                          className="text-slate-400 hover:text-[#df6742] transition-colors"
                          title="View Artwork"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 dark:text-white/40 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300 dark:text-white/20" />
                        {order?.createdAt || order?.date ? new Date(order.createdAt || order.date).toLocaleDateString() : "Recent"}
                      </span>
                      <span className="select-all">Txn: {order?.transactionId || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t md:border-t-0 border-slate-200 dark:border-white/5 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider">Amount</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ${Number(order?.price || order?.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-bold rounded-lg">
                    {order?.status || "Paid"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}