"use client";

import React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}