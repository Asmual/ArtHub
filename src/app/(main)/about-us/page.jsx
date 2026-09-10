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
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "About Us | ArtHub - Global Fine Art & Contemporary Marketplace",
  description:
    "Learn about ArtHub, our mission to empower independent creators, and how we connect visionary artists with discerning art collectors worldwide.",
};

const STATS = [
  { label: "Original Artworks", value: "10K+", icon: Palette },
  { label: "Verified Creators", value: "1,200+", icon: Users },
  { label: "Countries Reached", value: "40+", icon: Globe },
  { label: "Collector Satisfaction", value: "99.8%", icon: Award },
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
    desc: "Artists catalog their original portfolios with verified stock availability and pricing transparency.",
  },
  {
    step: "02",
    title: "Effortless Discovery",
    desc: "Collectors browse by genre, medium, price tier, or artist credentials using smart filtering and search.",
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
      {/* 1. HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#243239]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#df6742_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/30 text-[#df6742] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-[1.5px] uppercase shadow-xs">
            <Sparkles size={14} className="text-[#df6742]" />
            Discover ArtHub
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Where Art Transcends Boundaries &amp; Inspires <span className="text-[#df6742]">Living Spaces</span>
          </h1>

          <p className="text-slate-600 dark:text-white/60 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
            ArtHub is a premier global fine art marketplace connecting visionary artists with passionate art collectors.
            We dismantle the traditional gallery gatekeeping model to make world-class art universally discoverable,
            authentically verified, and celebratory of independent creative expression.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NextLink
              href="/browse"
              className="bg-[#df6742] hover:bg-[#ca5633] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              Explore Collections <ArrowRight size={15} />
            </NextLink>
            <NextLink
              href="/all-artists"
              className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all"
            >
              Meet The Artists
            </NextLink>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM METRICS */}
      <section className="py-10 bg-slate-100/70 dark:bg-[#1e262b] border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-center shadow-xs hover:border-[#df6742]/40 transition-all flex flex-col items-center"
              >
                <div className="p-2.5 bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] rounded-xl mb-3">
                  <Icon size={20} />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSION & VISION DUAL PILLARS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-[2px] text-[#df6742]">Purpose &amp; Aspiration</h2>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Our Guiding Light</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden group hover:border-[#df6742]/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#df6742]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] flex items-center justify-center mb-6 border border-[#df6742]/20">
              <Target size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed">
              To democratize access to exceptional fine art by bridging creators and collectors through a transparent,
              secure, and aesthetically rich digital platform. We ensure artists retain ownership of their narrative
              while receiving direct patronage without extractive gallery markups.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs font-semibold text-slate-700 dark:text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Direct creator-to-collector sales
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Zero prohibitive listing fees for artists
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Authentic physical &amp; digital provenance
              </li>
            </ul>
          </div>

          {/* Vision Card */}
          <div className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden group hover:border-[#df6742]/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#df6742]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] flex items-center justify-center mb-6 border border-[#df6742]/20">
              <Compass size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Our Vision</h3>
            <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed">
              To become the world’s most trusted and inspiring digital ecosystem where every home, office, and personal
              sanctuary is enriched by unique art. We envision a flourishing global community where artistic talent is
              universally celebrated and rewarded on merit and passion.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs font-semibold text-slate-700 dark:text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Global borderless marketplace reach
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> High-definition artwork inspection tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Supporting the next generation of visual artists
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. STORY SECTION */}
      <section className="py-16 bg-white dark:bg-[#243239] border-t border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#df6742] uppercase tracking-wider">
                <Palette size={14} /> The Story of ArtHub
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-snug">
                Built by Art Lovers, Crafted for Independent Creators
              </h2>
              <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed">
                ArtHub was conceived with a clear realization: the art world was filled with incredible creators whose
                masterworks never reached receptive audiences due to geographic constraints and prohibitive gallery barriers.
                At the same time, collectors were searching for authentic, meaningful pieces beyond mass-produced prints.
              </p>
              <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed">
                We developed a platform that integrates dynamic inventory stock adjustments, secure Stripe checkouts,
                curated artistic genres, and real-time community engagement. Today, ArtHub serves thousands of creators
                spanning contemporary oil canvases, sculptures, digital fine art, and expressive photography.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <div className="border-l-4 border-[#df6742] pl-4 italic text-xs text-slate-500 dark:text-white/50">
                  “Art is not what you see, but what you make others see. ArtHub exists to ensure those visions are shared worldwide.”
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 h-48 sm:h-56">
                  <img
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
                    alt="Painting Studio"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 h-36 sm:h-44">
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
                    alt="Sculpture Art"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 h-36 sm:h-44">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                    alt="Digital Art Piece"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 h-48 sm:h-56">
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

      {/* 5. CORE VALUES */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-[2px] text-[#df6742]">Guiding Principles</h2>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Our Core Commitments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs hover:border-[#df6742]/50 hover:-translate-y-1 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-[#df6742]/10 text-[#df6742] flex items-center justify-center mb-4 border border-[#df6742]/20">
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS / THE JOURNEY */}
      <section className="py-16 bg-slate-100/60 dark:bg-[#243239]/50 border-t border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-[2px] text-[#df6742]">The ArtHub Process</h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">How ArtHub Works</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white dark:bg-[#243239] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs relative"
              >
                <span className="text-3xl font-black text-[#df6742]/25 block mb-2">{step}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto my-8">
        <div className="bg-gradient-to-r from-[#df6742] via-[#c55332] to-[#243239] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Discover Your Next Masterpiece?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Join thousands of art enthusiasts and collectors acquiring certified original creations directly from independent artists worldwide.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <NextLink
                href="/browse"
                className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
              >
                Browse All Masterworks
              </NextLink>
              <NextLink
                href="/all-artists"
                className="bg-black/30 hover:bg-black/50 text-white border border-white/20 px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all"
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
