"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export interface SmoothScrollContextType {
  getLenis: () => Lenis | null;
  scrollTo: (target?: any, options?: any) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  getLenis: () => null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
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

    let rafId: number;
    function raf(time: number) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    if (typeof window !== "undefined") {
      (window as any).__lenis = lenisInstance;
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        (window as any).__lenis = null;
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
    scrollTo: (target?: any, options?: any) => {
      lenisRef.current?.scrollTo(target, options);
    },
  }), []);

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
