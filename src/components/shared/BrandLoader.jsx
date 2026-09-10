"use client";

import React from "react";

/**
 * BrandLoader - Universal circular dot-spinner animation styled with ArtHub brand colors.
 * Can be used full-screen for route transitions or inline for database fetching states.
 *
 * @param {boolean} fullScreen - If true, renders a fixed backdrop taking the full viewport.
 * @param {string} size - Size of the spinner: "sm", "md" (default), or "lg".
 * @param {string} text - Optional status text displayed below the spinner.
 */
export default function BrandLoader({
  fullScreen = false,
  size = "md",
  text = "Loading ArtHub...",
}) {
  const dotCount = 8;
  const dots = Array.from({ length: dotCount });

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const dotSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-6 select-none">
      {/* Circular Rotating Dots Ring */}
      <div className={`relative ${sizeClasses[size] || sizeClasses.md} flex items-center justify-center`}>
        {dots.map((_, index) => {
          const angle = (index * 360) / dotCount;
          const delay = (index * 0.12).toFixed(2);

          return (
            <div
              key={index}
              className="absolute inset-0 flex items-start justify-center"
              style={{
                transform: `rotate(${angle}deg)`,
              }}
            >
              <div
                className={`${dotSizeClasses[size] || dotSizeClasses.md} rounded-full bg-[#df6742] shadow-sm shadow-[#df6742]/40 animate-pulse`}
                style={{
                  animationDuration: "1s",
                  animationDelay: `${delay}s`,
                  animationIterationCount: "infinite",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ArtHub Branding Label */}
      <div className="text-center space-y-1">
        <h3
          className="text-lg font-extrabold tracking-[0.2em] text-slate-800 dark:text-white uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Art<span className="text-[#df6742]">Hub</span>
        </h3>
        {text && (
          <p className="text-xs font-semibold text-slate-500 dark:text-white/40 tracking-wider">
            {text}
          </p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#2f3f48]/95 backdrop-blur-md transition-all">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center w-full">{spinner}</div>;
}
