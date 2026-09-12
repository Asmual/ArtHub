import React from "react";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ArtHub",
  description: "Learn how ArtHub protects your personal data, artistic creations, and transaction records.",
};

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-main)] py-10 sm:py-16"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[#df6742] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            Your trust is our highest priority. Read our commitment to safeguarding your privacy, intellectual property, and payment details.
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Last Updated: September 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Eye size={18} className="text-[#df6742]" />
              <span>1. Information We Collect</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              When you register on ArtHub, create an artist profile, or acquire fine artwork, we collect necessary information such as your name, email address, profile imagery, and artist biography. For transactions, all payment records are processed through secure 256-bit encrypted channels via Stripe.
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--text-muted)] list-disc pl-5">
              <li>Profile data provided during BetterAuth or Google registration</li>
              <li>Artwork inventory information uploaded by exhibiting creators</li>
              <li>Order history and transactional receipts generated upon purchase</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Lock size={18} className="text-[#df6742]" />
              <span>2. How We Protect Your Financial Details</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              ArtHub does not store full credit card numbers or sensitive CVV codes on our servers. All monetary transactions are tokenized and processed directly by Stripe Financial Services in accordance with PCI-DSS Level 1 certification.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <FileText size={18} className="text-[#df6742]" />
              <span>3. Intellectual Property Rights</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Independent artists retain 100% full copyright and moral ownership over all creative artwork exhibited on ArtHub. ArtHub displays thumbnails and previews solely for exhibition, promotion, and marketplace acquisition purposes.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border-line)] shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#df6742]" />
              <span>4. Your Data Rights &amp; Inquiries</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              You maintain the right to view, update, or request deletion of your account data at any time through your Profile Dashboard. For inquiries regarding our privacy practices, reach our support team via our{" "}
              <Link href="/contact" className="text-[#df6742] hover:underline font-semibold">
                Contact Page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
