"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CheckCircle, Loader2, ArrowRight, Palette, ShoppingBag, Home } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAuthToken } from "@/lib/auth-utils";

// Success content component wrapped in Suspense for Next.js searchParams compatibility
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { data: session, isPending: authLoading } = authClient.useSession();

  const [syncing, setSyncing] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const syncExecuted = useRef(false);

  // Synchronize and verify payment with server
  useEffect(() => {
    if (authLoading || !sessionId || !session?.user?.email || syncExecuted.current) return;

    const verifyTransaction = async () => {
      try {
        syncExecuted.current = true;
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        const backendToken = await getAuthToken(base, session.user.email);

        const res = await fetch(`${base}/api/payment/verify-payment-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to verify payment status.");
        }

        if (result.data) {
          setOrderDetails(result.data);
        }
        toast.success("Payment verified! Your artwork is secured.");
      } catch (err) {
        console.error("[PAYMENT ERROR] Sync error:", err);
        toast.error(err.message || "Could not verify payment status.");
      } finally {
        setSyncing(false);
      }
    };

    verifyTransaction();
  }, [sessionId, session, authLoading]);

  // Loading state
  if (authLoading || syncing) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-3 text-[var(--text-main)]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <h2 className="text-lg font-bold">Verifying Payment...</h2>
        <p className="text-xs text-[var(--text-muted)]">Confirming your transaction with the secure ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="w-full max-w-lg bg-[var(--surface)] p-8 sm:p-10 rounded-2xl border border-[var(--border-line)] shadow-2xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        {/* Title and Confirmation Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-emerald-500 tracking-tight">Payment Successful!</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Thank you for your purchase! Your payment has been confirmed and the artwork has been added to your collection.
          </p>
        </div>

        {/* Order Details Card */}
        {orderDetails && (
          <div className="p-5 bg-[var(--background)] rounded-xl border border-[var(--border-line)] text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-medium">Artwork</span>
              <span className="font-bold text-[var(--text-main)] truncate max-w-[200px]">
                {orderDetails.artworkTitle || orderDetails.artworkDetails?.title || "Original Artwork"}
              </span>
            </div>

            <div className="h-px bg-[var(--border-line)]" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-medium">Total Paid</span>
              <span className="text-base font-black text-emerald-500 font-mono">
                ${Number(orderDetails.price || orderDetails.amount || 0).toFixed(2)}
              </span>
            </div>

            <div className="h-px bg-[var(--border-line)]" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-medium">Transaction ID</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)] select-all truncate max-w-[200px]">
                {orderDetails.transactionId || sessionId}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/dashboard/user/bought-artworks"
            className="w-full bg-[#df6742] hover:bg-[#c55332] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#df6742]/10"
          >
            <Palette className="w-4 h-4" /> View in My Collection
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/user/purchase-history"
              className="bg-[var(--background)] hover:bg-[var(--hover-bg)] text-[var(--text-main)] border border-[var(--border-line)] font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Order History
            </Link>

            <Link
              href="/browse"
              className="bg-[var(--background)] hover:bg-[var(--hover-bg)] text-[var(--text-main)] border border-[var(--border-line)] font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" /> Browse More
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// Exported page component with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}