"use client";


import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  ShieldCheck,
  ArrowLeft,
  Check,
  Sparkles,
  Crown,
  Palette,
  Loader2,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import NextLink from "next/link";
import toast from "react-hot-toast";

const PLAN_DATA = {
  basic: {
    id: "basic",
    name: "Basic Artist",
    monthlyPrice: 10,
    yearlyPrice: 8,
    artLimit: "Up to 20 Artworks",
    commission: "10% Platform Commission",
    icon: Palette,
    color: "from-blue-500/20 to-cyan-500/10 text-blue-500 border-blue-500/30",
    features: [
      "Upload up to 20 Original Artworks",
      "Reduced 10% platform commission fee",
      "Full HD (1080p) artwork display",
      "Direct collector inquiry messaging",
      "Standard search & category filtering",
      "Standard email support (within 48 hours)",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Artist",
    monthlyPrice: 20,
    yearlyPrice: 16,
    artLimit: "Up to 60 Artworks",
    commission: "5% Platform Commission",
    icon: Sparkles,
    badge: "MOST POPULAR",
    color: "from-[var(--brand)]/20 via-orange-500/10 to-transparent text-[var(--brand)] border-[var(--brand)]/40",
    features: [
      "Upload up to 60 Original Artworks",
      "Ultra-low 5% platform commission fee",
      "Official Verified Artist Badge (Blue Checkmark)",
      "2K Ultra Zoom & texture preview",
      "1 Artwork Featured on Homepage per month",
      "Priority search ranking & category spotlight",
      "Priority support within 12 hours",
    ],
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate Studio",
    monthlyPrice: 50,
    yearlyPrice: 40,
    artLimit: "Unlimited Artworks",
    commission: "0% Commission (Keep 100%)",
    icon: Crown,
    badge: "VIP UNLIMITED",
    color: "from-amber-500/20 via-yellow-500/10 to-transparent text-amber-500 border-amber-500/40",
    features: [
      "Unlimited Artwork Uploads (Never hit a limit)",
      "0% Platform Commission (Keep 100% of sales)",
      "Gold Master Verified Artist Badge",
      "4K Masterpiece resolution & 3D virtual view",
      "Homepage Hero Banner & Newsletter spotlight",
      "Instant express payouts to Bank / Stripe",
      "Dedicated 24/7 personal art curator",
    ],
  },
};

function PurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan")?.toLowerCase() || "basic";
  const intervalParam = searchParams.get("interval")?.toLowerCase() || "monthly";
  const isCanceled = searchParams.get("canceled") === "true";

  const { data: session, isPending: authLoading } = useSession();
  const user = session?.user;

  const [interval, setInterval] = useState(intervalParam === "yearly" ? "yearly" : "monthly");
  const [subInfo, setSubInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);
  const [userRoleOverride, setUserRoleOverride] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const effectiveRole = (userRoleOverride || user?.role || "").toLowerCase();
  const isArtistOrAdmin = effectiveRole === "artist" || effectiveRole === "admin";

  const handleUpgradeToArtist = async () => {
    if (!user?.email) {
      toast("Please log in or register to upgrade your profile.");
      router.push(`/login?redirect=/pricing/checkout?plan=${plan.id}&interval=${interval}`);
      return;
    }

    try {
      setIsUpgradingRole(true);
      const res = await fetch("/api/users/upgrade-to-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upgrade account.");
      }

      setUserRoleOverride("artist");
      toast.success("Account successfully upgraded to Artist! You may now complete checkout.");
      router.refresh();
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error(err.message || "Could not upgrade account to Artist.");
    } finally {
      setIsUpgradingRole(false);
    }
  };

  const plan = PLAN_DATA[planParam] || PLAN_DATA.basic;
  const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const totalBilled = interval === "yearly" ? price * 12 : price;

  const effectiveName = customerName !== "" ? customerName : (user?.name || "");
  const effectiveEmail = customerEmail !== "" ? customerEmail : (user?.email || "");

  useEffect(() => {
    if (isCanceled) {
      toast("Payment was canceled. You can try again whenever you are ready.");
    }
  }, [isCanceled]);

  useEffect(() => {
    const targetEmail = customerEmail.trim() || user?.email;
    if (!targetEmail) return;
    fetch(`/api/subscription?email=${encodeURIComponent(targetEmail)}`)
      .then((r) => r.json())
      .then((d) => d.success && setSubInfo(d))
      .catch(() => {});
  }, [user?.email, customerEmail]);

  const handleProceedToStripe = async () => {
    const finalEmail = effectiveEmail.trim();
    if (!finalEmail) {
      toast("Please enter your email or login to proceed with checkout.");
      router.push(`/login?redirect=/pricing/checkout?plan=${plan.id}&interval=${interval}`);
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fetch("/api/subscription/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.id,
          interval,
          email: finalEmail,
          name: effectiveName.trim(),
          phone: customerPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to initiate Stripe checkout.");
      }

      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("Stripe checkout session URL was not received.");
      }
    } catch (err) {
      console.error("Subscription checkout error:", err);
      toast.error(err.message || "An error occurred initiating Stripe payment.");
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
        <p className="text-xs text-foreground/60">Loading secure purchase details...</p>
      </div>
    );
  }

  const PlanIcon = plan.icon;

  return (
    <div
      className="w-[96%] sm:w-[94%] lg:w-[90%] 2xl:w-[85%] mx-auto py-8 sm:py-12 px-2 sm:px-4 lg:px-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Return to Pricing Link */}
      <div className="mb-6">
        <NextLink
          href="/pricing"
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Plans</span>
        </NextLink>
      </div>

      {/* Main Grid: Order Details & Payment Confirmation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Benefits & Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">
              Subscription Purchase
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Upgrade to {plan.name}
            </h1>
            <p className="text-xs sm:text-sm text-foreground/65 leading-relaxed">
              Unlock higher artwork upload limits, reduced commission fees, and artist privileges immediately upon payment completion.
            </p>
          </div>

          {/* Plan Highlights Card */}
          <div className="p-6 rounded-2xl bg-surface border border-border-line space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${plan.color}`}>
                  <PlanIcon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-foreground/60">{plan.artLimit} · {plan.commission}</p>
                </div>
              </div>
              {plan.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[var(--brand)] text-white">
                  {plan.badge}
                </span>
              )}
            </div>

            {/* Billing Interval Toggle Inside Checkout */}
            <div className="pt-2 border-t border-border-line flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground/80">Billing Frequency</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInterval("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    interval === "monthly"
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--hover-bg)] text-foreground/70 hover:text-foreground"
                  }`}
                >
                  Monthly ($10/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setInterval("yearly")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    interval === "yearly"
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--hover-bg)] text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <span>Yearly (-20%)</span>
                </button>
              </div>
            </div>

            {/* Features list */}
            <div className="pt-3 border-t border-border-line space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                Included with your membership:
              </p>
              <ul className="space-y-2 text-xs">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/80">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Account Status Confirmation */}
          <div className="p-5 rounded-2xl bg-surface border border-border-line shadow-sm space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 flex items-center gap-1.5">
              <User size={13} className="text-[var(--brand)]" />
              <span>ArtHub Account Status</span>
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {user?.name || "Creator Profile"}
                </p>
                <p className="text-xs text-foreground/60">
                  {user?.email || "No active session detected"}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 justify-end ${
                    isArtistOrAdmin ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {isArtistOrAdmin ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{isArtistOrAdmin ? "Artist Account" : "Buyer Account"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Membership Guarantees */}
          <div className="p-5 rounded-2xl bg-surface border border-border-line shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[var(--brand)]" />
              <span>Instant Artist Activation</span>
            </h4>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Your tier upgrade and artwork upload allowance will activate automatically the moment payment is verified via Stripe.
            </p>
          </div>
        </div>

        {/* Right Column: Checkout Invoice & Stripe Button */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-surface border border-border-line shadow-lg space-y-5">
            <h2 className="text-base font-bold text-foreground border-b border-border-line pb-3">
              Order Summary
            </h2>

            {/* Pricing Line Items */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-foreground/70">
                <span>Plan</span>
                <span className="font-semibold text-foreground">{plan.name}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Billing Frequency</span>
                <span className="font-semibold capitalize text-foreground">{interval}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Artwork Upload Limit</span>
                <span className="font-bold text-[var(--brand)]">{plan.artLimit}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Marketplace Commission</span>
                <span className="font-bold text-emerald-500">{plan.commission}</span>
              </div>

              {subInfo && (
                <div className="flex justify-between text-foreground/70 pt-2 border-t border-border-line">
                  <span>Current Active Plan</span>
                  <span className="font-semibold capitalize text-foreground">{subInfo.plan} ({subInfo.artworkCount} artworks)</span>
                </div>
              )}

              {/* Total Due */}
              <div className="pt-3 border-t border-border-line flex justify-between items-baseline text-sm">
                <span className="font-bold text-foreground">Total Due Now</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[var(--brand)]">
                    ${totalBilled.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-foreground/50 block">USD (taxes included)</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Banner */}
            <div className="p-3 rounded-xl bg-[var(--hover-bg)] border border-border-line flex items-center gap-2.5 text-xs text-foreground/70">
              <Lock size={15} className="text-emerald-500 shrink-0" />
              <span>Direct 256-bit encrypted checkout via Stripe.</span>
            </div>

            {/* Buyer Account Role Guard Banner & Upgrade CTA */}
            {!isArtistOrAdmin && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-foreground">Artist Profile Required</p>
                    <p className="text-foreground/70 leading-relaxed text-[11px]">
                      You are signed in as a <strong className="text-foreground">Collector (Buyer)</strong>. Artist subscription packages are reserved for creators to publish artwork and reduce sales commissions.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpgradeToArtist}
                  disabled={isUpgradingRole}
                  className="w-full py-2.5 px-3 rounded-lg bg-[var(--brand)] hover:bg-[var(--brand-hover)] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUpgradingRole ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Upgrading to Artist...</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade Account to Artist Profile</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-foreground/60">
                  <NextLink
                    href={`/register?role=artist&redirect=/pricing/checkout?plan=${plan.id}&interval=${interval}`}
                    className="hover:text-foreground underline"
                  >
                    Register New Artist
                  </NextLink>
                  <NextLink href="/browse" className="hover:text-foreground underline">
                    Browse Art
                  </NextLink>
                </div>
              </div>
            )}

            {/* Checkout Action Button */}
            {isArtistOrAdmin ? (
              <button
                type="button"
                onClick={handleProceedToStripe}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-[var(--brand)]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Redirecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Pay with Stripe (${totalBilled.toFixed(2)})</span>
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-xl bg-surface border border-border-strong opacity-60 text-foreground/50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock size={15} />
                <span>Artist Account Required to Pay</span>
              </button>
            )}

            <p className="text-[10px] text-foreground/50 text-center leading-relaxed">
              By confirming, your subscription will activate instantly upon payment completion. You can cancel or switch tiers at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
          <p className="text-xs text-foreground/60">Loading purchase summary...</p>
        </div>
      }
    >
      <PurchaseContent />
    </Suspense>
  );
}
