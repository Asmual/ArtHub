/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { MdEmail, MdVerified } from "react-icons/md";
import { Palette, ShoppingBag, DollarSign, ArrowLeft } from "lucide-react";
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
        <button onClick={() => router.back()} className="text-[#df6742] text-xs font-bold hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const displayedArtworks = showAll ? artworks : artworks.slice(0, 8);
  const dynamicImage = artist?.profileImage || artist?.image;

  const STAT_ITEMS = [
    { label: "Artworks Cataloged", value: formatCount(stats.totalArtworks), icon: <Palette size={16} /> },
    { label: "Verified Sales", value: formatCount(stats.totalSales), icon: <ShoppingBag size={16} /> },
    { label: "Market Volume", value: formatRevenue(stats.totalRevenue), icon: <DollarSign size={16} /> },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#1e262b] pb-24 w-full text-slate-800 dark:text-white transition-colors"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Decorative Gradient Cover Banner */}
      <div className="relative h-56 sm:h-64 md:h-72 w-full bg-gradient-to-r from-[#df6742] via-[#b34928] to-[#243239] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Top Back Navigation Link */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
          <NextLink
            href="/all-artists"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white text-xs font-bold transition-all border border-white/10"
          >
            <ArrowLeft size={14} /> Back to Artists
          </NextLink>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        
        {/* Profile Identity Card */}
        <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Avatar */}
              <div className="relative shrink-0 -mt-16 sm:-mt-20">
                {dynamicImage ? (
                  <img
                    src={dynamicImage}
                    alt={artist?.name || "Artist"}
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-[#243239] shadow-2xl ring-2 ring-[#df6742]/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#df6742] to-[#9c3819] border-4 border-white dark:border-[#243239] flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                    {getInitials(artist?.name)}
                  </div>
                )}
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#243239]" />
              </div>

              {/* Identity info */}
              <div className="space-y-1.5 pt-2">
                <div className="inline-flex items-center gap-1 bg-[#df6742]/10 border border-[#df6742]/25 text-[#df6742] px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase">
                  <MdVerified size={13} /> Verified Master Artist
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                  {artist?.name || "Anonymous Creator"}
                </h1>
                <p className="text-xs sm:text-sm text-[#df6742] font-semibold uppercase tracking-wider">
                  {artist?.specialty || "Fine Art & Contemporary Painting"}
                </p>
              </div>
            </div>

            {/* Actions & Social Links */}
            <div className="flex flex-col items-center sm:items-end gap-3 self-center sm:self-end">
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-[#1877F2] transition-colors"
                >
                  <FaFacebookF size={13} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-[#E1306C] transition-colors"
                >
                  <FaInstagram size={13} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-white transition-colors"
                >
                  <FaTwitter size={13} />
                </a>
                <a
                  href={`mailto:${artist?.email || "artist@arthub.com"}`}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-[#df6742] transition-colors"
                >
                  <MdEmail size={15} />
                </a>
              </div>
              <NextLink
                href={`/browse?artistId=${artistId}`}
                className="bg-[#df6742] hover:bg-[#ca5633] text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-md active:scale-95"
              >
                Browse Collections
              </NextLink>
            </div>
          </div>

          {/* Biography */}
          {artist?.bio && (
            <p className="mt-6 text-sm text-slate-600 dark:text-white/60 leading-relaxed max-w-4xl text-center sm:text-left">
              {artist.bio}
            </p>
          )}
        </div>

        {/* Statistics Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {STAT_ITEMS.map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-sm group hover:border-[#df6742]/40 transition-all"
            >
              <div>
                <span className="text-[11px] text-slate-400 dark:text-white/40 uppercase font-bold tracking-wider block mb-1">
                  {label}
                </span>
                <span className="text-2xl font-extrabold text-slate-800 dark:text-white group-hover:text-[#df6742] transition-colors">
                  {value}
                </span>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] rounded-2xl border border-[#df6742]/20">
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* Artworks Showcase Gallery */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
              Creator Masterpieces
              <span className="bg-[#df6742]/10 text-[#df6742] text-xs font-bold px-2.5 py-0.5 rounded-full">
                {artworks.length} Total
              </span>
            </h2>
            {artworks.length > 8 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[#df6742] text-xs font-bold hover:text-[#ca5633] transition-colors uppercase tracking-wider"
              >
                {showAll ? "Show Less" : "See All Masterworks"}
              </button>
            )}
          </div>

          {artworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#243239] shadow-sm">
              <Palette size={36} className="text-slate-300 dark:text-white/20 mb-3" />
              <p className="text-slate-400 dark:text-white/40 text-sm font-semibold">No cataloged artworks found for this artist yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedArtworks.map((artwork) => (
                <Artcard key={artwork._id?.$oid || artwork._id?.toString() || artwork.id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>

        {artist?.createdAt && (
          <div className="mt-16 pt-6 border-t border-slate-200 dark:border-white/10 text-center sm:text-left">
            <p className="text-xs text-slate-400 dark:text-white/30 font-medium uppercase tracking-wider">
              ArtHub Platform Creator Since {formatDate(artist.createdAt)}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}