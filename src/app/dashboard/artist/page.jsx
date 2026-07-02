 
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Palette,
  DollarSign,
  PlusCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
  ImageOff
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ArtistDashboard() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;

  const [stats, setStats] = useState({ totalArts: 0, totalEarnings: 0 });
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Strictly bind routing access permissions to registered artists only
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "artist") {
        toast.error("Restricted access area. Visual creators only!");
        router.replace("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.id || user.role !== "artist") return;

    const fetchArtistData = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
       
        const statsResponse = await fetch(`${base}/api/artist/stats/${user.id}`);
        const statsData = await statsResponse.json();

        const galleryResponse = await fetch(`${base}/api/artist/artworks/${user.id}`);
        const galleryData = await galleryResponse.json();

        if (statsResponse.ok && statsData) {
          setStats({
            totalArts: statsData.totalArts || 0,
            totalEarnings: statsData.totalEarnings || 0
          });
        }

        if (galleryResponse.ok && Array.isArray(galleryData)) {
          setRecentArtworks(galleryData.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load dynamic artist dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [user]);

  if (authLoading || (!user || user.role !== "artist")) {
    return (
      <div className="min-h-screen bg-[#2f3f48] flex flex-col items-center justify-center gap-2 text-white">
        <Loader2 className="w-8 h-8 text-[#df6742] animate-spin" />
        <p className="text-xs text-white/40">Securing studio session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white p-4">
   
      <div className="bg-[#243239] p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#df6742]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-block px-2.5 py-0.5 bg-[#df6742]/10 border border-[#df6742]/20 rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#df6742]">
                Creator Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide">
              {user?.name || "Creator"}&apos;s Studio
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl leading-relaxed">
              Welcome back! Showcase your creativity, upload new canvas masterpieces, and monitor your global sales analytics in real-time.
            </p>
          </div>
         
          <Link
            href="/dashboard/artist/add-art"
            className="flex items-center gap-2 bg-[#df6742] hover:bg-[#c55332] text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] shrink-0 h-fit w-fit"
          >
            <PlusCircle size={16} /> Upload Masterpiece
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       
        <div className="bg-[#243239] p-5 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Total Artwork Creations</p>
            <h3 className="text-2xl font-black text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-500" /> : stats.totalArts}
            </h3>
          </div>
          <div className="p-3 bg-[#df6742]/10 rounded-xl border border-[#df6742]/20 group-hover:bg-[#df6742]/20 transition-all">
            <Palette className="w-5 h-5 text-[#df6742]" />
          </div>
        </div>

        <div className="bg-[#243239] p-5 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Total Revenue Generated</p>
            <h3 className="text-2xl font-black text-emerald-400 flex items-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-500" /> : `$${stats.totalEarnings.toFixed(2)}`}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-all">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-6">
       
        <div className="lg:col-span-1 bg-[#243239] p-5 rounded-xl border border-white/5 space-y-4 h-fit">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Studio Navigation</h3>
            <p className="text-[11px] text-white/40">Manage your collections and profile metadata</p>
          </div>
         
          <div className="space-y-2 pt-2">
            <Link
              href="/dashboard/artist/my-artworks"
              className="flex items-center justify-between p-3 bg-black/10 hover:bg-black/20 rounded-xl border border-white/5 transition-all group text-sm"
            >
              <span className="text-white/80 group-hover:text-[#df6742] transition-colors">My Gallery Showcase</span>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#df6742] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/dashboard/artist/profile"
              className="flex items-center justify-between p-3 bg-black/10 hover:bg-black/20 rounded-xl border border-white/5 transition-all group text-sm"
            >
              <span className="text-white/80 group-hover:text-[#df6742] transition-colors">Artist Profile Settings</span>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#df6742] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#243239] p-5 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Studio Uploads</h3>
              <p className="text-[11px] text-white/40">The latest visual art pieces curated by you</p>
            </div>
            <Link href="/dashboard/artist/my-artworks" className="text-xs font-bold text-[#df6742] hover:underline flex items-center gap-1">
              View Full Gallery <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#df6742]" />
              </div>
            ) : recentArtworks.length === 0 ? (
              <div className="text-center py-10 bg-black/10 rounded-xl border border-white/5">
                <TrendingUp className="w-5 h-5 mx-auto text-white/20 mb-1" />
                <p className="text-xs text-white/40">No artwork submissions found. Start uploading your masterpieces!</p>
              </div>
            ) : (
              recentArtworks.map((art) => (
                <div
                  key={art._id}
                  className="p-3 bg-black/10 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-black/20 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      {art.image ? (
                        <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20"><ImageOff size={14} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white/90 truncate">{art.title}</p>
                      <p className="text-[10px] text-[#df6742] font-semibold tracking-wide uppercase mt-0.5">{art.category || "General"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-white text-sm block">
                      ${art.price?.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-white/30 block font-mono">
                      {art.isSold ? "Sold" : "Available"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}