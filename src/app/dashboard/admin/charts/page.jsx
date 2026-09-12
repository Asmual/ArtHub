"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { FaChartPie, FaChartLine, FaSyncAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import Loading from "@/app/loading";
import { getAuthToken } from "@/lib/auth-utils";

const COLORS = ["#df6742", "#1d9bf0", "#00ba7c", "#eab308", "#a855f7"];

export default function AdminChartsPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const fetchChartsData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let rawSales = null;
      let rawCategories = null;

      // 1. Try local internal endpoints first
      try {
        const [localSales, localCategories] = await Promise.all([
          fetch("/api/admin/analytics/sales-chart"),
          fetch("/api/admin/analytics/categories"),
        ]);
        if (localSales.ok) rawSales = await localSales.json();
        if (localCategories.ok) rawCategories = await localCategories.json();
      } catch (localErr) {
        console.warn("Local charts fetch skipped, trying external gateway:", localErr);
      }

      // 2. Fallback to external backend if needed
      if (!rawSales || !rawCategories) {
        const token = await getAuthToken(user.email);
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        };

        const [salesRes, categoriesRes] = await Promise.all([
          fetch(`${base}/api/admin/analytics/sales-chart`, { method: "GET", headers }),
          fetch(`${base}/api/admin/analytics/categories`, { method: "GET", headers }),
        ]);

        if (salesRes.ok) rawSales = await salesRes.json();
        if (categoriesRes.ok) rawCategories = await categoriesRes.json();
      }

      setSalesData(
        Array.isArray(rawSales)
          ? rawSales.map((item) => ({
              name: item._id || "Unknown",
              Sales: item.sales || 0,
              Revenue: item.revenue || 0,
            }))
          : []
      );

      setCategoryData(
        Array.isArray(rawCategories)
          ? rawCategories.map((item) => ({
              name: item._id || "Uncategorized",
              value: item.count || 0,
            }))
          : []
      );
    } catch (err) {
      console.error("Chart data fetch error:", err);
      toast.error("Failed to load chart data.");
    } finally {
      setLoading(false);
    }
  }, [base, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading && mounted && user) fetchChartsData();
  }, [authLoading, mounted, user, fetchChartsData]);

  const handleRefresh = async () => {
    await fetchChartsData();
    toast.success("Charts refreshed successfully.");
  };

  if (!mounted || authLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 sm:p-10 text-[var(--text-main)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaChartLine className="text-[#df6742] text-xl" /> Data Visualization Hub
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Sales trends and artwork category distribution charts.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--hover-bg)] border border-[var(--border-line)] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 text-[var(--text-main)]"
          >
            <FaSyncAlt className={`text-xs text-[#df6742] ${loading ? "animate-spin" : ""}`} />
            Refresh Charts
          </button>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Sales & Revenue Bar Chart */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-line)] pb-3">
                <FaChartLine className="text-[#df6742] text-sm" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Sales & Revenue Overview</h3>
              </div>
              <div className="w-full h-80 text-xs">
                {salesData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[var(--text-subtle)] text-xs">
                    No sales data available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-line)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border-line)", borderRadius: "12px", color: "var(--text-main)" }}
                        itemStyle={{ color: "var(--text-main)" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Bar dataKey="Revenue" fill="#df6742" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Sales" fill="#1d9bf0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border-line)] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-line)] pb-3">
                <FaChartPie className="text-[#df6742] text-sm" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Artworks by Category</h3>
              </div>
              <div className="w-full h-64 flex items-center justify-center">
                {categoryData.length === 0 ? (
                  <div className="text-[var(--text-subtle)] text-xs">No category data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border-line)", borderRadius: "12px", color: "var(--text-main)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie Chart Legend */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-line)] text-[11px]">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[var(--text-muted)] truncate">{entry.name}</span>
                    <span className="text-[var(--text-subtle)] font-mono ml-auto">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}