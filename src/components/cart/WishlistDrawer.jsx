/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Trash2, Heart, ShoppingBag, Palette } from "lucide-react";
import NextLink from "next/link";

export default function WishlistDrawer() {
  const {
    wishlistItems,
    toggleWishlist,
    addToCart,
    isInCart,
    isWishlistOpen,
    setIsWishlistOpen,
    setIsCartOpen,
  } = useCart();

  // Prevent background scrolling when drawer is active
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isWishlistOpen]);

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (item) => {
    addToCart(item);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-surface border-l border-border-line shadow-2xl flex flex-col h-full z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Heart size={18} className="fill-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Saved Wishlist</h2>
              <p className="text-xs text-foreground/50">
                {wishlistItems.length} {wishlistItems.length === 1 ? "favorite piece" : "favorite pieces"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--hover-bg)] flex items-center justify-center text-foreground/30">
                <Heart size={28} />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Your wishlist is empty</p>
                <p className="text-xs text-foreground/50 mt-1 max-w-xs">
                  Save pieces you love to keep track of your favorite masterpieces and collections.
                </p>
              </div>
              <NextLink
                href="/browse"
                onClick={() => setIsWishlistOpen(false)}
                className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Palette size={14} /> Explore Artworks
              </NextLink>
            </div>
          ) : (
            wishlistItems.map((item) => {
              const inCart = isInCart(item._id);

              return (
                <div
                  key={item._id}
                  className="bg-[var(--hover-bg)] border border-border-line rounded-2xl p-3 flex gap-3.5 group hover:border-[var(--brand)]/30 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/10 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/20">
                        <Palette size={20} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <NextLink
                          href={`/browse/${item._id}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="text-sm font-bold text-foreground hover:text-[var(--brand)] transition-colors truncate"
                        >
                          {item.title}
                        </NextLink>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item)}
                          className="text-foreground/30 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-foreground/50 truncate">
                        by {item.artistName || "Independent Artist"}
                      </p>
                      {item.category && (
                        <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-foreground/40 mt-0.5">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border-line/40">
                      <span className="text-sm font-black text-[var(--brand)]">
                        ${Number(item.price).toFixed(2)}
                      </span>

                      {!item.isSold ? (
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(item)}
                          className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <ShoppingBag size={12} />
                          {inCart ? "In Cart" : "Move to Cart"}
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-red-400">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
