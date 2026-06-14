"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<ThemeOption | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const displayActive = hoveredOption ?? (theme as ThemeOption);

  return (
    <div
      style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 100 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setHoveredOption(null);
      }}
    >
      <motion.div
        animate={{ width: expanded ? 164 : 52, borderRadius: 999 }}
        transition={{ duration: 0.4, ease: [1, 0, 0.4, 1] }}
        style={{
          height: 52,
          overflow: "hidden",
          position: "relative",
          ...glassBox,
        }}
      >
        <motion.div
          animate={{ opacity: expanded ? 0 : 1, scale: expanded ? 0.6 : 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-primary)",
            pointerEvents: expanded ? "none" : "auto",
          }}
        >
          {getCurrentIcon(theme)}
        </motion.div>

        <motion.div
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.25, delay: expanded ? 0.1 : 0 }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            gap: 4,
          }}
        >
          {options.map((opt) => {
            const isDisplayed = displayActive === opt.value;
            const isSelected = theme === opt.value;
            return (
              <motion.button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                onMouseEnter={() => setHoveredOption(opt.value)}
                onMouseLeave={() => setHoveredOption(null)}
                whileTap={{ scale: 0.9 }}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  color: isSelected
                    ? "#a855f7"
                    : isDisplayed
                      ? "#a855f7"
                      : "var(--text-secondary)",
                  position: "relative",
                  transition: "color 0.2s",
                }}
              >
                {isDisplayed && (
                  <motion.div
                    layoutId="indicator"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      border: "1px solid rgba(168,85,247,0.4)",
                      background: "rgba(168,85,247,0.15)",
                    }}
                    transition={{ duration: 0.3, ease: [1, 0, 0.4, 1] }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {opt.icon}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
