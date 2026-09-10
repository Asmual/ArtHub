/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Trash2, ShoppingBag, ArrowRight, Palette, ShieldCheck } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { cartItems, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const router = useRouter();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutSingle = (item) => {
    setIsCartOpen(false);
    router.push(
      `/checkout?id=${item._id}&title=${encodeURIComponent(item.title)}&price=${item.price}`
    );
  };

  const handleCheckoutAll = () => {
    if (cartItems.length === 0) return;
    const firstItem = cartItems[0];
    setIsCartOpen(false);
    router.push(
      `/checkout?id=${firstItem._id}&title=${encodeURIComponent(firstItem.title)}&price=${firstItem.price}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-surface border-l border-border-line shadow-2xl flex flex-col h-full z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Shopping Cart</h2>
              <p className="text-xs text-foreground/50">
                {cartItems.length} {cartItems.length === 1 ? "masterpiece" : "masterpieces"} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-foreground/40 hover:text-red-400 font-medium px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-[var(--hover-bg)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--hover-bg)] flex items-center justify-center text-foreground/30">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Your cart is empty</p>
                <p className="text-xs text-foreground/50 mt-1 max-w-xs">
                  Discover authentic original artwork from world-class creators and add them to your collection.
                </p>
              </div>
              <NextLink
                href="/browse"
                onClick={() => setIsCartOpen(false)}
                className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Palette size={14} /> Browse Gallery
              </NextLink>
            </div>
          ) : (
            cartItems.map((item) => (
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
                        onClick={() => setIsCartOpen(false)}
                        className="text-sm font-bold text-foreground hover:text-[var(--brand)] transition-colors truncate"
                      >
                        {item.title}
                      </NextLink>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="text-foreground/30 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                        title="Remove item"
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
                    <button
                      type="button"
                      onClick={() => handleCheckoutSingle(item)}
                      className="text-[11px] font-bold text-foreground/80 hover:text-[var(--brand)] flex items-center gap-1 transition-colors"
                    >
                      Instant Buy <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout Actions */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-border-line bg-surface space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-foreground/60 font-medium">
                <span>Subtotal</span>
                <span className="font-mono font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-foreground/60 font-medium">
                <span>Authentication & Ledger</span>
                <span className="text-emerald-500 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border-line">
                <span>Total Amount</span>
                <span className="text-lg font-black text-[var(--brand)]">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckoutAll}
              className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-foreground/40">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Guaranteed Authentic & Encrypted Stripe Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
