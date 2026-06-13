"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative flex h-8 w-16 items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20"
    >
      <span
        className={`absolute flex h-6 w-6 items-center justify-center rounded-full text-sm transition-all duration-300 ${
          isDark ? "translate-x-9" : "translate-x-1"
        } accent-gradient`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
