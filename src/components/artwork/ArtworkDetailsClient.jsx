"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import ReviewSection from "./ReviewSection";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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
    artwork?.resolvedArtistId ||
    artwork?.artistId ||
    artwork?.userId ||
    artwork?.artist?._id;

  const artistRealName =
    artwork?.artistName || artwork?.artist?.name || "Zainul Abedin";

  const isAdmin = user?.role === "admin";
  const isOwner =
    user &&
    (user.email?.toLowerCase() === artwork?.artistEmail?.toLowerCase() ||
      user.email?.toLowerCase() === artwork?.userEmail?.toLowerCase() ||
      user.id === artistId?.toString());

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

  // Initiate Stripe checkout redirection
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

      const payload = {
        artworkId: artwork?._id,
        price: Number(artwork.price),
      };

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
        window.location.href = data.url;
      } else {
        throw new Error("Stripe secure gateway url missing from response.");
      }
    } catch (err) {
      console.error("[PAYMENT ERROR] Checkout redirection error:", err);
      toast.error(err.message || "An unexpected network fault occurred.");
    } finally {
      setIsRedirecting(false);
    }
  };

  // Determine button display text based on status
  const getButtonText = () => {
    if (isRedirecting) return "Connecting Gateway...";
    if (artwork.isSold) return "Sold Out";
    if (isAdmin) return "Admin View Only";
    if (isOwner) return "Your Artwork";
    return "Buy Now";
  };

  const isBuyDisabled = Boolean(artwork.isSold || isRedirecting || isAdmin || isOwner);

  return (
    <main className="min-h-screen bg-white dark:bg-[#2f3f48] py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-500/30 bg-slate-100 dark:bg-neutral-900/40">
            {artwork.image && (
              <Image
                src={artwork.image}
                alt={artwork.title || "Artwork Image"}
                fill
                priority
                sizes="(max-w-768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            <span className="absolute top-4 left-4 z-10 bg-[#df6742] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {artwork.category}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">
                {artwork.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Published on {formatBDDateTime(artwork.createdAt)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-black/25 p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  {artistId ? (
                    <Link
                      href={`/artists-profile/${artistId.toString()}`}
                      className="inline-block group"
                    >
                      <h4 className="text-base font-black text-slate-800 dark:text-white hover:text-[#df6742] transition-colors flex items-center gap-2 cursor-pointer">
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
                    <h4 className="text-base font-bold text-slate-700 dark:text-white/90 flex items-center gap-1.5">
                      {artistRealName}
                    </h4>
                  )}
                  <p className="text-xs text-slate-500 dark:text-white/60 tracking-wider font-medium uppercase mt-1">
                    {artwork.specialty || artwork.category || "Fine Art"} Artist
                    / Creator
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">
                Description
              </h2>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed max-w-prose">
                {artwork.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-neutral-500/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-neutral-400 uppercase font-semibold">
                  Purchase Price
                </p>
                <p className="text-2xl font-black text-[#df6742] mt-1">
                  ${artwork.price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-neutral-400 uppercase font-semibold">
                  Availability
                </p>
                {artwork.isSold ? (
                  <span className="inline-block mt-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                    Sold Out
                  </span>
                ) : (
                  <span className="inline-block mt-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                    Available
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStripeCheckout}
                disabled={isBuyDisabled}
                className={`w-full text-sm font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 tracking-wide uppercase ${
                  isBuyDisabled
                    ? "bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 cursor-not-allowed"
                    : "bg-[#df6742] hover:bg-[#c5522f] text-white active:scale-[0.99]"
                }`}
              >
                {isRedirecting && <Loader2 className="w-4 h-4 animate-spin" />}
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-neutral-500/30 pt-8">
          {isPending ? (
            <div className="text-sm text-slate-500 dark:text-neutral-400 animate-pulse pl-1">
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