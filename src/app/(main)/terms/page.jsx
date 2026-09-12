import React from "react";
import { Scale, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | ArtHub",
  description: "Read the terms governing the exhibition, acquisition, and curation of artwork on ArtHub.",
};

export default function TermsOfServicePage() {
  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-main)] py-10 sm:py-16"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[#df6742] text-xs font-bold uppercase tracking-wider">
            <Scale size={14} />
            <span>Community Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            These terms establish a respectful, secure, and transparent marketplace for creators and collectors worldwide.
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Effective Date: September 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Sparkles size={18} className="text-[#df6742]" />
              <span>1. Marketplace Purpose &amp; Membership</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              ArtHub provides a premier digital gallery bridging visual creators with independent collectors. By registering an account, exhibiting artwork, or acquiring pieces, you agree to comply with our community standards and applicable laws.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#df6742]" />
              <span>2. Creator Commitments &amp; Authenticity</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              All exhibiting artists warrant that pieces displayed are authentic original works created with genuine provenance. Artists agree to fulfill physical dispatch or high-resolution delivery upon completed buyer transaction verification.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Scale size={18} className="text-[#df6742]" />
              <span>3. Payments, Subscriptions &amp; Platform Fees</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Artwork transactions and artist subscription memberships are billed in USD via Stripe. Platform commission fees are determined according to the artist&apos;s active membership plan (Free, Basic, Pro, or Ultimate Studio). All fees are clearly detailed prior to transaction confirmation.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <AlertCircle size={18} className="text-[#df6742]" />
              <span>4. Disallowed Content &amp; Account Suspension</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              ArtHub strictly prohibits unlawful, infringing, fraudulent, or counterfeit uploads. Accounts found violating community guidelines or intellectual property rights may be suspended immediately by platform administrators.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pt-4">
          <p className="text-xs text-[var(--text-muted)]">
            Have questions regarding our terms?{" "}
            <Link href="/contact" className="text-[#df6742] hover:underline font-semibold">
              Get in touch with support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
