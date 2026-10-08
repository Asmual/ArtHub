/* eslint-disable @next/next/no-img-element */
import React from "react";
import NextLink from "next/link";
import {
  Palette,
  Target,
  Compass,
  Award,
  ShieldCheck,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  Globe,
  Clock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "About Us | ArtHub - Global Fine Art & Contemporary Marketplace",
  description:
    "Learn about ArtHub, our mission to empower independent creators, and how we connect visionary artists with discerning art collectors worldwide.",
};

// 5 Core Highlights & Platform Metrics (Displayed compactly in the hero viewport)
const HIGHLIGHT_STATS = [
  {
    icon: Palette,
    value: "10K+",
    label: "Original Artworks",
    sub: "Certified Handcrafted",
  },
  {
    icon: Users,
    value: "1,200+",
    label: "Verified Creators",
    sub: "Global Artists",
  },
  {
    icon: Clock,
    value: "24h",
    label: "Fast Dispatch",
    sub: "Express Delivery",
  },
  {
    icon: Globe,
    value: "40+",
    label: "Countries Reached",
    sub: "Worldwide Shipping",
  },
  {
    icon: Award,
    value: "99.8%",
    label: "Satisfaction Rate",
    sub: "Collector Approved",
  },
];

const CORE_VALUES = [
  {
    icon: Award,
    title: "Authenticity & Provenance",
    description:
      "Every artwork exhibited on ArtHub is handcrafted, rigorously verified, and certified directly by the creator.",
  },
  {
    icon: Heart,
    title: "Empowering Creators",
    description:
      "We champion fair remuneration, low marketplace overheads, and transparent sales ledgers so artists flourish.",
  },
  {
    icon: ShieldCheck,
    title: "Frictionless Security",
    description:
      "Stripe-powered global transactions, buyer protection, and end-to-end payment encryption guarantee peace of mind.",
  },
  {
    icon: TrendingUp,
    title: "Culture & Innovation",
    description:
      "Fusing traditional canvas, sculpture, and contemporary digital art forms into a singular, vibrant digital salon.",
  },
];

const MILESTONES = [
  {
    step: "01",
    title: "Curated Showcase",
    desc: "Artists catalog original portfolios with verified stock availability and real-time inventory management.",
  },
  {
    step: "02",
    title: "Effortless Discovery",
    desc: "Collectors browse by genre, price tier, or creator credentials with instant filtering and search.",
  },
  {
    step: "03",
    title: "Direct Acquisition",
    desc: "Seamless one-click purchases and personalized cart checkout with instant transaction receipts.",
  },
  {
    step: "04",
    title: "Lasting Inspiration",
    desc: "Masterpieces arrive safely in collector spaces, transforming rooms and fostering artistic dialogues.",
  },
];

export default function AboutUsPage() {
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#1e262b] text-slate-800 dark:text-white transition-colors"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* 1. UNIFIED COMPACT HERO + METRICS HIGHLIGHTS (FITS ENTIRELY IN THE TOP VIEWPORT) */}
      <section className="relative pt-6 pb-8 sm:pt-8 sm:pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#243239] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#df6742_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto relative z-10 space-y-6">
          {/* Header Title & Tagline Area */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/30 text-[#df6742] px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-xs">
              <Sparkles size={13} className="text-[#df6742]" />
              Discover ArtHub Marketplace
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Where Art Transcends Boundaries &amp; Inspires <span className="text-[#df6742]">Living Spaces</span>
            </h1>

            <p className="text-slate-600 dark:text-white/65 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              ArtHub connects visionary independent creators with collectors worldwide, dismantling traditional gallery gatekeeping with transparent pricing and verified authenticity.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <NextLink
                href="/browse"
                className="bg-[#df6742] hover:bg-[#ca5633] text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
              >
                Explore Collections <ArrowRight size={14} />
              </NextLink>
              <NextLink
                href="/all-artists"
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all"
              >
                Meet The Artists
              </NextLink>
            </div>
          </div>

          {/* 5-Column Compact Metrics & Highlights Bar */}
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {HIGHLIGHT_STATS.map(({ label, value, sub, icon: Icon }) => (
                <div
                  key={label}
                  className="bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-center shadow-xs hover:border-[#df6742]/50 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-between"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-[#df6742]/15 text-[#df6742] flex items-center justify-center mb-2 border border-[#df6742]/20">
                    <Icon size={16} />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {value}
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-white/80 mt-0.5">
                    {label}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-white/40">
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISSION & VISION DUAL PILLARS (COMPACT) */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-[#df6742]">Purpose &amp; Aspiration</h2>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Our Guiding Light</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mission Card */}
          <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#df6742]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] flex items-center justify-center mb-4 border border-[#df6742]/20">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Our Mission</h3>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
              To democratize access to exceptional fine art by bridging creators and collectors through a transparent, secure, and aesthetically rich digital platform with direct creator patronage.
            </p>
            <ul className="mt-4 space-y-2 text-xs font-medium text-slate-700 dark:text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Direct creator-to-collector sales
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Zero prohibitive listing fees for artists
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Authentic physical &amp; digital provenance
              </li>
            </ul>
          </div>

          {/* Vision Card */}
          <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-[#df6742]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] flex items-center justify-center mb-4 border border-[#df6742]/20">
              <Compass size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Our Vision</h3>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
              To become the world’s most trusted digital ecosystem where every home and personal sanctuary is enriched by unique art, and where artistic talent is rewarded on pure merit.
            </p>
            <ul className="mt-4 space-y-2 text-xs font-medium text-slate-700 dark:text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Global borderless marketplace reach
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> High-definition artwork inspection tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Supporting the next generation of visual artists
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. STORY SECTION (COMPACT) */}
      <section className="py-8 sm:py-12 bg-white dark:bg-[#243239] border-t border-b border-slate-200 dark:border-white/10">
        <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#df6742] uppercase tracking-wider">
                <Palette size={13} /> The Story of ArtHub
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                Built by Art Lovers, Crafted for Independent Creators
              </h2>
              <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
                ArtHub was conceived with a clear realization: traditional gallery barriers often prevented exceptional independent creators from reaching global audiences. Collectors were simultaneously searching for original, certified masterpieces beyond mass prints.
              </p>
              <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
                We engineered a platform with real-time stock inventory, secure payments, and creator identity integrity. Today ArtHub hosts oil canvases, sculptures, and digital fine art from artists worldwide.
              </p>
              <div className="pt-1 border-l-3 border-[#df6742] pl-3 italic text-xs text-slate-500 dark:text-white/50">
                “Art is not what you see, but what you make others see. ArtHub ensures those visions are shared worldwide.”
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 h-32 sm:h-36">
                  <img
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
                    alt="Painting Studio"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 h-28 sm:h-32">
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
                    alt="Sculpture Art"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 h-28 sm:h-32">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                    alt="Digital Art Piece"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 h-32 sm:h-36">
                  <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
                    alt="Fine Art Photography"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES (COMPACT) */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-[#df6742]">Guiding Principles</h2>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Our Core Commitments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-xs hover:border-[#df6742]/50 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] flex items-center justify-center mb-3 border border-[#df6742]/20">
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
              <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (COMPACT) */}
      <section className="py-8 sm:py-12 bg-slate-100/60 dark:bg-[#243239]/50 border-t border-b border-slate-200 dark:border-white/10">
        <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-[#df6742]">The ArtHub Process</h2>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">How ArtHub Works</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MILESTONES.map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-xs relative"
              >
                <span className="text-2xl font-black text-[#df6742]/30 block mb-1.5">{step}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (COMPACT) */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto my-4">
        <div className="bg-gradient-to-r from-[#df6742] via-[#c55332] to-[#243239] rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Discover Your Next Masterpiece?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Join thousands of art enthusiasts and collectors acquiring certified original creations directly from independent artists worldwide.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              <NextLink
                href="/browse"
                className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Browse All Masterworks
              </NextLink>
              <NextLink
                href="/all-artists"
                className="bg-black/30 hover:bg-black/50 text-white border border-white/20 px-5 py-2.5 rounded-full text-xs font-bold transition-all"
              >
                Explore Creator Rosters
              </NextLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
