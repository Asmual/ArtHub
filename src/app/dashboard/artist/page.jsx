/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Palette,
  DollarSign,
  PlusCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
  ImageOff,
  Crown,
  Sparkles,
  Zap,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

const TIER_CONFIGS = {
  free: {
    title: "Free Creator Starter",
    badgeText: "Free Starter Tier",
    badgeClass: "bg-slate-500/15 border border-slate-500/30 text-slate-300",
    cardClass: "bg-[var(--surface)] border-[var(--border-line)]",
    icon: Palette,
    commission: "15% Platform Fee",
    description: "You are on the free starter tier with up to 5 artwork uploads. Upgrade anytime to unlock higher quotas and reduce platform commission.",
  },
  basic: {
    title: "Basic Artist Plan",
    badgeText: "Basic Artist",
    badgeClass: "bg-blue-500/15 border border-blue-500/30 text-blue-400",
    cardClass: "bg-[var(--surface)] border-blue-500/30 shadow-blue-500/5",
    icon: Palette,
    commission: "10% Platform Fee",
    description: "Up to 20 artwork uploads included with 1080p display, direct inquiries, and reduced 10% commission fees.",
  },
  pro: {
    title: "Pro Artist Plan",
    badgeText: "Verified Pro Artist",
    badgeClass: "bg-[#df6742]/15 border border-[#df6742]/30 text-[#df6742]",
    cardClass: "bg-[var(--surface)] border-[#df6742]/40 shadow-[#df6742]/10",
    icon: Sparkles,
    commission: "5% Platform Fee",
    description: "Up to 60 artworks, ultra-low 5% commission, verified blue badge, and priority gallery placement.",
  },
  ultimate: {
    title: "Ultimate Studio Plan",
    badgeText: "VIP Master Studio",
    badgeClass: "bg-amber-500/15 border border-amber-500/30 text-amber-400",
    cardClass: "bg-[var(--surface)] border-amber-500/40 shadow-amber-500/10",
    icon: Crown,
    commission: "0% Commission (Keep 100%)",
    description: "Unlimited artwork capacity, zero platform commission, 4K display, and dedicated curator support.",
  },
};

export default function ArtistDashboard() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [stats, setStats] = useState({ totalArts: 0, totalEarnings: 0 });
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Strictly bind routing access permissions to registered artists only
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "artist") {
        toast.error("Restricted access area. Visual creators only!");
        router.replace("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.id || user.role !== "artist") return;

    const fetchArtistData = async () => {
      try {
        setLoading(true);
        let statsData = null;
        let galleryData = null;

        // 1. Try local internal endpoints first
        try {
          const [localStats, localGallery] = await Promise.all([
            fetch(`/api/artists/${user.id}/stats`),
            fetch(`/api/artworks?email=${encodeURIComponent(user.email || "")}&limit=3`),
          ]);
          if (localStats.ok) statsData = await localStats.json();
          if (localGallery.ok) galleryData = await localGallery.json();
        } catch (localErr) {
          console.warn("Local artist stats fetch skipped, trying external gateway:", localErr);
        }

        // 2. Fallback to external backend if needed
        if (!statsData) {
          const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
          const token = await getAuthToken(user.email);

          const [statsResponse, galleryResponse] = await Promise.all([
            fetch(`${base}/api/artists/${user.id}/stats`, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            }),
            fetch(`${base}/api/artworks?artistId=${user.id}&limit=3&sort=newest`, {
              headers: { "Content-Type": "application/json" },
            }),
          ]);

          if (statsResponse.ok) statsData = await statsResponse.json();
          if (galleryResponse.ok) galleryData = await galleryResponse.json();
        }

        if (statsData) {
          setStats({
            totalArts: statsData.totalArtworks || 0,
            totalEarnings: statsData.totalEarnings || statsData.totalRevenue || 0,
          });
        }

        if (galleryData) {
          const list = Array.isArray(galleryData)
            ? galleryData
            : Array.isArray(galleryData?.artworks)
              ? galleryData.artworks
              : [];
          setRecentArtworks(list.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load dynamic artist dashboard metrics:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [user]);

  // Fetch verified subscription metrics for the artist
  useEffect(() => {
    if (!user?.email || user.role !== "artist") return;

    fetch(`/api/subscription?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubscription(data);
        }
      })
      .catch((err) => console.error("Failed to load artist subscription:", err));
  }, [user?.email, user?.role]);

  if (authLoading || (!user || user.role !== "artist")) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-2 text-[var(--text-main)]">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        <p className="text-xs text-[var(--text-muted)]">Securing studio session...</p>
      </div>
    );
  }

  const currentPlanKey = (subscription?.plan || "free").toLowerCase();
  const tierConfig = TIER_CONFIGS[currentPlanKey] || TIER_CONFIGS.free;
  const TierIcon = tierConfig.icon;
  const isUnlimited = subscription?.limitNumber === Infinity || currentPlanKey === "ultimate";
  const quotaLimit = isUnlimited ? Infinity : (subscription?.limitNumber || 5);
  const currentCount = subscription?.artworkCount !== undefined ? subscription.artworkCount : stats.totalArts;
  const remainingSlots = isUnlimited ? "Unlimited" : Math.max(0, quotaLimit - currentCount);
  const quotaPercentage = isUnlimited
    ? 100
    : Math.min(100, Math.round((currentCount / quotaLimit) * 100));

  return (
    <div className="space-y-6 w-full text-[var(--text-main)] p-2 sm:p-4">
   
      <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-line)] relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#df6742]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-block px-2.5 py-0.5 bg-[#df6742]/10 border border-[#df6742]/20 rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#df6742]">
                Creator Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide">
              {user?.name || "Creator"}&apos;s Studio
            </h1>
            <p className="text-[var(--text-muted)] text-xs sm:text-sm max-w-xl leading-relaxed">
              Welcome back! Showcase your creativity, upload new canvas masterpieces, and monitor your global sales analytics in real-time.
            </p>
          </div>
         
          <Link
            href="/dashboard/artist/add-art"
            className="flex items-center gap-2 bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] shrink-0 h-fit w-fit"
          >
            <PlusCircle size={16} /> Upload Masterpiece
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       
        <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border-line)] flex items-center justify-between hover:border-[var(--border-strong)] transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Artwork Creations</p>
            <h3 className="text-2xl font-black text-[var(--text-main)]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-500" /> : stats.totalArts}
            </h3>
          </div>
          <div className="p-3 bg-[#df6742]/10 rounded-xl border border-[#df6742]/20 group-hover:bg-[#df6742]/20 transition-all">
            <Palette className="w-5 h-5 text-[#df6742]" />
          </div>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border-line)] flex items-center justify-between hover:border-[var(--border-strong)] transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Revenue Generated</p>
            <h3 className="text-2xl font-black text-emerald-400 flex items-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-500" /> : `$${stats.totalEarnings.toFixed(2)}`}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-all">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* 3. Highlighted Active Subscription Membership Showcase Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden shadow-lg ${tierConfig.cardClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${tierConfig.badgeClass}`}>
                <TierIcon size={12} />
                <span>{tierConfig.badgeText}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Status</span>
              </span>
              {subscription?.subscription?.interval && subscription?.subscription?.interval !== "free" && (
                <span className="text-[10px] text-[var(--text-muted)] font-medium capitalize bg-[var(--hover-bg)] px-2.5 py-1 rounded-md border border-[var(--border-line)]">
                  Billed {subscription.subscription.interval}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
                {tierConfig.title}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
                {tierConfig.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Zap size={14} />
              <span>{currentPlanKey === "ultimate" ? "Explore All Tiers" : "Upgrade Membership"}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Quota Progress Bar & Commission Breakdown */}
        <div className="mt-5 pt-4 border-t border-[var(--border-line)]/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Progress Bar (Col 8) */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <Palette size={13} className="text-[#df6742]" />
                <span>Artwork Upload Allowance</span>
              </span>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                {isUnlimited ? (
                  <strong className="text-amber-400 font-bold">{currentCount} Artworks (Unlimited Slots)</strong>
                ) : (
                  <span>
                    <strong className="text-[var(--text-main)]">{currentCount}</strong> / {quotaLimit} Artworks
                    <span className="text-emerald-500 font-semibold ml-1">
                      ({remainingSlots} remaining)
                    </span>
                  </span>
                )}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[var(--hover-bg)] overflow-hidden border border-[var(--border-line)]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUnlimited
                    ? "w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
                    : quotaPercentage >= 100
                    ? "bg-red-500"
                    : quotaPercentage >= 80
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-[#df6742] to-orange-400"
                }`}
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>

            {/* Quota full warning */}
            {!isUnlimited && subscription?.canUploadMore === false && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-semibold pt-0.5">
                <AlertTriangle size={13} className="shrink-0" />
                <span>Upload limit reached! Upgrade your subscription tier to publish more artworks.</span>
              </div>
            )}
          </div>

          {/* Commission & Platform Fee Pill (Col 4) */}
          <div className="md:col-span-4 flex items-center md:justify-end gap-3 text-xs">
            <div className="p-2.5 px-3 rounded-xl bg-[var(--hover-bg)] border border-[var(--border-line)] text-right w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Platform Commission
              </span>
              <span className="text-sm font-black text-emerald-400">
                {tierConfig.commission}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-1 bg-[var(--surface)] p-5 rounded-xl border border-[var(--border-line)] space-y-4 h-fit">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Studio Navigation</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Manage your collections and profile metadata</p>
          </div>
         
          <div className="space-y-2 pt-2">
            <Link
              href="/dashboard/artist/manage-artworks"
              className="flex items-center justify-between p-3 bg-[var(--hover-bg)] hover:bg-[var(--border-line)] rounded-xl border border-[var(--border-line)] transition-all group text-sm"
            >
              <span className="text-[var(--text-muted)] group-hover:text-[#df6742] transition-colors">My Gallery Showcase</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[#df6742] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/dashboard/artist/profile"
              className="flex items-center justify-between p-3 bg-[var(--hover-bg)] hover:bg-[var(--border-line)] rounded-xl border border-[var(--border-line)] transition-all group text-sm"
            >
              <span className="text-[var(--text-muted)] group-hover:text-[#df6742] transition-colors">Artist Profile Settings</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[#df6742] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[var(--surface)] p-5 rounded-xl border border-[var(--border-line)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Recent Studio Uploads</h3>
              <p className="text-[11px] text-[var(--text-muted)]">The latest visual art pieces curated by you</p>
            </div>
            <Link href="/dashboard/artist/manage-artworks" className="text-xs font-bold text-[#df6742] hover:underline flex items-center gap-1">
              View Full Gallery <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#df6742]" />
              </div>
            ) : recentArtworks.length === 0 ? (
              <div className="text-center py-10 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-line)]">
                <TrendingUp className="w-5 h-5 mx-auto text-[var(--text-subtle)] mb-1" />
                <p className="text-xs text-[var(--text-muted)]">No artwork submissions found. Start uploading your masterpieces!</p>
              </div>
            ) : (
              recentArtworks.map((art) => (
                <div
                  key={art._id}
                  className="p-3 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-line)] flex items-center justify-between gap-3 text-xs hover:border-[var(--border-strong)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[var(--hover-bg)] rounded-lg overflow-hidden shrink-0 border border-[var(--border-line)]">
                      {art.image ? (
                        <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-subtle)]"><ImageOff size={14} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--text-main)] truncate">{art.title}</p>
                      <p className="text-[10px] text-[#df6742] font-semibold tracking-wide uppercase mt-0.5">{art.category || "General"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-[var(--text-main)] text-sm block">
                      ${Number(art.price || 0).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-[var(--text-subtle)] block font-mono">
                      {art.isSold ? "Sold" : "Available"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}