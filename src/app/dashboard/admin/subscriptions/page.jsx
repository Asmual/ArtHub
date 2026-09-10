/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Search,
  RefreshCw,
  UserX,
  Sparkles,
  Palette,
  Loader2,
  DollarSign,
  Users,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import Loading from "@/app/loading";


const PLAN_BADGES = {
  free: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
  basic: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  pro: "bg-[var(--brand)]/15 text-[var(--brand)] border-[var(--brand)]/30",
  ultimate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function AdminSubscriptionsPage() {
  const { data: session, isPending: authLoading } = useSession();
  const user = session?.user;

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [targetUser, setTargetUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(""); // "change_plan" | "unsubscribe" | "suspend"
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load subscriptions.");
      }
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error("Fetch subscriptions error:", err);
      toast.error(err.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchSubscriptions();
  }, [authLoading, user, fetchSubscriptions]);

  const handleOpenAction = (u, action) => {
    setTargetUser(u);
    setModalAction(action);
    setSelectedPlan(u.plan === "free" ? "basic" : u.plan);
    setIsModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!targetUser) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetUser.email,
          action: modalAction,
          plan: modalAction === "change_plan" ? selectedPlan : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update subscription.");
      }

      toast.success(data.message || "Subscription updated successfully.");
      setIsModalOpen(false);
      fetchSubscriptions();
    } catch (err) {
      console.error("Action error:", err);
      toast.error(err.message || "Failed to execute subscription action.");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) return <Loading />;

  // Filter subscriptions
  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === "all" || sub.plan === planFilter;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Analytics counts
  const totalUsers = subscriptions.length;
  const paidCount = subscriptions.filter((s) => s.plan !== "free" && s.status === "active").length;
  const freeCount = subscriptions.filter((s) => s.plan === "free").length;
  const estMRR = subscriptions.reduce((sum, s) => {
    if (s.status !== "active") return sum;
    if (s.plan === "basic") return sum + 10;
    if (s.plan === "pro") return sum + 20;
    if (s.plan === "ultimate") return sum + 50;
    return sum;
  }, 0);

  return (
    <div
      className="p-6 sm:p-10 bg-background text-foreground min-h-screen space-y-8"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] text-[11px] font-bold tracking-wider uppercase mb-2">
            <Crown size={13} />
            <span>Artist Subscription Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Manage Artist <span className="text-[var(--brand)]">Subscriptions</span>
          </h1>
          <p className="text-xs text-foreground/60 mt-1">
            Monitor, change, unsubscribe, or suspend artist tiers and artwork upload quotas in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSubscriptions}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-strong text-xs font-bold hover:bg-[var(--hover-bg)] transition-colors cursor-pointer self-start"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border-line">
          <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
            <span>Total Creators</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalUsers}</div>
          <span className="text-[10px] text-foreground/50">Registered artist profiles</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-line">
          <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
            <span>Active Paid Plans</span>
            <Sparkles size={16} className="text-[var(--brand)]" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--brand)]">{paidCount}</div>
          <span className="text-[10px] text-foreground/50">Basic, Pro & Ultimate</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-line">
          <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
            <span>Free Tier Artists</span>
            <Palette size={16} className="text-neutral-400" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{freeCount}</div>
          <span className="text-[10px] text-foreground/50">Limited to 5 artworks</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-line">
          <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
            <span>Estimated MRR</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">${estMRR}</div>
          <span className="text-[10px] text-foreground/50">Monthly subscription volume</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-surface p-4 rounded-2xl border border-border-line">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search creator by name or email..."
            className="w-full bg-background border border-border-line rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-foreground/40 focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-background border border-border-line rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="free">Free Tier (5 max)</option>
            <option value="basic">Basic ($10)</option>
            <option value="pro">Pro ($20)</option>
            <option value="ultimate">Ultimate ($50)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border-line rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-surface border border-border-line rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--hover-bg)] text-foreground/60 uppercase tracking-wider text-[10px] border-b border-border-line">
              <tr>
                <th className="py-3 px-4 font-bold">Creator</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Active Plan</th>
                <th className="py-3 px-4 font-bold">Quota Usage</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground/50">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[var(--brand)]" />
                    Loading subscriber records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground/50">
                    No creators found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const isAtQuota = sub.limitNumber !== Infinity && sub.artworkCount >= sub.limitNumber;
                  const percent = sub.limitNumber === Infinity ? 10 : Math.min(100, Math.round((sub.artworkCount / sub.limitNumber) * 100));

                  return (
                    <tr key={sub._id || sub.email} className="hover:bg-[var(--hover-bg)]/40 transition-colors">
                      {/* Creator Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.name}`}
                            alt={sub.name}
                            className="w-8 h-8 rounded-full object-cover border border-border-line shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{sub.name}</p>
                            <p className="text-[10px] text-foreground/50 truncate">{sub.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-border-line text-foreground/75 font-semibold text-[10px]">
                          {sub.role}
                        </span>
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${PLAN_BADGES[sub.plan] || PLAN_BADGES.free}`}>
                          {sub.plan === "ultimate" && <Crown size={11} className="text-amber-400" />}
                          {sub.plan === "pro" && <Sparkles size={11} className="text-[var(--brand)]" />}
                          <span>{sub.plan}</span>
                        </span>
                      </td>

                      {/* Quota Usage */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex justify-between text-[10px]">
                            <span className={isAtQuota ? "font-bold text-amber-500" : "font-medium text-foreground/80"}>
                              {sub.artworkCount} / {sub.artworkLimit}
                            </span>
                            <span className="text-foreground/50">{percent}%</span>
                          </div>
                          <div className="w-full bg-border-line h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isAtQuota ? "bg-amber-500" : "bg-[var(--brand)]"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sub.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : sub.status === "suspended"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-neutral-500/15 text-neutral-400"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      {/* Action Dropdown / Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Change Plan Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAction(sub, "change_plan")}
                            className="px-2.5 py-1 rounded-lg bg-[var(--hover-bg)] hover:bg-border-line text-foreground/80 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Modify Subscription Plan"
                          >
                            Change Plan
                          </button>

                          {/* Unsubscribe / Revert Button */}
                          {sub.plan !== "free" && (
                            <button
                              type="button"
                              onClick={() => handleOpenAction(sub, "unsubscribe")}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Cancel subscription and revert to free"
                            >
                              Unsubscribe
                            </button>
                          )}

                          {/* Suspend / Reactivate */}
                          {sub.status === "suspended" ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAction(sub, "reactivate")}
                              className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
                              title="Reactivate Subscription"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAction(sub, "suspend")}
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                              title="Suspend Subscription"
                            >
                              <UserX size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Subscription Action Modal */}
      {isModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border-line rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
                  Administrative Control
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {modalAction === "change_plan" && "Modify Subscription Plan"}
                  {modalAction === "unsubscribe" && "Unsubscribe Creator"}
                  {modalAction === "suspend" && "Suspend Subscription"}
                  {modalAction === "reactivate" && "Reactivate Subscription"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--hover-bg)] border border-border-line text-xs space-y-1.5">
              <p className="font-bold text-foreground">{targetUser.name}</p>
              <p className="text-foreground/60">{targetUser.email}</p>
              <p className="text-foreground/80 pt-1">
                Current: <strong className="uppercase text-[var(--brand)]">{targetUser.plan}</strong> ({targetUser.artworkCount} artworks)
              </p>
            </div>

            {/* Change Plan Selector */}
            {modalAction === "change_plan" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/70">Select New Plan:</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["basic", "pro", "ultimate"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        selectedPlan === p
                          ? "border-[var(--brand)] bg-[var(--brand)]/15 text-[var(--brand)]"
                          : "border-border-line bg-surface text-foreground/70 hover:border-border-strong"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modalAction === "unsubscribe" && (
              <p className="text-xs text-foreground/70 leading-relaxed">
                Are you sure you want to cancel this artist&apos;s subscription? Their plan will revert to <strong>Free</strong> with a maximum limit of 5 artworks.
              </p>
            )}

            {modalAction === "suspend" && (
              <p className="text-xs text-foreground/70 leading-relaxed">
                Suspending this subscription will freeze the artist&apos;s premium privileges and block further artwork uploads until reactivated.
              </p>
            )}

            {modalAction === "reactivate" && (
              <p className="text-xs text-foreground/70 leading-relaxed">
                Reactivating will restore full subscription privileges for this creator.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-border-line text-xs font-semibold text-foreground/70 hover:bg-[var(--hover-bg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
