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
      className="min-h-screen bg-[#f8fafc] dark:bg-[#13191c] py-3 sm:py-5 px-3 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Sleek Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="shrink-0 text-slate-400" />
          <Link href="/browse" className="hover:text-[var(--brand)] transition-colors">
            Gallery
          </Link>
          <ChevronRight size={12} className="shrink-0 text-slate-400" />
          {artwork?.category && (
            <>
              <Link
                href={`/browse?category=${encodeURIComponent(artwork.category)}`}
                className="hover:text-[var(--brand)] transition-colors uppercase font-medium"
              >
                {artwork.category}
              </Link>
              <ChevronRight size={12} className="shrink-0 text-slate-400" />
            </>
          )}
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-xs">
            {artwork?.title || "Artwork Details"}
          </span>
        </nav>

        {/* Primary Showcase Card (Fits completely on one screen below navbar) */}
        <div className="bg-white dark:bg-[#1c2429] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
            {/* Left Column: Artwork Image Container (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="relative h-[260px] sm:h-[320px] lg:h-[360px] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black/30 border border-slate-200/90 dark:border-white/10 group">
                {artwork?.image ? (
                  <Image
                    src={artwork.image}
                    alt={artwork.title || "Artwork"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain sm:object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Palette size={40} className="stroke-[1.5]" />
                    <span className="text-xs mt-1">Artwork Preview Unavailable</span>
                  </div>
                )}

                {/* Top Floating Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                  {artwork?.category && (
                    <span className="bg-[var(--brand)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                      {artwork.category}
                    </span>
                  )}
                  {isSold ? (
                    <span className="bg-red-600/95 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-red-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Sold Out
                    </span>
                  ) : (
                    <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Available
                    </span>
                  )}
                </div>

                {/* Bottom Right Zoom Button */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Expand artwork preview"
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 backdrop-blur-md text-white transition-all shadow-md cursor-pointer"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              {/* Compact Image Footer Strip */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck size={13} /> 100% Certified Authentic Original
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 hover:text-[var(--brand)] transition-colors cursor-pointer"
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>

            {/* Right Column: Title, Artist, Price, Buttons & Trust (7 cols) */}
            <div className="lg:col-span-7 space-y-3 lg:space-y-3.5">
              {/* Header: Category / ID + Title */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-bold uppercase tracking-wider text-[var(--brand)]">
                    Original Studio Masterpiece
                  </span>
                  <span>Published {formatBDDateTime(artwork?.createdAt)}</span>
                </div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-2">
                  {artwork?.title || "Original Artwork"}
                </h1>
              </div>

              {/* Artist Row */}
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[#b34928] text-white font-black text-xs flex items-center justify-center uppercase shadow-xs shrink-0">
                    {(artistRealName || "A")[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-white text-xs">
                        {artistRealName}
                      </span>
                      <span
                        className="w-3.5 h-3.5 rounded-full bg-[#1d9bf0] text-white flex items-center justify-center text-[8px]"
                        title="Verified Creator"
                      >
                        ✓
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {artwork?.specialty || artwork?.category || "Fine Art"} Creator
                    </p>
                  </div>
                </div>

                {artistId && (
                  <Link
                    href={`/artists-profile/${artistId.toString()}`}
                    className="text-[11px] font-bold text-[var(--brand)] hover:underline flex items-center gap-0.5"
                  >
                    Profile <ChevronRight size={12} />
                  </Link>
                )}
              </div>

              {/* Price & Stock Strip */}
              <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--brand)]">
                    ${Number(artwork?.price || 0).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    ${(Number(artwork?.price || 0) * 1.25).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Studio Price
                  </span>
                </div>

                <div>
                  {isSold ? (
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                      Sold Out
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock {typeof stockQty === "number" && stockQty > 0 ? `(${stockQty})` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Action Buttons: Buy Now, Add to Cart, Wishlist */}
              <div className="flex items-center gap-2 pt-0.5">
                {/* 1. Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[#b34928] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[var(--brand)]/15 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} />
                  <span>Buy Now</span>
                </button>

                {/* 2. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl border font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                    inCart
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check size={15} className="text-emerald-500" />
                      <span>In Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} />
                      <span>Add Cart</span>
                    </>
                  )}
                </button>

                {/* 3. Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(artwork)}
                  title={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    inWishlist
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:text-red-500"
                  }`}
                >
                  <Heart size={16} className={inWishlist ? "fill-red-500" : ""} />
                </button>
              </div>

              {/* Compact Trust Chips (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Truck size={14} className="text-emerald-500 shrink-0" />
                  <span className="truncate">Insured Transit (3-7 Days)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                  <span className="truncate">Hand-Signed with COA</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-purple-500 shrink-0" />
                  <span className="truncate">Encrypted Stripe Checkout</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <RotateCcw size={14} className="text-amber-500 shrink-0" />
                  <span className="truncate">7-Day Inspection Return</span>
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