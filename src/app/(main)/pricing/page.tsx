import React from "react";
import PricingSection from "@/components/home/PricingSection";

export const metadata = {
  title: "Artist Memberships & Pricing | ArtHub",
  description:
    "Explore transparent artist pricing plans. Start free with up to 5 artworks or upgrade to Basic ($10), Pro ($20), or Ultimate ($50) for unlimited uploads and 0% commission.",
};

export default function PricingPage() {
  return (
    <main className="w-full">
      <PricingSection isFullPage={true} />
    </main>
  );
}
