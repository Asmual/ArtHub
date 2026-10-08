"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * SmoothSection wraps page sections in a subtle Framer Motion reveal animation
 * as the user smoothly scrolls down the page.
 */
export default function SmoothSection({
  children,
  className = "",
  delay = 0,
  yOffset = 24,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier curve
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
