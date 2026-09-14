"use client";

import React from "react";
import { OrbitProgress } from "react-loading-indicators";

export default function AppSpinner({
  size = "small",
  color = "#ff9003",
  textColor = "#ff9600",
  variant = "spokes",
  text = "",
  className = "",
}) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <OrbitProgress
        variant={variant}
        color={color}
        size={size}
        text={text}
        textColor={textColor}
      />
    </span>
  );
}
