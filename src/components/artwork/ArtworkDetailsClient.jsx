/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import ReviewSection from "./ReviewSection";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Helper function to generate a valid backend JWT token using user email
const getAuthToken = async (base, email) => {
  const res = await fetch(`${base}/api/users/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Token generation failed.");
  const { token } = await res.json();
  return token;
};

export default function ArtworkDetailsClient({ artwork }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [isRedirecting, setIsRedirecting] = useState(false);

  const artistId =
    artwork?.artistId ||
    artwork?.userId ||
    artwork?.artist?._id ||
    artwork?.artist;

  const artistRealName =
    artwork?.artistName || artwork?.artist?.name || "Zainul Abedin";

  const isAdmin = user?.role === "admin";
  const isArtist = user?.role === "artist";

  const hasPaid =
    artwork.isSold &&
    (artwork.buyerId === user?.id ||
      artwork.buyerId?.toString() === user?.id?.toString());

  const formatBDDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      toast.error("Please login to purchase this artwork!");
      return;
    }

    setIsRedirecting(true);

    try {
      const base = (
        process.env.NEXT_PUBLIC_API_URL ||
        "https://arthub-server-z4w8.onrender.com"
      ).replace(/\/$/, "");

      const targetToken = await getAuthToken(base, user.email);

      // ফ্রন্টএন্ড ট্র্যাকিং লগ মেটাডেটা ভেরিফিকেশন
      const payload = {
        artworkId: artwork?._id,
        price: Number(artwork.price),
        artworkName: artwork.title,
        userEmail: user.email,
        buyerEmail: user.email,
        userId: user.id,
      };
      
      console.log("[FRONTEND LOG] Dispatched payload payload maps to checkout stream: ", payload);

      const response = await fetch(
        `${base}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${targetToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to initiate payment redirection.",
        );
      }

      if (data.url) {
        console.log(`[FRONTEND SUCCESS] Secure Gateway Route Target URL intercepted: ${data.url}`);
        window.location.href = data.url;
      } else {
        throw new Error("Stripe secure gateway url missing from response.");
      }
    } catch (err) {
      console.error("Redirection pipeline checkpoint error:", err);
      toast.error(err.message || "An unexpected network fault occurred.");
    } finally {
      setIsRedirecting(false);
    }
  };

  const getButtonText = () => {
    if (isRedirecting) return "Connecting Gateway...";
    if (artwork.isSold) return "Sold Out";
    if (isAdmin) return "Purchase Locked (Admin)";
    if (isArtist) return "Purchase Locked (Artist)";
    return "Buy Now";
  };

  return (
    <main className="min-h-screen bg-[#2f3f48] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-neutral-500/30 bg-neutral-900/40">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-[#df6742] text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {artwork.category}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                {artwork.title}
              </h1>
              <p className="text-xs text-neutral-400">
                Published on {formatBDDateTime(artwork.createdAt)}
              </p>
            </div>

            <div className="bg-black/25 p-5 rounded-xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  {artistId ? (
                    <Link
                      href={`/artists-profile/${artistId.toString()}`}
                      className="inline-block group"
                    >
                      <h4 className="text-base font-black text-white hover:text-[#df6742] transition-colors flex items-center gap-2 cursor-pointer">
                        {artistRealName}
                        <span
                          className="inline-flex items-center justify-center bg-[#1d9bf0] text-white rounded-full p-0.5"
                          title="Verified Creator"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </span>
                      </h4>
                    </Link>
                  ) : (
                    <h4 className="text-base font-bold text-white/90 flex items-center gap-1.5">
                      {artistRealName}
                    </h4>
                  )}
                  <p className="text-xs text-white/60 tracking-wider font-medium uppercase mt-1">
                    {artwork.specialty || artwork.category || "Fine Art"} Artist
                    / Creator
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Description
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-prose">
                {artwork.description}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-500/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">
                  Purchase Price
                </p>
                <p className="text-2xl font-black text-[#df6742] mt-1">
                  ${artwork.price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">
                  Availability
                </p>
                {artwork.isSold ? (
                  <span className="inline-block mt-2 bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                    Sold Out
                  </span>
                ) : (
                  <span className="inline-block mt-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                    Available
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStripeCheckout}
                disabled={
                  artwork.isSold || isRedirecting || isAdmin || isArtist
                }
                className={`w-full text-sm font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 tracking-wide uppercase ${
                  artwork.isSold || isAdmin || isArtist
                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                    : "bg-[#df6742] hover:bg-[#c5522f] text-white active:scale-[0.99]"
                }`}
              >
                {isRedirecting && <Loader2 className="w-4 h-4 animate-spin" />}
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-500/30 pt-8">
          {isPending ? (
            <div className="text-sm text-neutral-400 animate-pulse pl-1">
              Verifying authentication status...
            </div>
          ) : (
            <ReviewSection
              artworkId={artwork?._id}
              currentUser={user}
              hasPaid={hasPaid}
              isAdmin={isAdmin}
              isArtist={isArtist}
            />
          )}
        </div>
      </div>
    </main>
  );
}