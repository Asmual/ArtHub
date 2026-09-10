"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  ShieldCheck,
  Palette,
  ArrowRight,
  Clock,
  Award,
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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

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
      toast("Please log in to upgrade your artist plan.", { icon: "🔒" });
      router.push(`/login?redirect=/pricing`);
      return;
    }

    if (currentSub?.plan === tier.id) {
      toast.success(`You are already actively enjoying the ${tier.name} tier!`);
      return;
    }

    setSelectedPlan(tier);
    setIsModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !user?.email) return;

    try {
      setIsUpgrading(true);
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plan: selectedPlan.id,
          interval: billingCycle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process plan upgrade.");
      }

      toast.success(
        `🎉 Congratulations! You are now upgraded to ${selectedPlan.name} ($${
          billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice
        }/mo). Your upload limit is now ${selectedPlan.artLimit}!`,
        { duration: 5000 }
      );

      // Refresh local subscription state
      setCurrentSub((prev) => ({
        ...prev,
        plan: selectedPlan.id,
        artworkLimit: selectedPlan.id === "ultimate" ? "Unlimited" : selectedPlan.id === "pro" ? 60 : 20,
        canUploadMore: true,
      }));

      setIsModalOpen(false);
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error(err.message || "Something went wrong upgrading your plan.");
    } finally {
      setIsUpgrading(false);
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

      <div className="max-w-7xl mx-auto w-full space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch max-w-6xl mx-auto">
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

      {/* Interactive Plan Confirmation Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border-line rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
                  Confirm Plan Upgrade
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  Activate {selectedPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-[var(--hover-bg)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--hover-bg)] border border-border-line space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/70">Selected Plan:</span>
                <span className="font-bold text-foreground">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Billing Interval:</span>
                <span className="font-semibold capitalize text-foreground">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Artwork Capacity:</span>
                <span className="font-bold text-[var(--brand)]">{selectedPlan.artLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Platform Fee:</span>
                <span className="font-bold text-emerald-500">{selectedPlan.commission}</span>
              </div>
              <div className="border-t border-border-line pt-2 flex justify-between text-sm">
                <span className="font-bold text-foreground">Total Due Today:</span>
                <span className="font-extrabold text-foreground">
                  ${billingCycle === "yearly" ? selectedPlan.yearlyPrice * 12 : selectedPlan.monthlyPrice} USD
                </span>
              </div>
            </div>

            <p className="text-[11px] text-foreground/60 leading-relaxed">
              By upgrading, your artwork upload limit will immediately increase to {selectedPlan.artLimit}. You can add more artworks right away from your Artist Dashboard.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isUpgrading}
                className="flex-1 py-2.5 rounded-xl border border-border-line text-xs font-semibold text-foreground/70 hover:bg-[var(--hover-bg)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                disabled={isUpgrading}
                className="flex-1 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-bold transition-all shadow-md shadow-[var(--brand)]/30 flex items-center justify-center gap-2"
              >
                {isUpgrading ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <span>Confirm & Upgrade</span>
                    <Zap size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
