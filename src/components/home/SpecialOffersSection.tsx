/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Sparkles, Tag, ShoppingBag, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface DiscountArtwork {
  _id: string;
  title: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  artistName: string;
}

export default function SpecialOffersSection() {
  const [copied, setCopied] = useState(false);

  // Live Countdown Timer (Deal of the Day - ticks every second)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 24,
    seconds: 36,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Coupon code "${code}" copied! Use at checkout.`);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const padZero = (n: number) => n.toString().padStart(2, "0");

  // Sample curated flash-deal artworks with genuine artwork assets
  const offerArtworks: DiscountArtwork[] = [
    {
      _id: "deal-1",
      title: "Freedom's Charge",
      category: "Painting",
      image: "https://i.ibb.co.com/fzCLwkDV/art-works-1.jpg",
      price: 280,
      originalPrice: 400,
      discountPercent: 30,
      artistName: "Zainul Abedin",
    },
    {
      _id: "deal-2",
      title: "The Digital Courtyard",
      category: "Digital Art",
      image: "https://i.ibb.co.com/fYfGYCKp/art-works-13.jpg",
      price: 195,
      originalPrice: 325,
      discountPercent: 40,
      artistName: "Mustafa Monwar",
    },
    {
      _id: "deal-3",
      title: "Serenity in Clay",
      category: "Sculpture",
      image: "https://i.ibb.co.com/xKfB0070/art-works-16.jpg",
      price: 340,
      originalPrice: 450,
      discountPercent: 25,
      artistName: "Novera Ahmed",
    },
    {
      _id: "deal-4",
      title: "Mystic Horizon",
      category: "Photography",
      image: "https://i.ibb.co.com/dsY382MJ/art-works-6.jpg",
      price: 150,
      originalPrice: 200,
      discountPercent: 25,
      artistName: "Shahidul Alam",
    },
  ];

  return (
    <section
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent text-slate-800 dark:text-slate-100"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[var(--brand)]/10 text-[var(--brand)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>Collector Specials & Promotions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Limited-Time <span className="text-[var(--brand)]">Art Deals</span> & Offers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Elevate your home and studio with authenticated masterpieces at exclusive seasonal discounts.
            </p>
          </div>

          <Link
            href="/browse"
            className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>Explore All Pieces</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 2 Promo Banners (Exactly matching the reference image layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Exclusive Offer For You! (15% OFF) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/30 dark:from-[#1e232e] dark:via-[#1c2227] dark:to-[#171c20] border border-indigo-100/80 dark:border-white/10 p-6 sm:p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            {/* Left Content */}
            <div className="space-y-3 max-w-[65%] z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Exclusive Offer For You!
              </span>

              <div className="space-y-0.5">
                <h3 className="text-3xl sm:text-4xl font-black text-indigo-950 dark:text-white tracking-tight">
                  Get 15% OFF
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  On your first original artwork order
                </p>
              </div>

              {/* Coupon Code Pill (Interactive) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode("FIRST15")}
                  className="inline-flex items-center gap-3 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 px-3.5 py-2 rounded-xl shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 dark:text-slate-400 font-semibold uppercase text-[10px]">
                      USE CODE:
                    </span>
                    <span className="font-extrabold text-indigo-900 dark:text-white font-mono tracking-wider">
                      FIRST15
                    </span>
                  </div>

                  <span className="p-1 rounded-md bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </span>
                </button>
              </div>
            </div>

            {/* 3D Gift Box Visual Graphic */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-2xl" />
              <svg
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-xl relative z-10 animate-subtle-float"
              >
                {/* Floating Confetti particles */}
                <circle cx="20" cy="30" r="3" fill="#df6742" opacity="0.8" />
                <rect x="95" y="25" width="5" height="5" rx="1" fill="#818cf8" transform="rotate(25 95 25)" />
                <circle cx="100" cy="65" r="2.5" fill="#f59e0b" />
                <rect x="25" y="80" width="4" height="4" rx="1" fill="#ec4899" transform="rotate(45 25 80)" />

                {/* Gift Box Base */}
                <rect x="25" y="50" width="70" height="50" rx="8" fill="url(#giftGrad)" />
                {/* Gift Lid */}
                <rect x="20" y="42" width="80" height="15" rx="4" fill="url(#lidGrad)" />
                {/* Vertical Ribbon */}
                <rect x="54" y="42" width="12" height="58" fill="#fbbf24" />
                {/* Horizontal Ribbon */}
                <rect x="25" y="68" width="70" height="12" fill="#fbbf24" />

                {/* Ribbon Bow Loops */}
                <ellipse cx="46" cy="34" rx="14" ry="9" transform="rotate(-30 46 34)" fill="#f59e0b" />
                <ellipse cx="74" cy="34" rx="14" ry="9" transform="rotate(30 74 34)" fill="#f59e0b" />
                <circle cx="60" cy="40" r="6" fill="#d97706" />

                <defs>
                  <linearGradient id="giftGrad" x1="25" y1="50" x2="95" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="lidGrad" x1="20" y1="42" x2="100" y2="57" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#c4b5fd" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Banner 2: Deal Of The Day (Live Countdown Timer) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/90 via-orange-50/40 to-amber-50/30 dark:from-[#2a1d1d] dark:via-[#1c2227] dark:to-[#171c20] border border-rose-100/80 dark:border-white/10 p-6 sm:p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            {/* Left Content */}
            <div className="space-y-3 max-w-[65%] z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand)] block">
                Deal Of The Day
              </span>

              <div className="space-y-0.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Flash Art Promotion
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Hurry up! Limited studio availability.
                </p>
              </div>

              {/* Countdown Timer (HRS : MINS : SECS) */}
              <div className="flex items-center gap-2 pt-1">
                {/* Hours Box */}
                <div className="flex flex-col items-center bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 px-3 py-1.5 rounded-xl shadow-2xs min-w-12">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                    {padZero(timeLeft.hours)}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">HRS</span>
                </div>

                <span className="font-bold text-slate-400 text-sm">:</span>

                {/* Minutes Box */}
                <div className="flex flex-col items-center bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 px-3 py-1.5 rounded-xl shadow-2xs min-w-12">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                    {padZero(timeLeft.minutes)}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">MINS</span>
                </div>

                <span className="font-bold text-slate-400 text-sm">:</span>

                {/* Seconds Box */}
                <div className="flex flex-col items-center bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 px-3 py-1.5 rounded-xl shadow-2xs min-w-12">
                  <span className="text-sm sm:text-base font-black text-[var(--brand)] font-mono">
                    {padZero(timeLeft.seconds)}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">SECS</span>
                </div>
              </div>

              {/* Action Button: Shop Now */}
              <div className="pt-2">
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 3D Alarm Clock Visual Graphic */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-2xl" />
              <svg
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-xl relative z-10 animate-subtle-float"
              >
                {/* Alarm bells */}
                <circle cx="36" cy="32" r="14" fill="#fb7185" />
                <circle cx="84" cy="32" r="14" fill="#fb7185" />
                <rect x="52" y="16" width="16" height="8" rx="3" fill="#e11d48" />

                {/* Clock Feet */}
                <line x1="38" y1="92" x2="26" y2="108" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
                <line x1="82" y1="92" x2="94" y2="108" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />

                {/* Clock Body */}
                <circle cx="60" cy="64" r="38" fill="url(#clockBodyGrad)" />
                {/* Inner Face */}
                <circle cx="60" cy="64" r="30" fill="#fff1f2" />

                {/* Clock Ticks */}
                <circle cx="60" cy="38" r="1.5" fill="#881337" />
                <circle cx="86" cy="64" r="1.5" fill="#881337" />
                <circle cx="60" cy="90" r="1.5" fill="#881337" />
                <circle cx="34" cy="64" r="1.5" fill="#881337" />

                {/* Clock Hands */}
                <line x1="60" y1="64" x2="60" y2="44" stroke="#881337" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="64" x2="74" y2="70" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="64" r="3" fill="#e11d48" />

                <defs>
                  <linearGradient id="clockBodyGrad" x1="22" y1="26" x2="98" y2="102" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f43f5e" />
                    <stop offset="1" stopColor="#be123c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Curated Discount Artworks Showcase (30%, 40%, 25% Off Offers) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-[var(--brand)]" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Featured Artworks on Special Offer
              </h3>
            </div>
            <span className="text-xs text-slate-400">Exclusive studio pricing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {offerArtworks.map((item) => (
              <div
                key={item._id}
                className="group relative bg-white dark:bg-[#1e262b] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 hover:border-[var(--brand)]/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container with Discount Badge */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-black/30">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Discount Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Sparkles size={10} />
                      {item.discountPercent}% OFF
                    </span>
                    <span className="bg-black/60 backdrop-blur-xs text-white/90 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Quick hover link */}
                  <Link
                    href="/browse"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                  >
                    <Eye size={14} /> View Masterpiece
                  </Link>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col justify-between grow space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-[var(--brand)] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">by {item.artistName}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-[var(--brand)]">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        Save ${(item.originalPrice - item.price).toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href="/browse"
                      className="px-3 py-1.5 rounded-lg bg-[var(--brand)]/10 hover:bg-[var(--brand)] text-[var(--brand)] hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Claim</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
