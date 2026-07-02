"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Calendar, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/loading";

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

export default function PurchaseHistoryPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchOrderHistory = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
        const token = await getAuthToken(base, user.email);

        const response = await fetch(`${base}/api/payment/history/${user.id || user.email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.error(`Fetch target pipeline failed with response status: ${response.status}`);
          setOrders([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to load full statement history:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user?.email, user?.id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-white">
        <Loading/>
        <p className="text-xs text-white/40">Compiling financial history ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold">Purchase History</h1>
          <p className="text-xs text-white/40">Secure history log of your completed financial checkouts</p>
        </div>
        <Link
          href="/dashboard/user"
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-[#df6742] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Panel
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#243239] rounded-2xl border border-white/5 space-y-2">
          <ShoppingCart className="w-8 h-8 mx-auto text-white/20" />
          <p className="text-sm font-medium text-white/60">No transaction logs available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            // eslint-disable-next-line react-hooks/purity
            const orderId = order?._id?.toString() || order?.id || Math.random().toString();
            return (
              <div
                key={orderId}
                className="bg-[#243239] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-all shadow-md"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">
                    {order?.artworkDetails?.title || order?.artworkTitle || "ArtHub Limited Asset Canvas"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/40 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white/20" />
                      {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                    <span className="select-all">Txn ID: {order?.transactionId || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Amount Paid</p>
                    <p className="text-base font-black text-emerald-400 font-mono">
                      ${order?.price || order?.amount ? Number(order.price || order.amount).toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider font-bold rounded-lg">
                    {order?.status || "paid"}
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