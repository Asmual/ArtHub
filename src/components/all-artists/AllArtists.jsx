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
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const getInitials = (name = "") => {
  if (!name) return "AA";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};

// সিঙ্কড স্কেলেটন লোডার কার্ড
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

  // ইউনিক স্পেশাল্টি লিস্ট বের করা (ফিল্টার ড্রপডাউনের জন্য)
  const specialties = useMemo(() => {
    const list = new Set(artists.map(a => a?.specialty).filter(Boolean));
    return ['All', ...Array.from(list)];
  }, [artists]);

  // ইনফিনিট লুপ ছাড়া সেফ ফিল্টারিং (useMemo ব্যবহার করা হয়েছে পারফরম্যান্সের জন্য)
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
    <div className="space-y-8">
      {/* ফিল্টার এবং সার্চ বার কন্ট্রোল */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#243239] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-lg">
        {/* সার্চ ইনপুট */}
        <div className="relative w-full md:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 text-sm" />
          <input
            type="text"
            placeholder="Search master artists by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-[#df6742]/50 transition-colors"
          />
        </div>

        {/* ড্রপডাউন ফিল্টার */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <FaSlidersH className="text-[#df6742] text-sm hidden sm:block" />
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#df6742]/50 transition-colors cursor-pointer"
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec} className="bg-white dark:bg-[#243239] text-slate-800 dark:text-white">
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* মেইন গ্রিড লেআউট */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#243239] rounded-2xl border border-slate-200 dark:border-white/5">
          <p className="text-slate-500 dark:text-white/40 text-sm">No artists found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredArtists.map((artist, i) => {
            const artistRating = artist.rating ? Number(artist.rating).toFixed(1) : "5.0";
            const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            const dynamicImage = artist.image || artist.profileImage;
            const artistId = artist._id?.toString() || artist._id || i;

            return (
              <div
                key={artistId}
                className="group bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/8 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300 hover:border-[#df6742]/40 hover:-translate-y-1 flex flex-col items-center text-center relative"
              >
                {/* র্যাঙ্ক ব্যাজ */}
                {i < 3 && (
                  <div className={`absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold z-10 ${RANK_BADGE[i]}`}>
                    {i + 1}
                  </div>
                )}

                {/* রেটিং ব্যাজ */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-[#2f3f48]/90 backdrop-blur-md border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-lg flex items-center gap-1 z-10">
                  <FaStar className="text-amber-400 text-xs" />
                  <span className="text-slate-800 dark:text-white text-[11px] font-bold">{artistRating}</span>
                </div>

                {/* প্রোফাইল ইমেজ বা ইনিশিয়াল */}
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
                    { label: "Artworks", value: formatCount(artist.totalArtworks ?? artist.totalArts) },
                    { label: "Sales", value: formatCount(artist.totalSold ?? artist.totalSales) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 flex flex-col items-center gap-0.5">
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
    </div>
  );
}