"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <section 
      className="min-h-screen bg-[#243239] flex items-center justify-center px-6 relative overflow-hidden"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Dynamic Artistic Background Blobs for Atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#df6742]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-4000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[150px] pointer-events-none animate-pulse duration-3000"></div>

      <div className="max-w-3xl mx-auto text-center relative z-10">

        {/* Animated Modern 404 Text Section */}
        <div className="relative inline-block select-none group">
          {/* Subtle glowing layer behind the text */}
          <div className="absolute inset-0 bg-[#df6742]/20 blur-3xl rounded-full scale-75 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <h1 className="text-9xl md:text-[12rem] font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-[#df6742] via-[#e27655] to-[#df6742]/80 leading-none drop-shadow-[0_10px_20px_rgba(223,103,66,0.3)] animate-wiggle">
            404
          </h1>
        </div>

        {/* Title with Minimalistic Contrast */}
        <h2 className="mt-6 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Artwork Not Found
        </h2>

        {/* Description */}
        <p className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
          Looks like this masterpiece has vanished from the gallery. 
          The canvas you are looking for might have been moved to a private collection or never existed.
        </p>

        {/* Modern Artistic Accent (Abstract Brush Stroke) */}
        <div className="flex justify-center mt-8">
          <div className="relative h-1.5 w-40 bg-linear-to-r from-transparent via-[#df6742] to-transparent rounded-full opacity-80">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#df6742] rounded-full ring-4 ring-[#243239]"></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            href="/"
            className="px-8 py-3.5 rounded-xl bg-[#df6742] hover:bg-[#c55332] text-white font-bold tracking-wide shadow-lg shadow-[#df6742]/20 hover:shadow-[#df6742]/40 transition-all duration-300 transform active:scale-95 text-sm md:text-base"
          >
            Back To Home
          </Link>

          <Link
            href="/browse"
            className="px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 text-sm md:text-base"
          >
            <FaArrowLeft className="text-xs" />
            <span>Browse Artworks</span>
          </Link>
        </div>

        {/* Premium Artistic Quote Footer */}
        <div className="mt-16 border-t border-white/5 pt-8 max-w-md mx-auto">
          <p className="text-white/30 italic text-xs md:text-sm tracking-wider">
            &ldquo;Every blank canvas is an opportunity for a new masterpiece.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}