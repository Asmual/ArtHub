"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CheckCircle2, Loader2, ArrowRight, Palette, LayoutDashboard, Sparkles } from "lucide-react";
import NextLink from "next/link";
import toast from "react-hot-toast";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { data: session, isPending: authLoading } = useSession();

  const [verifying, setVerifying] = useState(true);
  const [subData, setSubData] = useState(null);
  const verifyCalled = useRef(false);

  useEffect(() => {
    if (authLoading || !sessionId || verifyCalled.current) return;

    const verifyStripePayment = async () => {
      try {
        verifyCalled.current = true;
        const res = await fetch("/api/subscription/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to verify subscription payment.");
        }

        setSubData(data);
        toast.success("Subscription activated successfully.");
      } catch (err) {
        console.error("Verification error:", err);
        toast.error(err.message || "Unable to confirm payment status.");
      } finally {
        setVerifying(false);
      }
    };

    verifyStripePayment();
  }, [sessionId, authLoading]);

  if (authLoading || verifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--brand)]" />
        <h2 className="text-base font-bold text-foreground">Verifying Payment...</h2>
        <p className="text-xs text-foreground/60">Confirming your subscription with the secure payment ledger...</p>
      </div>
    );
  }

  const planName = subData?.plan ? subData.plan.toUpperCase() : "PREMIUM";
  const artLimit = subData?.subscription?.artLimit || "Upgraded";

  return (
    <div
      className="max-w-xl mx-auto py-12 px-4 sm:px-6 w-full flex items-center justify-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-full bg-surface border border-border-line rounded-2xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={42} strokeWidth={2.2} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Subscription Activated
          </h1>
          <p className="text-xs sm:text-sm text-foreground/65 max-w-md mx-auto leading-relaxed">
            Your payment was processed successfully. Your artist account now has active <strong className="text-foreground">{planName}</strong> benefits.
          </p>
        </div>

        {/* Subscription Info Card */}
        <div className="p-4 rounded-xl bg-[var(--hover-bg)] border border-border-line text-left space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-foreground/70">Activated Tier:</span>
            <span className="font-bold text-[var(--brand)] uppercase">{subData?.plan || "PRO"} Plan</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/70">Artwork Quota:</span>
            <span className="font-bold text-foreground">{artLimit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/70">Payment Status:</span>
            <span className="font-semibold text-emerald-500">Active / Paid</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/70">Transaction ID:</span>
            <span className="font-mono text-[10px] text-foreground/60 truncate max-w-[200px]">{sessionId}</span>
          </div>
        </div>

        {/* Next Action Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <NextLink
            href="/dashboard/artist/add-art"
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Palette size={15} />
            <span>Upload New Artwork</span>
          </NextLink>

          <NextLink
            href="/dashboard/artist"
            className="flex-1 py-3 px-4 rounded-xl bg-surface border border-border-strong hover:bg-[var(--hover-bg)] text-foreground text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={15} />
            <span>Go to Dashboard</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
          <p className="text-xs text-foreground/60">Loading verification details...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
