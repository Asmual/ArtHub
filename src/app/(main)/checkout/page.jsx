"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Palette,
  CheckCircle2,
  User,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const artworkId = searchParams.get("id");
  const artworkName = searchParams.get("title") || "Selected Artwork";
  const orderPrice = parseFloat(searchParams.get("price") || "0");

  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [isProcessing, setIsProcessing] = useState(false);

  // Validate parameters and redirect if invalid
  useEffect(() => {
    if (!authLoading && (!artworkId || orderPrice <= 0)) {
      toast.error("Invalid checkout parameters.");
      router.push("/browse");
    }
  }, [artworkId, orderPrice, authLoading, router]);

  // Handle Stripe checkout session creation
  const handleCheckout = async () => {
    const finalEmail = user?.email?.trim();
    if (!finalEmail) {
      toast.error("Please login to proceed with checkout.");
      router.push(`/login?redirect=/checkout?id=${artworkId}&title=${encodeURIComponent(artworkName)}&price=${orderPrice}`);
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        artworkId,
        price: orderPrice,
        name: user?.name?.trim() || "ArtHub Collector",
        email: finalEmail,
        phone: "",
      };

      let checkoutUrl = null;

      // 1. Attempt internal Next.js serverless route first (fastest, direct DB & Stripe)
      try {
        const localRes = await fetch("/api/payment/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const localData = await localRes.json();
        if (localRes.ok && localData?.url) {
          checkoutUrl = localData.url;
        }
      } catch (localErr) {
        console.warn("[CHECKOUT] Internal route notice, trying backend fallback:", localErr?.message);
      }

      // 2. Fallback to Express backend if internal route didn't return URL
      if (!checkoutUrl) {
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const backendToken = await getAuthToken(base, finalEmail).catch(() => "");

        const headers = { "Content-Type": "application/json" };
        if (backendToken) {
          headers.Authorization = `Bearer ${backendToken}`;
        }

        const fallbackRes = await fetch(`${base}/api/payment/create-checkout-session`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok || !fallbackData?.url) {
          throw new Error(fallbackData?.message || "Failed to initiate Stripe checkout session.");
        }
        checkoutUrl = fallbackData.url;
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Unable to establish Stripe payment gateway session.");
      }
    } catch (err) {
      console.error("[PAYMENT ERROR] Checkout failure:", err);
      toast.error(err.message || "An error occurred while connecting to Stripe.");
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-2 text-[var(--text-main)]">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        <p className="text-xs text-[var(--text-muted)]">Loading secure checkout...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-main)] py-8 sm:py-12 px-4 sm:px-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[96%] sm:w-[94%] lg:w-[90%] 2xl:w-[85%] mx-auto">
        {/* Top Back Navigation */}
        <div className="mb-6">
          <Link
            href={`/browse/${artworkId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Artwork Details
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">
            Direct Artist Purchase
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Order <span className="text-[#df6742]">Checkout</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Confirm your purchase details and proceed directly to Stripe for 100% secure checkout.
          </p>
        </div>

        {/* Main Grid: Artwork Showcase & Invoice */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Artwork Details & Assurances */}
          <div className="lg:col-span-7 space-y-6">
            {/* Artwork Card */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                  Selected Artwork
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready to Acquire
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#df6742] shrink-0">
                  <Palette size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] truncate">
                    {artworkName}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Original certified artwork from verified creator
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-[#df6742]">
                    ${orderPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block">USD</span>
                </div>
              </div>
            </div>

            {/* Buyer Account Confirmation */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <User size={13} className="text-[#df6742]" />
                <span>Buyer Account</span>
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">
                    {user?.name || "Collector"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {user?.email || "No email detected"}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Verified Member
                </span>
              </div>
            </div>

            {/* ArtHub Collector Guarantees */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#df6742]" />
                <span>ArtHub Collector Assurances</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 text-[var(--text-main)]">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>100% Guaranteed original physical artwork</span>
                </div>
                <div className="flex items-start gap-2 text-[var(--text-main)]">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Direct payment patronage to the artist</span>
                </div>
                <div className="flex items-start gap-2 text-[var(--text-main)]">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Insured, museum-standard packaging</span>
                </div>
                <div className="flex items-start gap-2 text-[var(--text-main)]">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Digital certificate of authenticity registered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Proceed Button */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-lg space-y-5">
              <h2 className="text-base font-bold text-[var(--text-main)] border-b border-[var(--border-line)] pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Item</span>
                  <span className="font-semibold text-[var(--text-main)] truncate max-w-[200px] text-right">
                    {artworkName}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Authenticity Guarantee</span>
                  <span className="font-semibold text-emerald-500">100% Verified Original</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Standard Packaging</span>
                  <span className="font-semibold text-emerald-500">Free / Included</span>
                </div>

                <div className="pt-3 border-t border-[var(--border-line)] flex justify-between items-baseline text-sm">
                  <span className="font-bold text-[var(--text-main)]">Total Due</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#df6742]">
                      ${orderPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block">USD</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-3 rounded-xl bg-[var(--hover-bg)] border border-[var(--border-line)] flex items-center gap-2.5 text-xs text-[var(--text-muted)]">
                <Lock size={15} className="text-emerald-500 shrink-0" />
                <span>256-bit encrypted checkout via Stripe.</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing || !artworkId}
                className="w-full py-3.5 px-4 rounded-xl bg-[#df6742] hover:bg-[#c55332] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#df6742]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Stripe Pay (${orderPrice.toFixed(2)})</span>
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
                By clicking proceed, you will be securely redirected to Stripe to finalize your payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}