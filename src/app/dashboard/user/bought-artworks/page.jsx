"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Palette, ExternalLink, ArrowLeft, ImageOff } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/loading";

// Helper to retrieve JWT token for authenticated requests
const getAuthToken = async (base, email) => {
  const res = await fetch(`${base}/api/users/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Authentication token generation failed.");
  const { token } = await res.json();
  return token;
};

export default function BoughtArtworksPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bought artworks for the authenticated user
  useEffect(() => {
    if (!user?.email) return;

    const fetchBoughtArtworks = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(base, user.email);

        const response = await fetch(`${base}/api/payment/my-orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : (data?.data || data?.orders || []);
        setOrders(list);
      } catch (error) {
        console.error("[PAYMENT ERROR] Bought artworks fetch error:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoughtArtworks();
  }, [user?.email]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-white">
        <Loading />
        <p className="text-xs text-slate-500 dark:text-white/40">Loading your art collection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 dark:bg-[#df6742]/10 rounded-xl border border-[#df6742]/20">
            <Palette className="w-5 h-5 text-[#df6742]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">My Art Collection</h1>
            <p className="text-xs text-slate-500 dark:text-white/40">Gallery of your acquired artwork pieces</p>
          </div>
        </div>

        <Link
          href="/dashboard/user"
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-white/60 hover:text-[#df6742] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#243239] rounded-2xl border border-slate-200 dark:border-white/5 space-y-3 shadow-sm">
          <Palette className="w-10 h-10 mx-auto text-slate-300 dark:text-white/20" />
          <p className="text-sm font-medium text-slate-600 dark:text-white/60">Your Gallery is Empty</p>
          <p className="text-xs text-slate-400 dark:text-white/30 max-w-xs mx-auto">
            You haven&apos;t collected any artwork yet. Visit the marketplace to start your private collection.
          </p>
          <Link
            href="/browse"
            className="inline-block mt-2 bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Explore Artworks
          </Link>
        </div>
      ) : (
        /* Artworks Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const orderId = order?._id?.toString() || order?.id || order?.transactionId;
            const artwork = order?.artworkDetails;
            const artworkId = artwork?._id || order?.artworkId;
            const artworkImage = artwork?.image || order?.artworkImage;
            const title = artwork?.title || order?.artworkTitle || "Original Artwork";
            const category = artwork?.category || order?.category;

            return (
              <div
                key={orderId}
                className="bg-white dark:bg-[#243239] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col group"
              >
                {/* Artwork Image Container */}
                <div className="relative aspect-4/3 bg-slate-100 dark:bg-black/20 w-full overflow-hidden border-b border-slate-200 dark:border-white/5">
                  {artworkImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artworkImage}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-white/20 gap-2">
                      <ImageOff className="w-8 h-8" />
                      <span className="text-[10px] tracking-wider uppercase font-bold">No Image Available</span>
                    </div>
                  )}
                  {category && (
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10">
                      {category}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base tracking-wide truncate">
                      {title}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-white/40 font-mono select-all truncate">
                      Txn: {order?.transactionId || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">Price Paid</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ${Number(order?.price || order?.amount || 0).toFixed(2)}
                      </p>
                    </div>

                    {artworkId ? (
                      <Link
                        href={`/browse/${artworkId}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#df6742] bg-orange-50 dark:bg-[#df6742]/5 hover:bg-orange-100 dark:hover:bg-[#df6742]/10 border border-[#df6742]/10 px-3.5 py-2 rounded-xl transition-all group/btn"
                      >
                        View Art
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-white/30 italic">Details Removed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}