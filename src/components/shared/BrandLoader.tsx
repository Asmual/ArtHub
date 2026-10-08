"use client";

import React from "react";
import { OrbitProgress } from "react-loading-indicators";

/**
 * BrandLoader - Universal loading indicator for full pages and section loaders
 * Powered by react-loading-indicators OrbitProgress
 */
export default function BrandLoader({
  fullScreen = false,
  size = "small",
  text = "",
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      <OrbitProgress
        variant="spokes"
        color="#ff9003"
        size={size === "lg" ? "medium" : "small"}
        text=""
        textColor="#ff9600"
      />
      {text && (
        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#2f3f48]/95 backdrop-blur-md transition-all">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center w-full">
      {content}
    </div>
  );
}
