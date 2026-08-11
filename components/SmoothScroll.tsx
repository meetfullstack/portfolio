"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Drives Lenis momentum scrolling off GSAP's ticker so ScrollTrigger and the
// smooth scroll stay in lockstep (no double rAF loops, no jitter).
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Respect the OS-level reduced-motion preference — momentum easing is
    // exactly the kind of motion that can trigger vestibular discomfort.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Let Lenis intercept #anchor clicks (nav + hero CTAs) and glide to them.
      anchors: { offset: -80 },
    });

    // Expose globally so other pages can call lenis.scrollTo(0, { immediate: true })
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
