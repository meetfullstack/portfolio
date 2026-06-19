"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
  const [show, setShow] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fillRectRef = useRef<SVGRectElement>(null);
  const outlineRef = useRef<SVGTextElement>(null);

  // Only show once per browser session — skip on refresh/navigation
  useEffect(() => {
    if (sessionStorage.getItem("loaded")) return;
    sessionStorage.setItem("loaded", "1");
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;

    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          onComplete: () => {
            document.body.style.overflow = "";
            setShow(false);
          },
        });
      },
    });

    tl.from(outlineRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" })
      .to(fillRectRef.current, { attr: { y: "0%" }, duration: 1.1, ease: "power2.inOut" }, "-=0.1")
      .to({}, { duration: 0.5 });

  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* SVG: ghost outline "M" + rect that rises from bottom clipped to the letter shape */}
      <svg viewBox="0 0 160 160" width="220" height="220">
        <defs>
          <clipPath id="m-clip">
            <text x="80" y="140" textAnchor="middle" fontSize="148"
              fontFamily="var(--font-sans), system-ui, sans-serif" fontWeight="800">
              M
            </text>
          </clipPath>
          <filter id="m-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ghost outline */}
        <text ref={outlineRef} x="80" y="140" textAnchor="middle" fontSize="148"
          fontFamily="var(--font-sans), system-ui, sans-serif" fontWeight="800"
          fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.3)" strokeWidth="1">
          M
        </text>

        {/* Rising fill */}
        <rect ref={fillRectRef} x="0" y="100%" width="100%" height="100%"
          fill="#a855f7" clipPath="url(#m-clip)" />

        {/* Glow */}
        <text x="80" y="140" textAnchor="middle" fontSize="148"
          fontFamily="var(--font-sans), system-ui, sans-serif" fontWeight="800"
          fill="rgba(168,85,247,0.1)" filter="url(#m-glow)" style={{ pointerEvents: "none" }}>
          M
        </text>
      </svg>
    </div>
  );
}
