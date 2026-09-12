"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  Crown,
  ShieldCheck,
  Palette,
  ArrowRight,
  Clock,
  Award,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";


const PRICING_TIERS = [
  {
    id: "basic",
    name: "Basic Artist",
    subtitle: "For emerging creators building their initial gallery presence",
    monthlyPrice: 10,
    yearlyPrice: 8,
    artLimit: "Up to 20 Artworks",
    commission: "10% Platform Fee",
    badge: null,
    highlight: false,
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    buttonClass: "bg-surface hover:bg-[var(--hover-bg)] text-foreground border border-border-strong",
    features: [
      { text: "Upload up to 20 Original Artworks", highlight: true },
      { text: "Reduced 10% platform commission fee (vs 15% Free)" },
      { text: "Full HD (1080p) high-fidelity display" },
      { text: "Basic visitor views & wishlist analytics" },
      { text: "Direct collector inquiry messaging" },
      { text: "Standard search & category filtering" },
      { text: "Standard email support (within 48 hours)" },
    ],
  },
  {
    id: "pro",
    name: "Pro Artist",
    subtitle: "For dedicated artists aiming for maximum collector reach & sales",
    monthlyPrice: 20,
    yearlyPrice: 16,
    artLimit: "Up to 60 Artworks",
    commission: "5% Platform Fee",
    badge: "MOST POPULAR",
    highlight: true,
    color: "from-[var(--brand)]/20 via-orange-500/10 to-transparent border-[var(--brand)] shadow-lg shadow-[var(--brand)]/10",
    buttonClass: "bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-md shadow-[var(--brand)]/30",
    features: [
      { text: "Upload up to 60 Original Artworks", highlight: true },
      { text: "Ultra-low 5% platform commission fee", highlight: true },
      { text: "Official Verified Artist Badge (Blue Checkmark)" },
      { text: "2K Ultra Zoom & texture preview" },
      { text: "Advanced sales revenue & customer insights" },
      { text: "1 Artwork Featured on Homepage per month" },
      { text: "Priority search ranking & category spotlight" },
      { text: "Priority support (under 12 hours turnaround)" },
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Studio",
    subtitle: "For master artists, prestigious studios & fine art galleries",
    monthlyPrice: 50,
    yearlyPrice: 40,
    artLimit: "Unlimited Artworks",
    commission: "0% Commission (Keep 100%)",
    badge: "VIP UNLIMITED",
    highlight: false,
    color: "from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/40 shadow-lg shadow-amber-500/10",
    buttonClass: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold shadow-md shadow-amber-500/20",
    features: [
      { text: "Unlimited Artwork Uploads (Never hit a limit)", highlight: true },
      { text: "0% Platform Commission (Keep 100% of sales!)", highlight: true },
      { text: "Gold Master Verified Artist Badge" },
      { text: "4K Masterpiece resolution & 3D virtual view" },
      { text: "Homepage Hero Banner & Newsletter spotlight" },
      { text: "Instant express payouts to Bank / Stripe" },
      { text: "Dedicated 24/7 personal art curator & phone line" },
      { text: "Custom artist vanity URL & domain sync" },
    ],
  },
];

export default function PricingSection({ isFullPage = false }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [currentSub, setCurrentSub] = useState(null);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [selectedTierForUpgrade, setSelectedTierForUpgrade] = useState(null);
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);

  // Fetch subscription info if user is authenticated
  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/subscription?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentSub(data);
        }
      })
      .catch((err) => console.error("Error fetching subscription info:", err));
  }, [user?.email]);

  const handleSelectPlan = (tier) => {
    if (!user) {
      toast("Please sign in or create an artist account to continue.");
      router.push(`/register?role=artist&redirect=/pricing/checkout?plan=${tier.id}&interval=${billingCycle}`);
      return;
    }

    // Role Guard: Check if the user is a buyer / collector
    const userRole = (user.role || "").toLowerCase();
    if (userRole !== "artist" && userRole !== "admin") {
      setSelectedTierForUpgrade(tier);
      setShowBuyerModal(true);
      return;
    }

    if (currentSub?.plan === tier.id) {
      toast("You are currently subscribed to this plan.");
      return;
    }

    router.push(`/pricing/checkout?plan=${tier.id}&interval=${billingCycle}`);
  };

  const handleUpgradeAccount = async () => {
    if (!user?.email) return;
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

      toast.success("Welcome, Creator! Your profile has been upgraded to Artist.");
      setShowBuyerModal(false);

      const targetPlan = selectedTierForUpgrade?.id || "basic";
      router.push(`/pricing/checkout?plan=${targetPlan}&interval=${billingCycle}`);
      router.refresh();
    } catch (err) {
      console.error("Account upgrade error:", err);
      toast.error(err.message || "Failed to upgrade account to Artist.");
    } finally {
      setIsUpgradingRole(false);
    }
  };

  return (
    <section
      id="pricing"
      className={`w-full bg-background text-foreground transition-colors relative overflow-hidden ${
        isFullPage ? "pt-8 pb-16 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)] flex flex-col justify-center" : "py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-border-line"
      }`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Background Decorative Ambient Blur (Contained to prevent overflow) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-64 bg-[var(--brand)]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto w-full space-y-8">
        {/* Compact Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand)]/10 border border-[var(--brand)]/25 text-[var(--brand)] text-[11px] font-bold tracking-wider uppercase">
            <Sparkles size={13} className="text-[var(--brand)]" />
            <span>Artist Memberships & Pricing</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-snug">
            Transparent Plans for <span className="text-[var(--brand)]">Visionary Artists</span>
          </h2>

          <p className="text-xs sm:text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
            Every creator starts with <span className="text-foreground font-semibold">5 free artworks</span>. Upgrade anytime to expand your collection, unlock 0% commissions, and access exclusive collector privileges.
          </p>

          {/* Free Tier Callout Ribbon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-line text-foreground/80 text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">
              <strong>Free Plan:</strong> Up to 5 artworks included with 0 subscription fees for all registered artists.
            </span>
          </div>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-foreground" : "text-foreground/50"}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-12 h-6 rounded-full bg-surface border border-border-strong p-0.5 transition-colors cursor-pointer"
              aria-label="Toggle billing interval"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[var(--brand)] shadow-sm transform transition-transform duration-200 ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-foreground" : "text-foreground/50"}`}>
              <span>Yearly Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards Grid (Responsive, compact, no viewport clipping) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 2xl:gap-8 items-stretch w-full mx-auto">
          {PRICING_TIERS.map((tier) => {
            const price = billingCycle === "yearly" ? tier.yearlyPrice : tier.monthlyPrice;
            const isCurrentPlan = currentSub?.plan === tier.id;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-surface border transition-all duration-300 p-5 sm:p-6 ${
                  tier.highlight
                    ? "border-[var(--brand)] ring-1 ring-[var(--brand)]/30 shadow-xl bg-gradient-to-b " + tier.color
                    : "border-border-line hover:border-border-strong shadow-md " + tier.color
                }`}
              >
                {/* Badge for Popular or VIP */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm ${
                        tier.id === "pro"
                          ? "bg-[var(--brand)] text-white"
                          : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Card Top Section */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                    {tier.id === "ultimate" ? (
                      <Crown size={18} className="text-amber-500" />
                    ) : tier.id === "pro" ? (
                      <Sparkles size={18} className="text-[var(--brand)]" />
                    ) : (
                      <Palette size={18} className="text-blue-500" />
                    )}
                  </div>

                  <p className="text-xs text-foreground/60 mt-1 min-h-[32px] leading-relaxed">
                    {tier.subtitle}
                  </p>

                  {/* Price Block */}
                  <div className="mt-4 pt-3 border-t border-border-line/70 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      ${price}
                    </span>
                    <span className="text-xs font-semibold text-foreground/55">
                      / month {billingCycle === "yearly" && "(billed annually)"}
                    </span>
                  </div>

                  {/* Highlight Specs Pill */}
                  <div className="mt-3 py-2 px-3 rounded-xl bg-[var(--hover-bg)] border border-border-line flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{tier.artLimit}</span>
                    <span className="text-emerald-500 font-semibold">{tier.commission}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-4 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                      Included Facilities:
                    </p>
                    <ul className="space-y-2 text-xs">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-snug">
                          <span
                            className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                              tier.id === "ultimate"
                                ? "bg-amber-500/20 text-amber-500"
                                : tier.id === "pro"
                                ? "bg-[var(--brand)]/20 text-[var(--brand)]"
                                : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className={feat.highlight ? "font-bold text-foreground" : "text-foreground/80"}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-6 pt-4 border-t border-border-line/70">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(tier)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrentPlan
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 cursor-default"
                        : tier.buttonClass
                    }`}
                  >
                    {isCurrentPlan ? (
                      <>
                        <ShieldCheck size={14} />
                        <span>Active Plan</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {user ? `Upgrade to ${tier.name}` : `Get Started for $${price}`}
                        </span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust & Guarantee Footnote */}
        <div className="pt-2 text-center text-xs text-foreground/55 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>SSL Encrypted Checkout</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--brand)]" />
            <span>Cancel or switch plans anytime</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={14} className="text-amber-500" />
            <span>Dedicated Creator Protection</span>
          </span>
        </div>
      </div>

      {/* Buyer Role Alert & Upgrade Modal */}
      {showBuyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-surface border border-border-line rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 text-foreground">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowBuyerModal(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-[var(--hover-bg)]"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand)]/15 border border-[var(--brand)]/30 flex items-center justify-center text-[var(--brand)] shrink-0">
                <Palette size={24} />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle size={11} />
                  <span>Artist Account Required</span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  Creator Membership Notice
                </h3>
              </div>
            </div>

            {/* Explanatory Description */}
            <div className="space-y-2.5 text-xs text-foreground/75 leading-relaxed bg-[var(--hover-bg)] p-3.5 rounded-xl border border-border-line">
              <p>
                You are currently signed in with a <strong className="text-foreground">Collector (Buyer)</strong> account.
              </p>
              <p>
                ArtHub subscription packages are specifically designed for <strong className="text-[var(--brand)]">Artists</strong> to upload artworks, expand gallery exhibition limits, and minimize marketplace sales commission.
              </p>
              <p className="text-emerald-500 font-medium">
                As an art collector, you can already explore and purchase original pieces with zero subscription fees!
              </p>
            </div>

            {/* Plan Selected Summary */}
            {selectedTierForUpgrade && (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface border border-border-strong text-xs">
                <div>
                  <span className="text-[10px] text-foreground/50 uppercase font-semibold block">Selected Plan</span>
                  <span className="font-bold text-foreground">{selectedTierForUpgrade.name}</span>
                </div>
                <span className="font-extrabold text-[var(--brand)]">
                  ${billingCycle === "yearly" ? selectedTierForUpgrade.yearlyPrice : selectedTierForUpgrade.monthlyPrice}/mo
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* Option 1: Instant 1-Click Upgrade to Artist */}
              <button
                type="button"
                onClick={handleUpgradeAccount}
                disabled={isUpgradingRole}
                className="w-full py-3 px-4 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[var(--brand)]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpgradingRole ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Upgrading Profile to Artist...</span>
                  </>
                ) : (
                  <>
                    <span>Upgrade Account to Artist &amp; Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {/* Option 2: Register New Artist Account */}
              <button
                type="button"
                onClick={() => {
                  setShowBuyerModal(false);
                  router.push(`/register?role=artist&redirect=/pricing/checkout?plan=${selectedTierForUpgrade?.id || "basic"}&interval=${billingCycle}`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-[var(--hover-bg)] text-foreground border border-border-strong text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register a Dedicated Artist Account</span>
              </button>

              {/* Option 3: Continue Browsing Art */}
              <button
                type="button"
                onClick={() => {
                  setShowBuyerModal(false);
                  router.push("/browse");
                }}
                className="w-full py-2 px-4 rounded-xl text-foreground/60 hover:text-foreground text-xs font-medium transition-colors"
              >
                Continue Browsing Artworks as Collector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

