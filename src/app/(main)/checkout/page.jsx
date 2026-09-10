"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldCheck, ArrowLeft, Lock, Palette } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";
import DemoCardWidget from "@/components/checkout/DemoCardWidget";

// Checkout content component wrapped in Suspense for Next.js searchParams compatibility
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const artworkId = searchParams.get("id");
  const artworkName = searchParams.get("title") || "Selected Artwork";
  const orderPrice = parseFloat(searchParams.get("price") || "0");

  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const effectiveName = customerName !== "" ? customerName : (user?.name || "");
  const effectiveEmail = customerEmail !== "" ? customerEmail : (user?.email || "");

  // Validate parameters and redirect if invalid
  useEffect(() => {
    if (!authLoading && (!artworkId || orderPrice <= 0)) {
      toast.error("Invalid checkout parameters.");
      router.push("/browse");
    }
  }, [artworkId, orderPrice, authLoading, router]);

  // Handle Stripe checkout session creation
  const handleCheckout = async () => {
    const finalEmail = effectiveEmail.trim();
    if (!finalEmail) {
      toast.error("Please enter your email or login to proceed with checkout.");
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
      const backendToken = await getAuthToken(base, finalEmail);

      const response = await fetch(`${base}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          artworkId: artworkId,
          price: orderPrice,
          name: effectiveName.trim(),
          email: finalEmail,
          phone: customerPhone.trim(),
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
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-main)] py-8 sm:py-12 px-4 sm:px-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
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
            Secure <span className="text-[#df6742]">Checkout</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Complete your artwork acquisition securely via Stripe sandbox payment gateway.
          </p>
        </div>

        {/* Two-Column Grid: Left Details & Demo Card, Right Invoice */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Artwork Info & Demo Card */}
          <div className="lg:col-span-7 space-y-6">
            {/* Artwork Details Snippet */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#df6742] shrink-0">
                  <Palette size={24} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    Purchasing Original Piece
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-main)] line-clamp-1">
                    {artworkName}
                  </h3>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-[#df6742]">
                  ${orderPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">USD</span>
              </div>
            </div>

            {/* Interactive Demo Test Card & Customer Details */}
            <DemoCardWidget
              customerName={effectiveName}
              setCustomerName={setCustomerName}
              customerEmail={effectiveEmail}
              setCustomerEmail={setCustomerEmail}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
            />
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
                    <span>Redirecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Stripe Pay (${orderPrice.toFixed(2)})</span>
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
                By clicking proceed, you will be securely redirected to Stripe to input the demo card details.
              </p>
            </div>
          </div>
        </div>
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