"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

// Checkout content component wrapped in Suspense for Next.js searchParams compatibility
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const artworkId = searchParams.get("id");
  const artworkName = searchParams.get("title") || "Selected Artwork";
  const orderPrice = parseFloat(searchParams.get("price") || "0");

  const { data: session, isPending: authLoading } = authClient.useSession();
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
    if (!session?.user?.email) {
      toast.error("Please login to proceed with checkout.");
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
      const backendToken = await getAuthToken(base, session.user.email);

      const response = await fetch(`${base}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          artworkId: artworkId,
          price: orderPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate Stripe checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout session URL not received.");
      }
    } catch (err) {
      console.error("[PAYMENT ERROR] Checkout error:", err);
      toast.error(err.message || "An error occurred during checkout initialization.");
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] flex items-center justify-center p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border-line)] shadow-2xl text-center">
        
        {/* Header */}
        <h2 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-wide">
          Secure <span className="text-[#df6742]">Checkout</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          You will be redirected to Stripe to securely complete your payment.
        </p>

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-[var(--background)] rounded-xl border border-[var(--border-line)] text-left space-y-2">
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs text-[var(--text-muted)] uppercase font-bold shrink-0">Artwork:</span>
            <span className="text-sm font-medium text-[var(--text-main)] truncate text-right w-full">{artworkName}</span>
          </div>
          <div className="h-px bg-[var(--border-line)] w-full" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)] font-medium">Total Payable:</span>
            <span className="text-xl font-bold text-[#df6742]">${orderPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] justify-center mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted 256-bit Stripe checkout</span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing || !artworkId}
          className="w-full bg-[#df6742] hover:bg-[#c55332] disabled:bg-white/5 disabled:text-white/20 text-white font-bold py-4 rounded-xl text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#df6742]/10 mb-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            "Proceed to Stripe Pay"
          )}
        </button>

        {/* Return link */}
        <Link
          href={`/browse/${artworkId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Artwork Details
        </Link>

      </div>
    </div>
  );
}

// Exported page component with Suspense boundary
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