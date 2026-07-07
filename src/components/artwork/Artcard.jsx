/* eslint-disable @next/next/no-img-element */
import NextLink from "next/link";

export default function Artcard({ artwork }) {
  return (
    <div className="bg-white dark:bg-[#1e262b] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-black/10">
        <img
          src={artwork.image || artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
        
        {/* Availability Badge on top of image */}
        {artwork.isSold ? (
          <span className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-md text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
            Sold Out
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur-md text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
            Available
          </span>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col grow justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white truncate mb-0.5">
            {artwork.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-white/40 mb-4 truncate">
            By {artwork.artistName || "Unknown"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[#df6742] text-base font-bold">
            ${artwork.price}
          </span>
          
          <NextLink
            href={`/browse/${artwork._id}`}
            className="bg-[#df6742] hover:bg-[#c85734] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors duration-200"
          >
            View Details
          </NextLink>
        </div>
      </div>
    </div>
  );
}