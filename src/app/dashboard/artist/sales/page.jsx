"use client";

import React, { useEffect, useState } from "react";
import { FaDollarSign, FaShoppingBag, FaChartLine, FaRegClock, FaSpinner } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { backendFetch } from "@/lib/api-client";
import toast from "react-hot-toast";

export default function SalesPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSalesData = async () => {
      try {
        setLoading(true);

        // Dynamic API router mapping directed towards payment endpoints allocation architecture
        const response = await backendFetch("/api/payment/my-sales", { method: "GET" }, user.email);

        if (!response || !response.ok) {
          throw new Error("Failed to sync structural dashboard data from database.");
        }

        const result = await response.json();

        if (isMounted) {
          if (result && result.success && Array.isArray(result.data)) {
            setSalesHistory(result.data);
          } else if (Array.isArray(result)) {
            setSalesHistory(result);
          } else {
            setSalesHistory([]);
          }
        }
      } catch (err) {
        console.error("Dashboard calculation error:", err);
        if (isMounted) {
          // Toast emission rule directly utilized without interrupting page UI display maps
          toast.error(err instanceof Error ? err.message : "Failed to load operational sales metrics.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSalesData();
    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  const totalEarnings = salesHistory.reduce((acc, curr) => acc + Number(curr.amount || curr.price || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? dateString : parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center text-[var(--text-main)] gap-3">
        <FaSpinner className="animate-spin text-2xl text-[#df6742]" />
        <p className="text-xs text-[var(--text-muted)] tracking-wider">Compiling analytical ledger statistics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 sm:p-10 text-[var(--text-main)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-8">
       
        {/* Top Operational Metrics Hub */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaChartLine className="text-[#df6742] text-xl" /> Sales &amp; Revenue Reports
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Review ledger transactions generated dynamically from safe checkout operations.</p>
        </div>

        {/* Highlight Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#df6742]/10 flex items-center justify-center text-[#df6742]">
              <FaDollarSign className="text-xl" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">Total Net Earnings</p>
              <h3 className="text-2xl font-black text-[var(--text-main)] mt-0.5">${totalEarnings.toFixed(2)}</h3>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FaShoppingBag className="text-lg" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">Masterworks Sold</p>
              <h3 className="text-2xl font-black text-[var(--text-main)] mt-0.5">{salesHistory.length} Invoices</h3>
            </div>
          </div>
        </div>

        {/* Ledger Order Record Rows Block */}
        <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-2 border-b border-[var(--border-line)]">
            <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
              <FaRegClock className="text-xs" /> Detailed Order Statements
            </h3>
          </div>

          <div className="space-y-3">
            {salesHistory.map((invoice) => (
              <div
                key={invoice._id}
                className="bg-[var(--background)] border border-[var(--border-line)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#df6742]/30 transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">
                    <span className="font-mono">ID: {invoice._id}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-subtle)]" />
                    <span>{formatDate(invoice.createdAt || invoice.date)}</span>
                  </div>
                  <h4 className="text-base font-bold text-[var(--text-main)]">
                    {invoice.artworkTitle || invoice.title || "Untitled Masterwork"}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] font-medium">
                    Buyer: <span className="text-[var(--text-muted)] font-mono">{invoice.buyerEmail || invoice.buyer}</span>
                  </p>
                </div>
               
                <div className="sm:text-right bg-[var(--hover-bg)] border border-[var(--border-line)] px-4 py-2 rounded-xl">
                  <span className="text-xs text-[var(--text-subtle)] uppercase font-bold block tracking-wider">Payout</span>
                  <span className="text-lg font-black text-emerald-400">
                    ${Number(invoice.amount || invoice.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {salesHistory.length === 0 && (
              <p className="text-center text-xs text-[var(--text-subtle)] py-12">No successful checkout receipts logged inside your account ledger.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}