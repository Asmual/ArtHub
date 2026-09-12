/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { MdEmail, MdVerified } from "react-icons/md";
import {
  Palette,
  ShoppingBag,
  DollarSign,
  ArrowLeft,
  Star,
  Crown,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";
import Artcard from "@/components/artwork/Artcard";
import BrandLoader from "@/components/shared/BrandLoader";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

const formatCount = (n = 0) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const formatRevenue = (n = 0) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
};

const getInitials = (name = "") => {
  if (!name) return "AA";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const PLAN_BADGES = {
  ultimate: {
    label: "Ultimate Studio",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Crown,
  },
  pro: {
    label: "Pro Artist",
    badgeClass: "bg-[#df6742]/10 text-[#df6742] border-[#df6742]/30",
    icon: Sparkles,
  },
  basic: {
    label: "Basic Artist",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Palette,
  },
  free: {
    label: "Creator Member",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    icon: Award,
  },
};

export default function ArtistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params?.id;

  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState({ totalArtworks: 0, totalSales: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!artistId) return;

    const fetchProfileAndAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        let artistData = null;
        let artworksList = [];

        // 1. Fetch from local Next.js route first
        try {
          const res = await fetch(`/api/artists/${encodeURIComponent(artistId)}`, {
            headers: { "Cache-Control": "no-cache" },
          });
          if (res.ok) {
            const json = await res.json();
            artistData = json.artist || json;
            if (Array.isArray(json.artworks)) {
              artworksList = json.artworks;
            }
          }
        } catch {
          // Internal fallback
        }

        // 2. If artistData wasn't found locally, try external server with 3s timeout
        if (!artistData) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${API_BASE}/api/artists/${encodeURIComponent(artistId)}`, {
              signal: controller.signal,
            });
            clearTimeout(timer);
            if (res.ok) {
              const json = await res.json();
              artistData = json.artist || json;
              if (Array.isArray(json.artworks)) {
                artworksList = json.artworks;
              }
            }
          } catch {
            // External fallback failed or timed out
          }
        }

        if (!artistData) {
          throw new Error("Artist profile not found");
        }

        setArtist(artistData);
        setArtworks(artworksList);

        // 3. Fetch stats locally with fallback to artistData metrics
        let totalArts = artistData?.totalArtworks ?? artworksList.length;
        let totalSold = artistData?.totalSold ?? 0;
        let totalRev = artistData?.totalEarnings ?? artistData?.totalRevenue ?? 0;

        try {
          const statsRes = await fetch(`/api/artists/${encodeURIComponent(artistId)}/stats`, {
            headers: { "Cache-Control": "no-cache" },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            totalArts = statsData.totalArtworks ?? totalArts;
            totalSold = statsData.totalSales ?? totalSold;
            totalRev = statsData.totalEarnings ?? statsData.totalRevenue ?? totalRev;
          }
        } catch {
          // Use default stats from artistData
        }

        setStats({
          totalArtworks: totalArts,
          totalSales: totalSold,
          totalRevenue: totalRev,
        });
      } catch (err) {
        console.error("Profile Synchronization Error:", err);
        setError(err.message || "Failed to load creator context profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndAssets();
  }, [artistId]);

  if (loading) return <BrandLoader fullScreen text="Loading Artist Profile..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1e262b] flex flex-col items-center justify-center text-center px-4">
        <p className="text-slate-500 dark:text-white/60 text-sm mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-[#df6742] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const displayedArtworks = showAll ? artworks : artworks.slice(0, 8);
  const dynamicImage = artist?.profileImage || artist?.image;

  // Determine active subscription plan badge
  const planKey = (artist?.plan || artist?.subscriptionTier || artist?.subscription?.plan || "free").toLowerCase();
  const activePlan = PLAN_BADGES[planKey] || PLAN_BADGES.free;
  const PlanIcon = activePlan.icon;

  const STAT_ITEMS = [
    {
      label: "Total Artworks",
      value: formatCount(stats.totalArtworks),
      icon: <Palette size={18} />,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Verified Sales",
      value: formatCount(stats.totalSales),
      icon: <ShoppingBag size={18} />,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Rating & Reviews",
      value: "5.0 ★",
      icon: <Star size={18} />,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Market Volume",
      value: formatRevenue(stats.totalRevenue),
      icon: <DollarSign size={18} />,
      color: "text-[#df6742] bg-[#df6742]/10 border-[#df6742]/20",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#1e262b] pb-24 w-full text-slate-800 dark:text-white transition-colors"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto px-2 sm:px-4 lg:px-6 pt-8 sm:pt-10">
        
        {/* Top Back Navigation Link */}
        <div className="mb-6">
          <NextLink
            href="/all-artists"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 hover:border-[#df6742] dark:hover:border-[#df6742] text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all shadow-sm group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Artists</span>
          </NextLink>
        </div>

        {/* Clean, Elegant Profile Header (Banner Completely Removed) */}
        <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
            
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
              {/* Avatar with Verified Ring */}
              <div className="relative shrink-0">
                {dynamicImage ? (
                  <img
                    src={dynamicImage}
                    alt={artist?.name || "Artist"}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-slate-200 dark:border-white/15 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#df6742] to-[#9c3819] border-2 border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-lg">
                    {getInitials(artist?.name)}
                  </div>
                )}
                {/* Active Presence Dot */}
                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#243239] shadow-sm" />
              </div>

              {/* Identity & Badges */}
              <div className="space-y-2">
                {/* Plan Badge & Status Tag */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                    <MdVerified size={14} className="text-[#3b82f6]" />
                    <span>Verified Creator</span>
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase ${activePlan.badgeClass}`}>
                    <PlanIcon size={13} />
                    <span>{activePlan.label}</span>
                  </span>
                </div>

                {/* Artist Name with Blue Checkmark */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{artist?.name || "Anonymous Creator"}</span>
                  <MdVerified size={24} className="text-[#3b82f6] shrink-0" title="Verified Artist" />
                </h1>

                {/* Specialty */}
                <p className="text-xs sm:text-sm text-[#df6742] font-semibold uppercase tracking-wider">
                  {artist?.specialty || artist?.speciality || "Fine Art & Contemporary Painting"}
                </p>

                {artist?.email && (
                  <p className="text-xs text-slate-500 dark:text-white/50">
                    {artist.email}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Social Actions & Browse Button */}
            <div className="flex flex-col items-center lg:items-end gap-3 self-center lg:self-center">
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-[#1877F2] hover:border-[#1877F2]/40 transition-colors"
                  title="Facebook Profile"
                >
                  <FaFacebookF size={13} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-[#E1306C] hover:border-[#E1306C]/40 transition-colors"
                  title="Instagram Profile"
                >
                  <FaInstagram size={13} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-white transition-colors"
                  title="Twitter / X Profile"
                >
                  <FaTwitter size={13} />
                </a>
                <a
                  href={`mailto:${artist?.email || "artist@arthub.com"}`}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-[#df6742] hover:border-[#df6742]/40 transition-colors"
                  title="Contact Artist"
                >
                  <MdEmail size={15} />
                </a>
              </div>

              <NextLink
                href={`/browse?artistId=${artistId}`}
                className="bg-[#df6742] hover:bg-[#ca5633] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 text-center"
              >
                Browse Collections
              </NextLink>
            </div>
          </div>

          {/* Biography */}
          {artist?.bio && (
            <p className="mt-5 text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed max-w-4xl text-center sm:text-left">
              {artist.bio}
            </p>
          )}
        </div>

        {/* 4 Key Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {STAT_ITEMS.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-sm group hover:border-[#df6742]/40 transition-all"
            >
              <div>
                <span className="text-[11px] text-slate-400 dark:text-white/50 uppercase font-bold tracking-wider block mb-1">
                  {label}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white group-hover:text-[#df6742] transition-colors">
                  {value}
                </span>
              </div>
              <div className={`p-3 rounded-xl border shrink-0 ${color}`}>
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* Artworks Showcase Gallery */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Creator Masterpieces</span>
              <span className="bg-[#df6742]/10 text-[#df6742] text-xs font-bold px-2.5 py-0.5 rounded-full">
                {artworks.length} Total
              </span>
            </h2>
            {artworks.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="text-[#df6742] text-xs font-bold hover:text-[#ca5633] transition-colors uppercase tracking-wider cursor-pointer"
              >
                {showAll ? "Show Less" : "See All Masterworks"}
              </button>
            )}
          </div>

          {artworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#243239] shadow-sm">
              <Palette size={36} className="text-slate-300 dark:text-white/20 mb-3" />
              <p className="text-slate-400 dark:text-white/40 text-sm font-semibold">
                No cataloged artworks found for this artist yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
              {displayedArtworks.map((artwork) => (
                <Artcard
                  key={artwork._id?.$oid || artwork._id?.toString() || artwork.id}
                  artwork={artwork}
                />
              ))}
            </div>
          )}
        </div>

        {artist?.createdAt && (
          <div className="mt-16 pt-6 border-t border-slate-200 dark:border-white/10 text-center sm:text-left">
            <p className="text-xs text-slate-400 dark:text-white/40 font-medium uppercase tracking-wider">
              ArtHub Platform Creator Since {formatDate(artist.createdAt)}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}