"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const SmoothScrollContext = createContext({
  getLenis: () => null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    // Instantiate Lenis smooth scroll engine
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential momentum deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenisRef.current = lenisInstance;

    let rafId;
    function raf(time) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    if (typeof window !== "undefined") {
      window.__lenis = lenisInstance;
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        window.__lenis = null;
      }
    };
  }, []);

  // Smoothly reset scroll position to top whenever route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  const contextValue = useMemo(() => ({
    getLenis: () => lenisRef.current,
    scrollTo: (target, options) => {
      lenisRef.current?.scrollTo(target, options);
    },
  }), []);

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}


