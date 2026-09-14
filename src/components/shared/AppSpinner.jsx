"use client";

import React from "react";
import { OrbitProgress } from "react-loading-indicators";

// OrbitProgress uses 4.8em sizing.
// 12px default small was ~58px, which was visually too large.
// Mapping small to 7.5px scales the indicator down to ~36px (one size smaller, neat & compact).
const FONT_SIZE_MAP = {
  xs: "4.5px",     // ~21px (buttons and inline icons)
  small: "6.5px",  // ~31px (one size smaller, compact & elegant)
  medium: "9px",   // ~43px
  large: "12px",   // ~57px
};

export default function AppSpinner({
  size = "small",
  color = "#ff9003",
  textColor = "#ff9600",
  variant = "spokes",
  text = "",
  className = "",
  style = {},
}) {
  const resolvedFontSize = FONT_SIZE_MAP[size] || (typeof size === "string" ? size : "7.5px");

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <OrbitProgress
        variant={variant}
        color={color}
        size="small"
        text={text}
        textColor={textColor}
        style={{ fontSize: resolvedFontSize, ...style }}
      />
    </span>
  );
}
