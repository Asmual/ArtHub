'use client';

import React, { useState, useEffect } from 'react';
import AllArtists from '@/components/all-artists/AllArtists';
import { Users, Compass } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server.onrender.com").replace(/\/$/, "");

export default function ExploreArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchArtists = async () => {
      try {
        setLoading(true);
        let res;
        try {
          res = await fetch("/api/artists");
          if (!res.ok) throw new Error("Internal route unsuccessful");
        } catch {
          res = await fetch(`${API_BASE}/api/artists`);
        }
        if (!res.ok) throw new Error("Failed to fetch verified master creators.");
       
        const data = await res.json();
       
        // Advanced structural normalization to ensure every single object passes its true ID field
        const rawList = Array.isArray(data) 
          ? data 
          : (data.artists || data.data || []);

        const validatedArtists = rawList
          .filter(user => user && (user.role === "artist" || user.name || user._id))
          .map(user => {
            // Robust extraction matrix to grab the authentic identifier
            const trueId = 
              user._id?.toString() || 
              user.id?.toString() || 
              user.userId?._id?.toString() || 
              user.userId?.toString();

            return {
              ...user,
              // Overwriting core identity handles to eliminate undefined lookups on custom layouts
              _id: trueId,
              id: trueId
            };
          });
       
        if (isMounted) {
          setArtists(validatedArtists);
        }
      } catch (err) {
        console.error("Error fetching artists:", err);
        if (isMounted) {
          setError("Could not synchronize dynamic artist community records.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
   
    fetchArtists();

  // eslint-disable- Next-line react-hooks/exhaustive-deps
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#2f3f48] pb-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
     
      <div className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#243239] py-4 sm:py-5 shadow-xs">
        <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto px-2 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
         
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-[#df6742]/10 border border-[#df6742]/25 text-[#df6742] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[1.5px] uppercase">
              <Compass className="w-2.5 h-2.5" /> Global Creators
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Explore All <span className="text-[#df6742]">Artists</span>
            </h1>
            <p className="text-slate-500 dark:text-white/50 text-xs max-w-xl">
              Discover verified artists shaping contemporary fine arts and digital masterpieces.
            </p>
          </div>

          {!loading && !error && artists.length > 0 && (
            <div className="bg-slate-50 dark:bg-[#1e262b] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
              <div className="p-1.5 bg-orange-50 dark:bg-[#df6742]/10 rounded-lg text-[#df6742]">
                <Users size={15} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 dark:text-white/40 uppercase font-semibold tracking-wider">Verified Registry</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  <span className="text-[#df6742] font-extrabold">{artists.length}</span> Active Creators
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-[95%] sm:w-[94%] lg:w-[92%] 2xl:w-[90%] mx-auto px-2 sm:px-4 lg:px-6 py-5">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#243239] rounded-2xl border border-slate-200 dark:border-white/5">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-white/60 text-xs font-semibold">{error}</p>
          </div>
        ) : (
          <AllArtists artists={artists} loading={loading} />
        )}
      </div>
    </div>
  );
}