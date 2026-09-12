"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { FaExchangeAlt, FaSearch, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaDownload } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

export default function AdminTransactionsPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchTransactions = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      let list = null;

      // 1. Try local API first
      try {
        const localRes = await fetch("/api/payment/all-transactions");
        if (localRes.ok) {
          list = await localRes.json();
        }
      } catch (localErr) {
        console.warn("Local transactions route skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!list) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const token = await getAuthToken(user.email);

        const res = await fetch(`${base}/api/payment/all-transactions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions.");
        const data = await res.json();
        list = Array.isArray(data) ? data : (data?.data || data?.transactions || []);
      }

      setTransactions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      toast.error("Could not load transaction history.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading && user) fetchTransactions();
  }, [authLoading, user, fetchTransactions]);

  const filteredTransactions = transactions.filter((txn) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (txn.buyerEmail || "").toLowerCase().includes(q) ||
      (txn.transactionId || "").toLowerCase().includes(q) ||
      (txn.artworkTitle || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || (txn.status || "").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "paid" || t.status === "succeeded")
    .reduce((acc, curr) => acc + (Number(curr.price) || Number(curr.amount) || 0), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 sm:p-10 text-[var(--text-main)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-full space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaExchangeAlt className="text-[#df6742] text-xl" /> Transaction Ledger
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Monitor all platform payments and Stripe checkout records.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 shadow-md">
            <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 shadow-md">
            <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">Total Transactions</p>
            <h3 className="text-2xl font-black text-[var(--text-main)] mt-1">{transactions.length}</h3>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 shadow-md">
            <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">Gateway</p>
            <h3 className="text-sm font-bold text-[var(--text-main)] mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Stripe Connected
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--surface)] border border-[var(--border-line)] p-4 rounded-xl shadow-md">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search email, transaction ID, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border-line)] rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#df6742]/60 transition-all text-[var(--text-main)]"
            />
            <FaSearch className="absolute left-3 top-3.5 text-xs text-[var(--text-subtle)]" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--background)] border border-[var(--border-line)] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#df6742]/60 cursor-pointer text-[var(--text-muted)] w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#df6742]" />
                <p className="text-xs text-[var(--text-muted)]">Loading transactions...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--hover-bg)] border-b border-[var(--border-line)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="p-4 pl-6">Transaction / Buyer</th>
                    <th className="p-4">Artwork</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center pr-6">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-line)] text-xs sm:text-sm">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn._id || txn.id} className="hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-main)]">
                      <td className="p-4 pl-6 space-y-1">
                        <p className="font-mono text-[var(--text-subtle)] text-[11px] truncate max-w-40">{txn.transactionId || "N/A"}</p>
                        <p className="font-semibold text-[var(--text-main)] truncate max-w-50">{txn.buyerEmail || "N/A"}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-500/10 text-blue-400 max-w-40 truncate block">
                          {txn.artworkTitle || "Artwork"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#df6742]">
                        ${(Number(txn.price) || Number(txn.amount) || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-[var(--text-muted)] font-medium">
                        <span className="flex items-center gap-1">
                          <FaCreditCard className="text-[11px]" /> CARD
                        </span>
                      </td>
                      <td className="p-4">
                        {["paid", "succeeded"].includes(txn.status?.toLowerCase()) ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                            <FaCheckCircle /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                            <FaExclamationTriangle /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center pr-6">
                        <button
                          onClick={() => toast.success(`Invoice: ${txn._id || txn.id}`)}
                          className="p-2 bg-[var(--background)] hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors border border-[var(--border-line)]"
                          title="Download Receipt"
                        >
                          <FaDownload className="text-[11px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!loading && filteredTransactions.length === 0 && (
            <p className="text-center text-xs text-[var(--text-subtle)] py-12">No transactions found.</p>
          )}
        </div>

      </div>
    </div>
  );
}