/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

const RANK_BADGE = {
  0: "bg-amber-500 text-white shadow-md shadow-amber-500/30",
  1: "bg-slate-400 text-white shadow-md",
  2: "bg-amber-700 text-white shadow-md",
  3: "bg-[#df6742] text-white shadow-md",
};

const AVATAR_GRADIENTS = [
  "from-[#e8a0b8] to-[#df6742]",
  "from-[#7ecec4] to-[#185FA5]",
  "from-[#c9a0dc] to-[#534AB7]",
  "from-[#F59E0B] to-[#EF4444]",
];

const formatCount = (n = 0) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const getInitials = (name = "") => {
  if (!name) return "AA";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/8 rounded-2xl p-6 flex flex-col items-center animate-pulse">
    <div className="w-17 h-17 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-slate-100 dark:border-[#2f3f48] mb-4 mt-2" />
    <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded mb-2" />
    <div className="h-3 w-20 bg-slate-100 dark:bg-white/7 rounded mb-6" />
    <div className="flex gap-3 mb-6 w-full">
      {[0, 1].map((i) => (
        <div key={i} className="flex-1 bg-slate-100 dark:bg-white/5 rounded-xl h-14" />
      ))}
    </div>
    <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-xl" />
  </div>
);

const TopArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTopArtists = async () => {
      try {
        setError(null);
        setLoading(true);
       
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        
        let res;
        try {
          res = await fetch("/api/artists/top", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          });
          if (!res.ok) throw new Error("Internal route unsuccessful");
        } catch {
          res = await fetch(`${base}/api/artists/top`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        if (!res.ok) throw new Error("Failed to resolve dynamic top creators catalog.");
       
        const data = await res.json();
      
        const cleanData = Array.isArray(data)
          ? data.slice(0, 4)
          : [];

        if (isMounted) {
          setArtists(cleanData);
        }
      } catch (err) {
        if (isMounted) {
          setError("Could not retrieve top creators portfolio.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTopArtists();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-white dark:bg-[#2f3f48] py-16 px-4 sm:px-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-[#df6742]/12 border border-[#df6742]/28 text-[#df6742] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[1.2px] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#df6742]" />
            FEATURED CREATORS
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-2 leading-tight">
            Top <span className="text-[#df6742]">Artists</span>
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-white/40 max-w-sm mx-auto leading-relaxed">
            Most celebrated creators ranked by their verified masterworks &amp; total sales report
          </p>
        </div>

        {error && <p className="text-center text-slate-500 dark:text-white/35 text-sm py-10">{error}</p>}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6 lg:gap-8">
            {loading
              ? [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : artists.map((artist, i) => {
                  // Safeguard rating and avatar property fallbacks
                  const artistRating = artist.rating || artist.avgRating || "5.0";
                  const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
                  const dynamicImage = artist.image || artist.profileImage || artist.avatar;
                  const artistId = artist._id?.toString() || artist.id || artist._id || i;

                  // Normalize artwork and sales count properties across database schema variations
                  const totalArtworksCount = artist.totalArtworks ?? artist.totalArts ?? artist.artworksCount ?? 0;
                  const totalSoldLines = artist.totalSold ?? artist.totalSales ?? artist.salesCount ?? 0;

                  return (
                    <div
                      key={artistId}
                      className="group bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/8 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300 hover:border-[#df6742]/40 hover:-translate-y-1 flex flex-col items-center text-center relative"
                    >
                      <div className={`absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold z-10 ${RANK_BADGE[i] || "bg-slate-200 dark:bg-white/10"}`}>
                        {i + 1}
                      </div>

                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-[#2f3f48]/90 backdrop-blur-md border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-lg flex items-center gap-1 z-10">
                        <FaStar className="text-amber-400 text-xs" />
                        <span className="text-slate-800 dark:text-white text-[11px] font-bold">{Number(artistRating).toFixed(1)}</span>
                      </div>

                      <div className="relative mb-4 mt-2">
                        {dynamicImage ? (
                          <img
                            src={dynamicImage}
                            alt={artist.name || "Artist Profile"}
                            className="w-17 h-17 rounded-full object-cover border-[3px] border-white dark:border-[#2f3f48] ring-2 ring-[#df6742]/20 group-hover:ring-[#df6742]/50 transition-all duration-300"
                          />
                        ) : (
                          <div className={`w-17 h-17 rounded-full bg-linear-to-br border-[3px] border-white dark:border-[#2f3f48] ring-2 ring-[#df6742]/20 group-hover:ring-[#df6742]/50 flex items-center justify-center text-white text-xl font-bold transition-all duration-300 ${gradient}`}>
                            {getInitials(artist.name)}
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#243239]" />
                      </div>

                      <p className="text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 group-hover:text-[#df6742] transition-colors duration-200 w-full truncate px-1">
                        {artist.name || "Unknown Artist"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-white/40 uppercase tracking-[1px] font-medium mb-5 w-full truncate px-1">
                        {artist.specialty || "Visual Artist"}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-6 w-full">
                        {[
                          { label: "Artworks", value: formatCount(totalArtworksCount) },
                          { label: "Sales", value: formatCount(totalSoldLines) },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 flex flex-col items-center gap-0.5">
                            <span className="text-[15px] font-bold text-[#df6742]">{value}</span>
                            <span className="text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-[0.7px] font-semibold">{label}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`/artists-profile/${artistId}`}
                        className="mt-auto block w-full py-2.5 text-center text-xs font-bold tracking-wide bg-[#df6742] text-white hover:bg-[#ca5633] active:scale-[0.98] rounded-xl shadow-lg shadow-[#df6742]/10 transition-all duration-200"
                      >
                        View Profile
                      </Link>
                    </div>
                  );
                })}
          </div>
        )}

        {!loading && !error && artists.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/all-artists"
              className="inline-block bg-[#df6742] hover:bg-[#ca5633] text-white px-8 py-3 rounded-full text-[13px] font-bold tracking-wide shadow-lg shadow-[#df6742]/10 transition-colors duration-200"
            >
              Explore All Artists
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopArtists;