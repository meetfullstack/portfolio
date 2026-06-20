"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Elements that should trigger the "grow" state.
const INTERACTIVE = "a, button, input, textarea, label, .card, .tag, [data-cursor]";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Custom cursor only makes sense with a fine pointer (mouse/trackpad).
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    // Dot tracks tightly, ring trails with a softer lag for the liquid feel.
    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

    let shown = false;
    let hovering = false;

    function onMove(e: MouseEvent) {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        document.body.classList.add("cursor-active");
      }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      // Single source of truth for hover state — avoids flicker between child nodes.
      const isInteractive = !!(e.target as HTMLElement).closest?.(INTERACTIVE);
      if (isInteractive !== hovering) {
        hovering = isInteractive;
        gsap.to(ring, {
          scale: isInteractive ? 1.9 : 1,
          borderColor: isInteractive ? "rgba(168,85,247,0.9)" : "rgba(168,85,247,0.5)",
          backgroundColor: isInteractive ? "rgba(168,85,247,0.12)" : "rgba(168,85,247,0)",
          duration: 0.3,
          ease: "power3.out",
        });
        gsap.to(dot, { scale: isInteractive ? 0 : 1, duration: 0.3, ease: "power3.out" });
      }
    }

    function onLeave() {
      shown = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    }

    function onDown() {
      gsap.to(ring, { scale: hovering ? 1.5 : 0.8, duration: 0.2, ease: "power3.out" });
    }
    function onUp() {
      gsap.to(ring, { scale: hovering ? 1.9 : 1, duration: 0.2, ease: "power3.out" });
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("cursor-active");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
