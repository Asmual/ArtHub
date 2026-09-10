/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, Check, ArrowRight, Eye } from "lucide-react";

export default function Artcard({ artwork }) {
  const router = useRouter();
  const { addToCart, isInCart, toggleWishlist, isInWishlist, setIsCartOpen } = useCart();

  if (!artwork) return null;

  const artId = artwork._id?.toString() || artwork.id;
  const isSold = typeof artwork.quantity === "number" ? artwork.quantity <= 0 : false;
  const inCart = isInCart(artId);
  const inWishlist = isInWishlist(artId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(artwork);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSold) return;

    // Add to cart and trigger instant cart checkout drawer
    addToCart(artwork);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(artwork);
  };

  return (
    <div
      className="group relative bg-white dark:bg-[#1e262b] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-[var(--brand)]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Artwork Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-black/20">
        <NextLink href={`/browse/${artId}`} className="block w-full h-full">
          <img
            src={artwork.image || artwork.imageUrl || "/placeholder-art.jpg"}
            alt={artwork.title || "Artwork"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </NextLink>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          {/* Status Badge */}
          {isSold ? (
            <span className="bg-red-600/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border border-red-500/30">
              Sold Out
            </span>
          ) : (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border border-emerald-500/30">
              Available
            </span>
          )}

          {/* Category Tag */}
          {artwork.category && (
            <span className="bg-black/60 backdrop-blur-md text-white/90 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10">
              {artwork.category}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top Right) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer shadow-md ${
            inWishlist
              ? "bg-white dark:bg-[#1e262b] border-red-500/40 text-red-500 scale-105"
              : "bg-white/80 dark:bg-black/40 border-white/20 text-slate-600 dark:text-white/70 hover:text-red-500 hover:scale-110"
          }`}
        >
          <Heart
            size={16}
            className={`transition-colors ${inWishlist ? "fill-red-500" : ""}`}
          />
        </button>

        {/* Quick View Hover Strip */}
        <NextLink
          href={`/browse/${artId}`}
          className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold"
        >
          <Eye size={13} /> View Artwork
        </NextLink>
      </div>

      {/* Card Information Body */}
      <div className="p-4 flex flex-col grow justify-between space-y-3">
        <div>
          {/* Title */}
          <NextLink
            href={`/browse/${artId}`}
            className="block text-sm sm:text-base font-bold text-slate-800 dark:text-neutral-100 hover:text-[var(--brand)] transition-colors truncate"
            title={artwork.title}
          >
            {artwork.title}
          </NextLink>

          {/* Artist Name */}
          <p className="text-xs text-slate-500 dark:text-white/40 truncate mt-0.5">
            By <span className="font-semibold text-slate-700 dark:text-white/70">{artwork.artistName || artwork.artist?.name || "Independent Artist"}</span>
          </p>
        </div>

        {/* Pricing & Interactive Action Area */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2.5">
          {/* Price & Details Link */}
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                Price
              </span>
              <span className="text-lg font-black text-[var(--brand)]">
                ${Number(artwork.price || 0).toFixed(2)}
              </span>
            </div>

            <NextLink
              href={`/browse/${artId}`}
              className="text-xs font-bold text-slate-500 dark:text-white/60 hover:text-[var(--brand)] transition-colors flex items-center gap-1 group/btn"
            >
              Details
              <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </NextLink>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          {isSold ? (
            <button
              disabled
              className="w-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30 text-xs font-bold py-2.5 rounded-xl cursor-not-allowed uppercase tracking-wider text-center"
            >
              Sold Out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  inCart
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white"
                }`}
              >
                {inCart ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={13} />
                    <span>Add Cart</span>
                  </>
                )}
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold py-2 px-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Buy Now</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}