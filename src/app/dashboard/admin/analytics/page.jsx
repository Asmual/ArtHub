"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaChartBar, FaUsers, FaPalette, FaDollarSign, FaChartLine, FaChartPie } from "react-icons/fa";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import Loading from "@/app/loading";
import { getAuthToken } from "@/lib/auth-utils";

const CATEGORY_COLORS = ["bg-[#df6742]", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500"];

export default function AnalyticsPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeArtists: 0,
    totalArtworksPublished: 0,
    platformGrossRevenue: 0,
  });
  const [categoriesData, setCategoriesData] = useState([]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      let analyticsData = null;
      let rawCategories = null;

      // 1. Try local internal endpoints first
      try {
        const [localAnalytics, localCategories] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/analytics/categories"),
        ]);
        if (localAnalytics.ok) analyticsData = await localAnalytics.json();
        if (localCategories.ok) rawCategories = await localCategories.json();
      } catch (localErr) {
        console.warn("Local analytics skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!analyticsData || !rawCategories) {
        const token = await getAuthToken(user.email);
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        };

        const [analyticsRes, categoriesRes] = await Promise.all([
          fetch(`${base}/api/admin/analytics`, { method: "GET", headers }),
          fetch(`${base}/api/admin/analytics/categories`, { method: "GET", headers }),
        ]);

        if (analyticsRes.ok) analyticsData = await analyticsRes.json();
        if (categoriesRes.ok) rawCategories = await categoriesRes.json();
      }

      setMetrics({
        totalUsers: analyticsData.totalUsers || 0,
        activeArtists: analyticsData.totalArtists || 0,
        totalArtworksPublished: analyticsData.totalArtworks || 0,
        platformGrossRevenue: analyticsData.totalRevenue || 0,
      });

      if (Array.isArray(rawCategories) && rawCategories.length > 0) {
        const total = rawCategories.reduce((sum, item) => sum + (item.count || 0), 0);
        setCategoriesData(
          rawCategories.map((item, idx) => ({
            name: item._id || "Uncategorized",
            count: item.count || 0,
            percentage: total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0,
            color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          }))
        );
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      toast.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [base, user?.email]);

  useEffect(() => {
    if (authLoading || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, [authLoading, user, fetchAnalytics]);

  if (authLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 sm:p-10 text-[var(--text-main)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaChartBar className="text-[#df6742] text-xl" /> Platform Analytics
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time tracking of marketplace performance, users, and category distribution.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gross Revenue", value: `$${metrics.platformGrossRevenue.toLocaleString()}`, icon: FaDollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Registered Users", value: metrics.totalUsers.toLocaleString(), icon: FaUsers, color: "text-[#df6742]", bg: "bg-[#df6742]/10" },
            { label: "Active Artists", value: `${metrics.activeArtists} Artists`, icon: FaChartLine, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Total Artworks", value: `${metrics.totalArtworksPublished} Items`, icon: FaPalette, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 shadow-md flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                <Icon className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-wider">{label}</p>
                <h3 className="text-xl font-black text-[var(--text-main)] mt-0.5">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Category Distribution */}
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border-line)] pb-3">
              <FaChartPie className="text-[#df6742] text-sm" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Artworks by Category</h3>
            </div>

            {categoriesData.length === 0 ? (
              <p className="text-sm text-[var(--text-subtle)] text-center py-8">No category data available.</p>
            ) : (
              <div className="space-y-4">
                {categoriesData.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-[var(--text-main)]">{cat.name} ({cat.count} artworks)</span>
                      <span className="text-[var(--text-muted)] font-mono">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--background)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-line)] pb-3">
              <FaChartLine className="text-[#df6742] text-sm" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Platform Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Users", value: metrics.totalUsers, color: "text-[#df6742]" },
                { label: "Total Artists", value: metrics.activeArtists, color: "text-blue-400" },
                { label: "Artworks Listed", value: metrics.totalArtworksPublished, color: "text-amber-400" },
                { label: "Total Revenue", value: `$${metrics.platformGrossRevenue.toLocaleString()}`, color: "text-emerald-400" },
              ].map(({ label, value, color }, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border-line)] last:border-0">
                  <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
                  <span className={`text-sm font-black ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}