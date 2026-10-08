/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import ReviewSection from "./ReviewSection";
import Artcard from "./Artcard";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Maximize2,
  X,
  Palette,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

interface ArtworkDetailsClientProps {
  artwork: any;
  relatedArtworks?: any[];
}

export default function ArtworkDetailsClient({
  artwork,
  relatedArtworks = [],
}: ArtworkDetailsClientProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCart();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "shipping">("description");

  const artId = artwork?._id?.toString() || artwork?.id;

  const artistId =
    artwork?.resolvedArtistId ||
    artwork?.artistId ||
    artwork?.userId ||
    artwork?.artist?._id;

  const artistRealName =
    artwork?.artistName || artwork?.artist?.name || "Independent Artist";

  const isAdmin = user?.role === "admin";
  const userEmail = user?.email?.toLowerCase().trim();
  const artistEmail = (
    artwork?.artistEmail ||
    artwork?.userEmail ||
    artwork?.artist?.email ||
    ""
  )
    .toLowerCase()
    .trim();

  const isOwner = Boolean(
    userEmail &&
      artistEmail &&
      (userEmail === artistEmail || (artistId && user?.id?.toString() === artistId.toString()))
  );
  const isArtist = user?.role === "artist" || isOwner;

  const isSold = Boolean(
    artwork?.isSold === true ||
      artwork?.status === "sold" ||
      artwork?.status === "out_of_stock" ||
      (typeof artwork?.quantity === "number" && artwork.quantity <= 0)
  );
  const stockQty = typeof artwork?.quantity === "number" ? artwork.quantity : (isSold ? 0 : 1);

  const inCart = isInCart(artId);
  const inWishlist = isInWishlist(artId);

  const hasPaid =
    Boolean(isSold) &&
    Boolean(
      (artwork?.buyerId &&
        (artwork.buyerId === user?.id || artwork.buyerId?.toString() === user?.id?.toString())) ||
        (artwork?.buyerEmail &&
          user?.email &&
          artwork.buyerEmail.toLowerCase() === user.email.toLowerCase())
    );

  const formatBDDateTime = (dateString?: string) => {
    if (!dateString) return "Recent Release";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Action Handler: Add to Cart
  const handleAddToCart = () => {
    if (isSold) {
      toast.error(
        "This artwork is sold out! Please explore other available artworks in our gallery."
      );
      return;
    }

    if (isAdmin) {
      toast.error(
        "You are logged in as an Admin. Admins cannot purchase artworks. Only regular users can purchase."
      );
      return;
    }

    if (user?.role === "artist" || isOwner) {
      toast.error(
        isOwner
          ? "Artists cannot purchase their own artwork."
          : "Artists cannot purchase artworks. Please switch to a collector account."
      );
      return;
    }

    addToCart(artwork);
  };

  // Action Handler: Buy Now / Instant Checkout
  const handleBuyNow = () => {
    if (isSold) {
      toast.error(
        "This artwork is sold out! Please explore other available artworks in our gallery."
      );
      return;
    }

    if (isAdmin) {
      toast.error(
        "You are logged in as an Admin. Admins cannot purchase artworks. Only regular users can purchase."
      );
      return;
    }

    if (user?.role === "artist" || isOwner) {
      toast.error(
        isOwner
          ? "Artists cannot purchase their own artwork."
          : "Artists cannot purchase artworks. Please switch to a collector account."
      );
      return;
    }

    if (!user) {
      toast.error("Please login to proceed with instant checkout.");
      router.push(`/login?redirect=/browse/${artId}`);
      return;
    }

    const titleParam = encodeURIComponent(artwork?.title || "Artwork");
    const priceParam = Number(artwork?.price || 0);
    router.push(`/checkout?id=${artId}&title=${titleParam}&price=${priceParam}`);
  };

  // Handle Share link copy
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Artwork link copied to clipboard!");
    }
  };

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-[#13191c] py-8 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb Navigation (Daraz / E-Commerce Standard) */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="shrink-0 text-slate-400" />
          <Link href="/browse" className="hover:text-[var(--brand)] transition-colors">
            Gallery
          </Link>
          <ChevronRight size={14} className="shrink-0 text-slate-400" />
          {artwork?.category && (
            <>
              <Link
                href={`/browse?category=${encodeURIComponent(artwork.category)}`}
                className="hover:text-[var(--brand)] transition-colors uppercase font-medium"
              >
                {artwork.category}
              </Link>
              <ChevronRight size={14} className="shrink-0 text-slate-400" />
            </>
          )}
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs">
            {artwork?.title || "Artwork Details"}
          </span>
        </nav>

        {/* Main Product Showcase (Daraz / Ghorer Bazar 2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white dark:bg-[#1c2429] p-4 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm">
          {/* Left Column: Visual Artwork Media (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Artwork Stage */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200/90 dark:border-white/10 shadow-inner group">
              {artwork?.image ? (
                <Image
                  src={artwork.image}
                  alt={artwork.title || "Artwork"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Palette size={48} className="stroke-[1.5]" />
                  <span className="text-xs mt-2">Artwork Preview Unavailable</span>
                </div>
              )}

              {/* Top Floating Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {/* Category Badge */}
                {artwork?.category && (
                  <span className="bg-[var(--brand)] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md">
                    {artwork.category}
                  </span>
                )}

                {/* Stock Status Pill */}
                {isSold ? (
                  <span className="bg-red-600/95 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 border border-red-400/30">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Sold Out
                  </span>
                ) : (
                  <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 border border-emerald-400/30">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Available In Studio
                  </span>
                )}
              </div>

              {/* Bottom Right Floating Zoom Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                title="Full Screen Preview"
                className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white transition-all shadow-lg cursor-pointer"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Quick Actions & Trust Pill Below Image */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(artwork)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    inWishlist
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-red-500"
                  }`}
                >
                  <Heart size={14} className={inWishlist ? "fill-red-500" : ""} />
                  <span>{inWishlist ? "Wishlisted" : "Add to Wishlist"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-[var(--brand)] transition-all cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>

              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Certified Authentic
              </span>
            </div>

            {/* Quick Specs Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Authenticity
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                  100% Original Artwork
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Documentation
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                  Physical COA Included
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: E-Commerce Product & Checkout Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6 lg:pl-4">
            {/* Title & Metadata */}
            <div className="space-y-2 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-[var(--brand)]">
                  Original Gallery Piece • ID: #{artId?.slice(-6).toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-400">
                  Listed on {formatBDDateTime(artwork?.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {artwork?.title || "Original Artwork"}
              </h1>
            </div>

            {/* Artist Showcase Box (Daraz / Verified Seller Snapshot) */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[#b34928] text-white font-black text-lg flex items-center justify-center uppercase shadow-sm shrink-0">
                  {(artistRealName || "A")[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-800 dark:text-white text-base">
                      {artistRealName}
                    </span>
                    <span
                      className="w-4 h-4 rounded-full bg-[#1d9bf0] text-white flex items-center justify-center text-[10px]"
                      title="Verified Creator"
                    >
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {artwork?.specialty || artwork?.category || "Fine Art"} Creator
                  </p>
                </div>
              </div>

              {artistId && (
                <Link
                  href={`/artists-profile/${artistId.toString()}`}
                  className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-[var(--brand)]/10 transition-colors"
                >
                  View Profile <ChevronRight size={14} />
                </Link>
              )}
            </div>

            {/* Pricing Box (Daraz / Ghorer Bazar Style Focal Card) */}
            <div className="p-5 bg-gradient-to-br from-amber-500/5 via-transparent to-[var(--brand)]/5 dark:bg-white/[0.03] rounded-2xl border border-amber-500/20 dark:border-white/10 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[var(--brand)]">
                  ${Number(artwork?.price || 0).toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-400 line-through">
                  ${(Number(artwork?.price || 0) * 1.25).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Studio Direct Price
                </span>
              </div>

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-2 pt-1">
                {isSold ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Sold Out • This masterpiece has already been collected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      In Stock • Ready for secure dispatch
                      {typeof stockQty === "number" && stockQty > 0 ? ` (${stockQty} copy)` : ""}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                <Sparkles size={12} className="text-amber-500" />
                Price includes verified authentication, museum-grade wrap, and secure tracking.
              </p>
            </div>

            {/* Standardized Action Buttons (Daraz E-Commerce Buttons for ALL users) */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[var(--brand)] to-[#b34928] hover:opacity-95 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-[var(--brand)]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag size={18} />
                  <span>Buy Now</span>
                </button>

                {/* 2. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-4 px-6 rounded-2xl border-2 font-extrabold text-sm uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 ${
                    inCart
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check size={18} className="text-emerald-500" />
                      <span>In Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Wishlist full-width secondary option for mobile/quick touch */}
              <button
                type="button"
                onClick={() => toggleWishlist(artwork)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  inWishlist
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-red-500"
                }`}
              >
                <Heart size={14} className={inWishlist ? "fill-red-500" : ""} />
                <span>{inWishlist ? "Saved in Your Collection" : "Save to Favorites"}</span>
              </button>
            </div>

            {/* Daraz / Ghorer Bazar Trust & Delivery Guarantee Box */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[var(--brand)]" />
                ArtHub Collector Protection & Service
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Insured Art Transit</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Reinforced wooden crating with door-to-door courier tracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Authentic Guarantee</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hand-signed by artist with physical Certificate of Authenticity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <RotateCcw size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">7-Day Inspection</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hassle-free return policy if condition differs from presentation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Encrypted Checkout</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      256-bit encrypted transactions backed by Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section (Description / Specifications / Shipping) */}
        <div className="bg-white dark:bg-[#1c2429] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "description"
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Artwork Story & Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "specifications"
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Technical Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "shipping"
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Packaging & Logistics
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "description" && (
            <div className="space-y-4 max-w-4xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                About &ldquo;{artwork?.title}&rdquo;
              </h3>
              <p className="whitespace-pre-line">
                {artwork?.description ||
                  "This distinctive piece represents the creator's vision and exploration of medium, form, and emotional depth. Produced with archival grade materials to ensure lasting vibrancy for generations of art collectors."}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <Info size={14} />
                <span>Curated for authenticity by the ArtHub International Fine Art Registry.</span>
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Category
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm mt-0.5 block">
                  {artwork?.category || "Fine Art"}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Medium & Technique
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm mt-0.5 block">
                  {artwork?.specialty || "Original Medium on Archival Surface"}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Edition
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm mt-0.5 block">
                  Original 1 of 1 Edition
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Artist Studio
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm mt-0.5 block">
                  {artistRealName}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Date of Creation
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm mt-0.5 block">
                  {formatBDDateTime(artwork?.createdAt)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Availability
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm mt-0.5 block">
                  {isSold ? "Archived / Sold Out" : "Available in Studio"}
                </span>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4 max-w-4xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Packaging & Delivery Protocols
              </h3>
              <p>
                Each artwork is packaged under strict museum preservation standards. The canvas/media is protected by acid-free glassine paper, heavy-gauge corner guards, dual moisture barrier wrap, and custom wooden crating.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Estimated delivery window: 3 to 7 business days worldwide.</li>
                <li>Real-time door-to-door courier tracking sent to your registered email.</li>
                <li>Comprehensive transit insurance included on all shipments.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white dark:bg-[#1c2429] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8">
          {isPending ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
              Verifying collector authentication status...
            </div>
          ) : (
            <ReviewSection
              artworkId={artwork?._id}
              currentUser={user}
              hasPaid={hasPaid}
              isAdmin={isAdmin}
              isArtist={isArtist}
              isArtworkOwner={isOwner}
              artworkOwnerEmail={artwork?.artistEmail || artwork?.userEmail}
            />
          )}
        </div>

        {/* Related Artworks Section (Daraz / Amazon "You May Also Like") */}
        {relatedArtworks.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  More in {artwork?.category || "This Category"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Discover more authentic creations from our verified artist community
                </p>
              </div>

              <Link
                href="/browse"
                className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1"
              >
                Browse All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedArtworks.map((item) => (
                <Artcard key={item._id} artwork={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {artwork?.image && (
              <Image
                src={artwork.image}
                alt={artwork.title || "Artwork Full Preview"}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}