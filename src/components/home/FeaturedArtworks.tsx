"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import Artcard from "@/components/artwork/Artcard";

const ArtworkSkeleton = () => (
  <div className="bg-white dark:bg-[#1e262b] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 animate-pulse">
    <div className="aspect-4/3 bg-slate-100 dark:bg-white/5 w-full" />
    <div className="p-6 flex flex-col gap-4">
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded" />
      <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/5 rounded" />
      <div className="flex justify-between items-center mt-2">
        <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded" />
        <div className="h-9 w-24 bg-slate-200 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  </div>
);

const FeaturedArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchFeaturedArtworks = async () => {
      try {
        setError(null);
        setLoading(true);
       
        const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
        
        let res;
        try {
          res = await fetch("/api/artworks/featured", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          });
          if (!res.ok) throw new Error("Internal route unsuccessful");
        } catch {
          res = await fetch(`${base}/api/artworks/featured`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          });
        }
       
        if (!res.ok) throw new Error("Server responded with an unstable status.");
        const responseData = await res.json();
       
        if (isMounted) {
          const verifiedData = Array.isArray(responseData)
            ? responseData
            : responseData?.artworks || responseData?.data || [];
            
          setArtworks(verifiedData);
        }
      } catch (err) {
        if (isMounted) {
          setError("Could not load featured masterpieces. Please ensure backend services are active.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedArtworks();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-slate-50 dark:bg-[#2a3942] py-20 px-4 sm:px-6 border-t border-slate-200 dark:border-white/5">
      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto">
       
        <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-[#243239]/10 border border-[#df6742]/30 text-[#df6742] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#df6742]" />
            CURATED EXHIBITION
          </div>
         
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white leading-tight tracking-tight">
            Featured <span className="text-[#df6742]">Artworks</span>
          </h2>
         
          <p className="text-sm md:text-base text-slate-500 dark:text-white/50 mt-4 leading-relaxed">
            Explore the most exclusive and recently updated masterpieces chosen by our curators.
          </p>

          {!loading && !error && artworks.length > 0 && (
            <NextLink
              href="/browse"
              className="mt-6 text-[#df6742] hover:text-slate-800 dark:hover:text-white text-sm font-bold transition-colors duration-200 flex items-center gap-1.5 group border-b border-[#df6742]/0 hover:border-slate-300 dark:hover:border-white/10 pb-0.5"
            >
              Explore Full Gallery
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-1">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </NextLink>
          )}
        </div>

        {error && (
          <div className="text-center py-16 max-w-md mx-auto">
            <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {!loading && !error && artworks.length === 0 && (
          <p className="text-center text-slate-500 dark:text-white/40 text-sm py-16">No recent artworks found.</p>
        )}

        {!error && (loading || artworks.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-6 lg:gap-8">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ArtworkSkeleton key={i} />)
              : artworks.slice(0, 8).map((artwork) => (
                  <Artcard
                    key={artwork._id?.$oid || artwork._id?.toString() || artwork.id}
                    artwork={artwork}
                  />
                ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedArtworks;