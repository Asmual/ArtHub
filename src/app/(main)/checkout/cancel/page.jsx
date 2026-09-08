"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

// Cancel content component wrapped in Suspense for Next.js searchParams compatibility
function CancelContent() {
  const searchParams = useSearchParams();
  const artworkId = searchParams.get("artworkId") || searchParams.get("id");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-full max-w-md bg-[var(--surface)] p-8 sm:p-10 rounded-2xl border border-[var(--border-line)] shadow-2xl text-center space-y-6">
        
        {/* Cancel Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <XCircle className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        {/* Title and Explanation */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Checkout Cancelled</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Your payment session was cancelled. No charges were made to your account.
          </p>
        </div>

        {/* Information Notice */}
        <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border-line)] text-xs text-[var(--text-muted)] leading-relaxed text-left">
          <p>
            If you experienced an issue during checkout or changed your mind, you can try again anytime. The artwork remains available unless acquired by another collector.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {artworkId ? (
            <Link
              href={`/browse/${artworkId}`}
              className="w-full bg-[#df6742] hover:bg-[#c55332] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#df6742]/10"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Artwork
            </Link>
          ) : (
            <Link
              href="/browse"
              className="w-full bg-[#df6742] hover:bg-[#c55332] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#df6742]/10"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Artworks
            </Link>
          )}

          <Link
            href="/browse"
            className="w-full bg-[var(--background)] hover:bg-[var(--hover-bg)] text-[var(--text-main)] border border-[var(--border-line)] font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            Explore Marketplace
          </Link>
        </div>

      </div>
    </div>
  );
}

// Exported cancel page component with Suspense boundary
export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}