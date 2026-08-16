"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
  // Start as null (unknown) — resolved synchronously on first client paint
  const [show, setShow] = useState<boolean | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fillRectRef = useRef<SVGRectElement>(null);
  const outlineRef = useRef<SVGTextElement>(null);

  // Only show once per browser session, and never for users who prefer
  // reduced motion — skip on refresh/navigation or that OS setting.
  useEffect(() => {
    // Deferred to a microtask so the setState calls aren't synchronous
    // within the effect body (avoids cascading-render lint warning);
    // still resolves before paint, so there's no visible delay.
    queueMicrotask(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (sessionStorage.getItem("loaded") || reducedMotion) {
        sessionStorage.setItem("loaded", "1");
        setShow(false);
        return;
      }
      sessionStorage.setItem("loaded", "1");
      (window as Window & { __loaderActive?: boolean }).__loaderActive = true;
      setShow(true);
    });
  }, []);

  useEffect(() => {
    if (!show) return;

    // Lock scroll as soon as we know the loader will show
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    let cancelled = false;
    let approachTween: gsap.core.Tween | null = null;

    // Resolves once the browser has actually finished loading the page
    // (images, fonts, scripts) — not on a fixed timer.
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
      }
    });
    let loaded = false;
    pageLoaded.then(() => {
      loaded = true;
    });

    const finish = () => {
      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
          (window as Window & { __loaderDone?: boolean }).__loaderDone = true;
          window.dispatchEvent(new CustomEvent("portfolio:loader-done"));
          setShow(false);
        },
      });
    };

    const tl = gsap.timeline({
      onComplete: () => {
        if (cancelled) return;

        if (loaded) {
          // Page was already done loading — finish the fill quickly.
          gsap.to(fillRectRef.current, {
            attr: { y: "0%" },
            duration: 0.2,
            ease: "power2.out",
            onComplete: finish,
          });
          return;
        }

        // Still loading — ease toward (but not all the way to) full while
        // genuinely waiting, so the fill never looks stuck at 70%.
        approachTween = gsap.to(fillRectRef.current, {
          attr: { y: "10%" },
          duration: 1.5,
          ease: "power2.out",
        });

        pageLoaded.then(() => {
          if (cancelled) return;
          approachTween?.kill();
          gsap.to(fillRectRef.current, {
            attr: { y: "0%" },
            duration: 0.25,
            ease: "power2.out",
            onComplete: finish,
          });
        });
      },
    });

    // Outline fades in, then the fill rises to 70% on a fixed timer —
    // the remaining 70% → 100% is driven by real page-load state above.
    tl.from(outlineRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" })
      .to(fillRectRef.current, { attr: { y: "30%" }, duration: 0.8, ease: "power3.out" }, "-=0.1");

    return () => {
      cancelled = true;
      approachTween?.kill();
      tl.kill();
    };
  }, [show]);

  // null = not yet resolved; show blocker to prevent flash
  if (show === false) return null;

  return (
    <>
      <div
        ref={overlayRef}
        id="loading-screen"
        role="status"
        aria-live="polite"
        aria-label="Loading"
        suppressHydrationWarning
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
      {/* Blocking script, runs synchronously right after the overlay is
          parsed — hides it before first paint on repeat visits or when the
          user prefers reduced motion, so React never gets a chance to flash
          it in before its own effect catches up. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(sessionStorage.getItem("loaded")||r){var el=document.getElementById("loading-screen");if(el)el.style.display="none";}}catch(e){}})();`,
        }}
      />
    </>
  );
}
