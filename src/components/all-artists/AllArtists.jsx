/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaStar, FaSearch, FaSlidersH } from 'react-icons/fa';

const RANK_BADGE = {
  0: "bg-[#df6742] text-white",
  1: "bg-slate-200 dark:bg-white/[0.13] text-slate-600 dark:text-white/75",
  2: "bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-white/45",
};

const AVATAR_GRADIENTS = [
  "from-[#e8a0b8] to-[#df6742]",
  "from-[#7ecec4] to-[#185FA5]",
  "from-[#c9a0dc] to-[#534AB7]",
];

const formatCount = (n = 0) => {
  const num = Number(n) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};

const getInitials = (name = "") => {
  if (!name) return "AA";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};

const getArtworksCount = (artist = {}) => {
  if (typeof artist.totalArtworks === "number") return artist.totalArtworks;
  if (typeof artist.totalArts === "number") return artist.totalArts;
  if (typeof artist.artworksCount === "number") return artist.artworksCount;
  if (Array.isArray(artist.artworks)) return artist.artworks.length;
  if (Array.isArray(artist.arts)) return artist.arts.length;
  return Number(artist.totalArtworks || artist.totalArts || artist.artworksCount || artist.artworksLength || 0);
};

const getSalesCount = (artist = {}) => {
  if (typeof artist.totalSold === "number") return artist.totalSold;
  if (typeof artist.totalSales === "number") return artist.totalSales;
  if (typeof artist.salesCount === "number") return artist.salesCount;
  if (Array.isArray(artist.sales)) return artist.sales.length;
  if (Array.isArray(artist.sold)) return artist.sold.length;
  return Number(artist.totalSold || artist.totalSales || artist.salesCount || artist.soldCount || 0);
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

export default function AllArtists({ artists = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  const specialties = useMemo(() => {
    const list = new Set(artists.map(a => a?.specialty).filter(Boolean));
    return ['All', ...Array.from(list)];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      if (!artist) return false;
      
      const matchesSearch = (artist.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
        
      const matchesSpecialty = specialtyFilter === 'All' || 
        (artist.specialty || '').toLowerCase() === specialtyFilter.toLowerCase();
        
      return matchesSearch && matchesSpecialty;
    });
  }, [artists, searchTerm, specialtyFilter]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#243239] p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 text-xs" />
          <input
            type="text"
            placeholder="Search master artists by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/25 focus:outline-none focus:border-[#df6742]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <FaSlidersH className="text-[#df6742] text-xs hidden sm:block" />
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full sm:w-44 bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#df6742]/50 transition-colors cursor-pointer"
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec} className="bg-white dark:bg-[#243239] text-slate-800 dark:text-white">
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#243239] rounded-xl border border-slate-200 dark:border-white/5">
          <p className="text-slate-500 dark:text-white/40 text-xs">No artists found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredArtists.map((artist, i) => {
            const artistRating = artist.rating ? Number(artist.rating).toFixed(1) : "5.0";
            const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            const dynamicImage = artist.image || artist.profileImage || artist.avatar;
            const artistId = artist._id?.toString() || artist._id || i;

            const artworksCount = getArtworksCount(artist);
            const salesCount = getSalesCount(artist);

            return (
              <div
                key={artistId}
                className="group bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/8 rounded-xl p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#df6742]/40 hover:-translate-y-0.5 flex flex-col items-center text-center relative"
              >
                {i < 3 && (
                  <div className={`absolute top-3.5 left-3.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${RANK_BADGE[i]}`}>
                    {i + 1}
                  </div>
                )}

                <div className="absolute top-3.5 right-3.5 bg-white/90 dark:bg-[#2f3f48]/90 backdrop-blur-md border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
                  <FaStar className="text-amber-400 text-[10px]" />
                  <span className="text-slate-800 dark:text-white text-[10px] font-bold">{artistRating}</span>
                </div>

                <div className="relative mb-3 mt-1">
                  {dynamicImage ? (
                    <img
                      src={dynamicImage}
                      alt={artist.name || "Artist Profile"}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#2f3f48] ring-2 ring-[#df6742]/20 group-hover:ring-[#df6742]/50 transition-all duration-300"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-full bg-linear-to-br border-2 border-white dark:border-[#2f3f48] ring-2 ring-[#df6742]/20 group-hover:ring-[#df6742]/50 flex items-center justify-center text-white text-base font-bold transition-all duration-300 ${gradient}`}>
                      {getInitials(artist.name)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white dark:border-[#243239]" />
                </div>

                <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-snug mb-0.5 group-hover:text-[#df6742] transition-colors duration-200 w-full truncate px-1">
                  {artist.name || "Unknown Artist"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-[0.8px] font-medium mb-3 w-full truncate px-1">
                  {artist.specialty || "Visual Artist"}
                </p>

                <div className="grid grid-cols-2 gap-1.5 mb-4 w-full">
                  {[
                    { label: "Artworks", value: formatCount(artworksCount) },
                    { label: "Sales", value: formatCount(salesCount) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/5 rounded-lg py-1.5 flex flex-col items-center">
                      <span className="text-xs font-bold text-[#df6742]">{value}</span>
                      <span className="text-[8px] text-slate-400 dark:text-white/30 uppercase tracking-[0.5px] font-semibold">{label}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/artists-profile/${artistId}`}
                  className="mt-auto block w-full py-2 text-center text-xs font-bold tracking-wide bg-[#df6742] text-white hover:bg-[#ca5633] active:scale-[0.98] rounded-lg shadow-xs transition-all duration-200"
                >
                  View Profile
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}