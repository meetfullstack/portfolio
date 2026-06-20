"use client";

import { useTheme } from "next-themes";
import { useState, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

type ThemeOption = "light" | "dark" | "system";

const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SystemIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const options: { value: ThemeOption; icon: React.ReactNode }[] = [
  { value: "light", icon: <SunIcon /> },
  { value: "dark", icon: <MoonIcon /> },
  { value: "system", icon: <SystemIcon /> },
];

function getCurrentIcon(theme: string | undefined) {
  if (theme === "dark") return <MoonIcon />;
  if (theme === "system") return <SystemIcon />;
  return <SunIcon />;
}

const glassBox = {
  background: "rgba(180,180,180,0.12)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: [
    "inset 0 0 0 1px rgba(255,255,255,0.15)",
    "inset 2px 3px 0px -2px rgba(255,255,255,0.7)",
    "inset -2px -2px 0px -2px rgba(255,255,255,0.5)",
    "inset -0.3px -1px 4px 0px rgba(0,0,0,0.1)",
    "0px 4px 12px 0px rgba(0,0,0,0.1)",
    "0px 8px 32px 0px rgba(0,0,0,0.1)",
  ].join(", "),
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [hoveredOption, setHoveredOption] = useState<ThemeOption | null>(null);

  // false during SSR + initial hydration render, true once on the client —
  // avoids a hydration mismatch without setState-in-effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleMouseEnter() {
    gsap.to(containerRef.current, {
      width: 132,
      duration: 0.4,
      ease: "power4.inOut",
    });
    gsap.to(collapsedRef.current, { opacity: 0, scale: 0.6, duration: 0.2 });
    gsap.to(expandedRef.current, { opacity: 1, duration: 0.25, delay: 0.1 });
  }

  function handleMouseLeave() {
    gsap.to(containerRef.current, {
      width: 52,
      duration: 0.4,
      ease: "power4.inOut",
    });
    gsap.to(collapsedRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      delay: 0.1,
    });
    gsap.to(expandedRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(indicatorRef.current, { opacity: 0, duration: 0.15 });
    setHoveredOption(null);
  }

  function handleBtnEnter(optValue: ThemeOption, idx: number) {
    setHoveredOption(optValue);
    const btn = btnRefs.current[idx];
    const indicator = indicatorRef.current;
    if (!btn || !indicator) return;

    // Use container (not btn.parentElement) as origin — expanded panel has padding
    // that makes parentElement.left differ from the true left edge of the pill track.
    // Forcing width/height to 36 keeps the indicator a perfect circle regardless of
    // any stale GSAP value left from a previous render.
    const btnRect = btn.getBoundingClientRect();
    const containerRect = containerRef.current!.getBoundingClientRect();

    gsap.to(indicator, {
      opacity: 1,
      x: btnRect.left - containerRect.left,
      width: 36,
      height: 36,
      duration: 0.25,
      ease: "power3.out",
    });

    gsap.to(btn, { color: "#a855f7", duration: 0.15 });
  }

  function handleBtnLeave(idx: number) {
    setHoveredOption(null);
    const btn = btnRefs.current[idx];
    if (!btn) return;
    if (theme !== options[idx].value) {
      gsap.to(btn, { color: "var(--text-secondary)", duration: 0.15 });
    }
  }

  function handleBtnDown(idx: number) {
    gsap.to(btnRefs.current[idx], { scale: 0.88, duration: 0.1 });
  }

  function handleBtnUp(idx: number) {
    gsap.to(btnRefs.current[idx], {
      scale: 1,
      duration: 0.15,
      ease: "back.out(2)",
    });
  }

  if (!mounted) return null;

  const displayActive = hoveredOption ?? (theme as ThemeOption);

  return (
    <div
      style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 100 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={containerRef}
        style={{
          width: 52,
          height: 52,
          overflow: "hidden",
          position: "relative",
          borderRadius: 999,
          ...glassBox,
        }}
      >
        {/* collapsed: single icon */}
        <div
          ref={collapsedRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-primary)",
            pointerEvents: "none",
          }}
        >
          {getCurrentIcon(theme)}
        </div>

        {/* expanded: 3 buttons */}
        <div
          ref={expandedRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            gap: 4,
            opacity: 0,
          }}
        >
          {/* sliding indicator — always 36×36 so it stays a perfect circle */}
          <div
            ref={indicatorRef}
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              width: 36,
              height: 36,
              borderRadius: 999,
              opacity: 0,
              border: "1px solid rgba(168,85,247,0.4)",
              background: "rgba(168,85,247,0.15)",
              pointerEvents: "none",
            }}
          />

          {options.map((opt, idx) => (
            <button
              key={opt.value}
              ref={(el) => {
                btnRefs.current[idx] = el;
              }}
              onClick={() => setTheme(opt.value)}
              onMouseEnter={() => handleBtnEnter(opt.value, idx)}
              onMouseLeave={() => handleBtnLeave(idx)}
              onMouseDown={() => handleBtnDown(idx)}
              onMouseUp={() => handleBtnUp(idx)}
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color:
                  displayActive === opt.value
                    ? "#a855f7"
                    : "var(--text-secondary)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
