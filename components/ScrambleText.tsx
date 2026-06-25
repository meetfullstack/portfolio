"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

const CHARS = "!<>-_\\/[]{}=+*^?#~|.:@%$&";

interface Props {
  from: string;
  to: string;
  className?: string;
  style?: React.CSSProperties;
}

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

export default function ScrambleText({ from, to, className, style }: Props) {
  const { resolvedTheme } = useTheme();
  const maxLen    = Math.max(from.length, to.length);
  const padFrom   = from.padEnd(maxLen, " ");
  const padTo     = to.padEnd(maxLen, " ");

  const [chars, setChars] = useState<string[]>(() => padFrom.split(""));
  const [isDud, setIsDud]  = useState<boolean[]>(() => Array(maxLen).fill(false));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  function scramble(fromText: string, toText: string) {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const len    = Math.max(fromText.length, toText.length);
    const pFrom  = fromText.padEnd(len, " ");
    const pTo    = toText.padEnd(len, " ");

    setChars(pFrom.split(""));
    setIsDud(Array(len).fill(false));

    for (let i = 0; i < len; i++) {
      const delay = i * 40;
      const steps = 5 + rand(5); // 5–9 visible symbol steps × 80ms = 400–720ms per char

      for (let s = 0; s < steps; s++) {
        const t = setTimeout(() => {
          const sym = CHARS[rand(CHARS.length)];
          setChars(prev => { const n = [...prev]; n[i] = sym; return n; });
          setIsDud(prev => { const n = [...prev]; n[i] = true; return n; });
        }, delay + s * 80);
        timers.current.push(t);
      }

      const done = setTimeout(() => {
        setChars(prev => { const n = [...prev]; n[i] = pTo[i]; return n; });
        setIsDud(prev => { const n = [...prev]; n[i] = false; return n; });
      }, delay + steps * 80);
      timers.current.push(done);
    }
  }

  const dudColor = resolvedTheme === "dark" ? "#e0e0e0" : "#222222";

  return (
    <span
      className={className}
      style={{ ...style, display: "block", whiteSpace: "nowrap" }}
      onMouseEnter={() => scramble(from, to)}
      onMouseLeave={() => scramble(to, from)}
    >
      {chars.map((ch, i) =>
        isDud[i] ? (
          <span key={i} style={{ color: dudColor }}>{ch}</span>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </span>
  );
}
