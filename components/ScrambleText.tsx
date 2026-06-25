"use client";

import { useRef, useEffect } from "react";

const CHARS = "▲■▌▓▒▐▪░▼▫►█";

function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface Props {
  from: string;
  to: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrambleText({ from, to, className, style }: Props) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  // 1. Move functions UP before they are used in useEffect or JSX
  function reveal(target: string) {
    activeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const el = spanRef.current;
    if (!el) return;

    const chars = target.split("");
    const len = chars.length;
    const duds = chars.map((c) => (c === " " ? " " : randChar()));
    const DURATION = 1200;
    const t0 = performance.now();
    let frame = 0;
    activeRef.current = true;

    function tick() {
      if (!activeRef.current || !el) return;
      const elapsed = performance.now() - t0;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = progress * progress; // quadratic ease-in
      const revealed = Math.floor(eased * len);
      frame++;

      el.textContent = chars
        .map((c, i) => {
          if (c === " ") return " ";
          if (i < revealed) return c;
          if (frame % 5 === 0) duds[i] = randChar();
          return duds[i];
        })
        .join("");

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        el.textContent = target;
        activeRef.current = false;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  function scramble(fromText: string, toText: string) {
    activeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const el = spanRef.current;
    if (!el) return;

    const maxLen = Math.max(fromText.length, toText.length);
    const padFrom = fromText.padEnd(maxLen, " ");
    const padTo = toText.padEnd(maxLen, " ");

    type Entry = {
      from: string;
      to: string;
      start: number;
      end: number;
      dud: string;
    };
    const queue: Entry[] = Array.from({ length: maxLen }, (_, i) => {
      const start = Math.floor((i / maxLen) * 10);
      const end = start + 11 + Math.floor(Math.random() * 9);
      return { from: padFrom[i], to: padTo[i], start, end, dud: randChar() };
    });

    let frame = 0;
    let lastTime = 0;
    const INTERVAL = 1000 / 30;
    activeRef.current = true;

    function tick(timestamp: number) {
      if (!activeRef.current || !el) return;
      if (timestamp - lastTime < INTERVAL) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTime = timestamp;

      let complete = 0;
      let output = "";
      for (const entry of queue) {
        if (frame >= entry.end) {
          complete++;
          output += entry.to;
        } else if (frame >= entry.start) {
          if (Math.random() < 0.28) entry.dud = randChar();
          output += entry.dud;
        } else {
          output += entry.from;
        }
      }
      el.textContent = output;

      if (complete === queue.length) {
        el.textContent = toText;
        activeRef.current = false;
        return;
      }
      frame++;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  // 2. NOW declare the useEffect, which can safely call `reveal`
  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    // Pre-fill with random symbols
    el.textContent = from
      .split("")
      .map((c) => (c === " " ? " " : randChar()))
      .join("");

    let timer: ReturnType<typeof setTimeout>;

    const start = () => {
      timer = setTimeout(() => reveal(from), 300);
    };

    const loaderActive = (window as Window & { __loaderActive?: boolean })
      .__loaderActive;

    if (loaderActive) {
      // First visit — wait for loader to finish before revealing
      window.addEventListener("portfolio:loader-done", start, { once: true });
    } else {
      // Return visit (no loader) — start after hero fade-in
      start();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("portfolio:loader-done", start);
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={spanRef}
      className={className}
      style={style}
      onMouseEnter={() => scramble(from, to)}
      onMouseLeave={() => scramble(to, from)}
    >
      {from}
    </span>
  );
}
