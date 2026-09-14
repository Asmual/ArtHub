"use client";

import React from "react";
import AppSpinner from "@/components/shared/AppSpinner";

/**
 * DashboardContentLoader
 * Standard in-content loading spinner for dashboard sub-pages.
 * Keeps the dashboard navbar and sidebar mounted and visible,
 * displaying the loading animation strictly within the data/content area.
 */
export default function DashboardContentLoader({ text = "Loading data..." }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3 text-[var(--text-muted)] py-12 w-full select-none">
      <AppSpinner size="small" />
      {text && (
        <p className="text-xs text-[var(--text-muted)] tracking-wide font-medium">
          {text}
        </p>
      )}
    </div>
  );
}
