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
  Star,
  CheckCircle2,
  ShieldCheck,
  Maximize2,
  X,
  Palette,
  Check,
  ArrowRight,
  Info,
  CreditCard,
  Plus,
  Minus,
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

  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

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

  // Thumbnail views (matching the multi-angle gallery in the reference image)
  const thumbnailViews = [
    { label: "Full View", image: artwork?.image, fit: "object-contain sm:object-cover" },
    { label: "Close-up", image: artwork?.image, fit: "object-cover scale-125" },
    { label: "Perspective", image: artwork?.image, fit: "object-cover" },
  ];

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

    addToCart({ ...artwork, quantity: orderQuantity });
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
    const singlePrice = Number(artwork?.price || 0);
    const totalPrice = (singlePrice * orderQuantity).toFixed(2);
    router.push(`/checkout?id=${artId}&title=${titleParam}&price=${totalPrice}&quantity=${orderQuantity}`);
  };

  const scrollToReviews = () => {
    const reviewsEl = document.getElementById("reviews-section");
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const basePrice = Number(artwork?.price || 0);
  const originalValuation = (basePrice * 1.35).toFixed(2);

  return (
    <main
      className="min-h-screen bg-[#fcfcfc] dark:bg-[#13191c] py-5 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Constrained, proportional container width (Not overly wide) */}
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb Navigation (Matching the reference layout) */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">
            Home
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <Link href="/browse" className="hover:text-[var(--brand)] transition-colors">
            Gallery
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          {artwork?.category && (
            <>
              <Link
                href={`/browse?category=${encodeURIComponent(artwork.category)}`}
                className="hover:text-[var(--brand)] transition-colors capitalize"
              >
                {artwork.category}
              </Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
            </>
          )}
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">
            {artwork?.title || "Artwork Details"}
          </span>
        </nav>

        {/* Top Product Showcase (Two-Column Layout matching reference image) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Vertical Thumbnails + Main Image Showcase (6 cols) */}
          <div className="md:col-span-6 lg:col-span-6 flex gap-3.5">
            {/* Vertical Thumbnail Strip (As in image reference) */}
            <div className="flex flex-col gap-3 w-16 sm:w-20 shrink-0">
              {thumbnailViews.map((thumb, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveThumbnailIndex(idx)}
                  className={`relative aspect-3/4 w-full rounded-md overflow-hidden bg-slate-100 dark:bg-black/30 border-2 transition-all cursor-pointer ${
                    activeThumbnailIndex === idx
                      ? "border-[var(--brand)] shadow-sm"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-400 opacity-75 hover:opacity-100"
                  }`}
                >
                  {thumb.image ? (
                    <img
                      src={thumb.image}
                      alt={thumb.label}
                      className={`w-full h-full object-cover ${
                        idx === 1 ? "scale-125 object-center" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                      View
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Primary Image Display */}
            <div className="relative flex-1 aspect-3/4 max-h-[500px] rounded-lg overflow-hidden bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 group">
              {artwork?.image ? (
                <Image
                  src={artwork.image}
                  alt={artwork.title || "Artwork Image"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`transition-all duration-300 ${
                    thumbnailViews[activeThumbnailIndex]?.fit || "object-contain"
                  }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Palette size={40} className="stroke-[1.5]" />
                  <span className="text-xs mt-2">No Artwork Image</span>
                </div>
              )}

              {/* Status Badge overlay */}
              {isSold && (
                <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                  Sold Out
                </span>
              )}

              {/* Expand to Lightbox button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                title="View Fullscreen"
                className="absolute bottom-3 right-3 p-2 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Pricing, Buttons & Payment Methods (6 cols) */}
          <div className="md:col-span-6 lg:col-span-6 space-y-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {artwork?.title || "Original Artwork"}
              </h1>

              {/* Rating & Review summary line (As in image reference) */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  4.8
                </span>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-xs text-slate-500 hover:text-[var(--brand)] underline cursor-pointer"
                >
                  (18 reviews)
                </button>
              </div>
            </div>

            {/* Price & Wishlist Row (As in image reference) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[var(--brand)] dark:text-[var(--brand)]">
                  ${basePrice.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-slate-400 line-through">
                  ${originalValuation}
                </span>
              </div>

              {/* Add to Wish List Button (As in image reference) */}
              <button
                type="button"
                onClick={() => toggleWishlist(artwork)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Heart
                  size={15}
                  className={inWishlist ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-slate-300"}
                />
                <span>{inWishlist ? "Wishlisted" : "Add to Wish List"}</span>
              </button>
            </div>

            {/* Artist & Category Info */}
            <div className="py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Creator:</span>
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  {artistRealName}
                  <span
                    className="w-3.5 h-3.5 rounded-full bg-[#1d9bf0] text-white flex items-center justify-center text-[8px]"
                    title="Verified Artist"
                  >
                    ✓
                  </span>
                </span>
              </div>

              {artwork?.category && (
                <span className="text-[11px] font-semibold text-[var(--brand)] bg-[var(--brand)]/10 px-2 py-0.5 rounded">
                  {artwork.category}
                </span>
              )}
            </div>

            {/* Quantity Selector (+ / - buttons) */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quantity</span>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-md overflow-hidden bg-white dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={orderQuantity <= 1 || isSold}
                    aria-label="Decrease quantity"
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Minus size={13} />
                  </button>

                  <span className="px-3 py-0.5 text-xs font-bold min-w-7 text-center text-slate-900 dark:text-white select-none">
                    {orderQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setOrderQuantity((prev) =>
                        Math.min(typeof stockQty === "number" && stockQty > 0 ? stockQty : 99, prev + 1)
                      )
                    }
                    disabled={
                      orderQuantity >= (typeof stockQty === "number" && stockQty > 0 ? stockQty : 99) ||
                      isSold
                    }
                    aria-label="Increase quantity"
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Total: ${(basePrice * orderQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-2.5 pt-1">
              {/* Primary Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] ${
                  inCart
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 text-white"
                }`}
              >
                {inCart ? (
                  <>
                    <Check size={16} />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Instant Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-sm active:scale-[0.99]"
              >
                <ShoppingBag size={16} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Express Shipping & Returns Notice (As in image reference) */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>
                Enjoy <span className="font-bold underline">FREE express</span> &{" "}
                <span className="font-bold underline">Free Returns</span> on verified art orders!
              </p>
              <p className="text-[11px] text-slate-400">
                Packed in custom protective wooden crating with Certificate of Authenticity.
              </p>
            </div>

            {/* Payment Method Badges (bKash, Nagad, Visa, Mastercard, AMEX) */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Payment method
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {/* VISA */}
                <div
                  className="h-7 px-2.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center shadow-2xs"
                  title="Visa"
                >
                  <span className="text-[#1a1f71] dark:text-[#5c7cfa] font-black italic text-xs tracking-wider">
                    VISA
                  </span>
                </div>

                {/* Mastercard */}
                <div
                  className="h-7 px-2.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center gap-0.5 shadow-2xs"
                  title="Mastercard"
                >
                  <span className="w-3 h-3 rounded-full bg-[#eb001b] -mr-1 inline-block opacity-90" />
                  <span className="w-3 h-3 rounded-full bg-[#f79e1b] inline-block opacity-90" />
                </div>

                {/* AMEX */}
                <div
                  className="h-7 px-2 rounded border border-slate-200 dark:border-white/10 bg-[#016fd0]/10 text-[#016fd0] dark:text-[#45aaf2] flex items-center justify-center shadow-2xs"
                  title="American Express"
                >
                  <span className="font-black text-[10px] tracking-tight">AMEX</span>
                </div>

                {/* bKash */}
                <div
                  className="h-7 px-2.5 rounded border border-[#e2136e]/20 bg-[#e2136e]/10 text-[#e2136e] flex items-center justify-center font-extrabold text-[11px] shadow-2xs"
                  title="bKash Payment"
                >
                  <span>bKash</span>
                </div>

                {/* Nagad */}
                <div
                  className="h-7 px-2.5 rounded border border-[#f7931e]/20 bg-[#f7931e]/10 text-[#d35400] flex items-center justify-center font-extrabold text-[11px] shadow-2xs"
                  title="Nagad Payment"
                >
                  <span>Nagad</span>
                </div>

                {/* Learn more link */}
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-[var(--brand)] underline cursor-pointer ml-1"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section (Linear, not in tabs, directly as requested) */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
          <div className="border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white inline-block border-b-2 border-[var(--brand)] pb-3 -mb-3.5">
              Product Details
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 pt-2">
            <p className="whitespace-pre-line">
              {artwork?.description ||
                `Step into a realm of creative depth with "${artwork?.title || "Original Artwork"}", crafted by verified artist ${artistRealName}. Produced with museum-grade archival materials to maintain lasting brilliance, depth, and texture for collectors.`}
            </p>

            <p>
              Each original piece from ArtHub is certified authentic and comes accompanied by a physical, hand-signed Certificate of Authenticity (COA) specifying origin, medium, and registration.
            </p>

            {/* Bullet points (As shown in reference image) */}
            <div className="pt-2">
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pl-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                  <span>
                    <strong>Category:</strong> {artwork?.category || "Fine Art"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                  <span>
                    <strong>Medium & Surface:</strong> {artwork?.specialty || "Original Medium on Archival Canvas"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                  <span>
                    <strong>Edition:</strong> Original 1 of 1 Edition
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                  <span>
                    <strong>Artist:</strong> {artistRealName} (Verified Creator)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                  <span>
                    <strong>Documentation:</strong> Signed Physical Certificate of Authenticity (COA) Included
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                  <span>
                    <strong>Delivery:</strong> 3–7 business days insured transit in reinforced wooden crating
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section (Directly underneath Product Details) */}
        <div id="reviews-section" className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
          <div className="border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white inline-block border-b-2 border-[var(--brand)] pb-3 -mb-3.5">
              Customer Reviews
            </h2>
          </div>

          <div className="pt-2">
            {isPending ? (
              <div className="text-sm text-slate-400 animate-pulse">
                Loading collector reviews...
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
        </div>

        {/* Related Artworks Section */}
        {relatedArtworks.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  More in {artwork?.category || "This Category"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore other original pieces from our verified creator community
                </p>
              </div>

              <Link
                href="/browse"
                className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1"
              >
                Browse All <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            className="relative max-w-4xl max-h-[85vh] w-full h-[80vh]"
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

      {/* Payment Methods Info Modal */}
      {isPaymentModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1c2429] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-[var(--brand)]" /> Accepted Payment Methods
              </h4>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                ArtHub supports global and local payment solutions with 256-bit bank-level SSL encryption backed by Stripe:
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white w-24">Credit & Debit:</span>
                  <span>VISA, Mastercard, American Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white w-24">Mobile Banking:</span>
                  <span>bKash, Nagad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white w-24">Buyer Guarantee:</span>
                  <span>Escrow-protected fund release upon artwork delivery</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="w-full py-2.5 rounded-lg bg-[var(--brand)] text-white font-bold text-xs hover:bg-[var(--brand-hover)] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}