"use client";

import { useEffect, useRef } from "react";

const LETTERS =
  "アイウエオカキクケコトナニABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ".split(
    "",
  );

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 10;
    let drops: number[] = [];
    let raf: number;
    let lastTime = 0;

    // Theme state tracked inside the tick loop — no MutationObserver so
    // Lenis scroll classes and next-themes hydration flickers never trigger resets.
    let lastDark = document.documentElement.classList.contains("dark");
    // Skip theme-change detection on the very first tick so any hydration
    // class flicker that happened before mount is already settled.
    let settled = false;

    function solidFill(dark: boolean) {
      ctx!.fillStyle = dark ? "#000000" : "#f5f5f7";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    // Set dimensions once — never reassign canvas.width/height so scroll
    // can never clear the bitmap.
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drops = Array(Math.floor(canvas.width / fontSize)).fill(1);
    solidFill(lastDark);

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (now - lastTime < 66) return; // ~15 fps
      lastTime = now;

      if (!canvas || !ctx) return;
      const dark = document.documentElement.classList.contains("dark");

      if (!settled) {
        // First tick: sync to the real post-hydration theme and start drawing
        settled = true;
        lastDark = dark;
      } else if (dark !== lastDark) {
        // Genuine user toggle — wipe and restart
        lastDark = dark;
        solidFill(dark);
        drops = Array(Math.floor(canvas.width / fontSize)).fill(1);
        return;
      }

      ctx.fillStyle = dark ? "rgba(0,0,0,0.1)" : "rgba(245,245,247,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = dark ? "rgba(168,85,247,0.25)" : "rgba(139,92,246,0.25)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        drops[i]++;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
      }
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    />
  );
}
