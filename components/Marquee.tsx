"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ITEMS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "GSAP",
  "Tailwind CSS",
  "PostgreSQL",
  "Python",
  "GitHub Actions",
  "Cypress",
  "REST APIs",
  "NestJS",
];

const SEP = "✦";

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const track = trackRef.current;
    if (!track) return;

    // Clone the track so it loops seamlessly
    const clone = track.cloneNode(true) as HTMLDivElement;
    track.parentElement!.appendChild(clone);

    const totalWidth = track.scrollWidth;

    gsap.set(clone, { position: "absolute", top: 0, left: totalWidth });

    gsap.to([track, clone], {
      x: -totalWidth,
      duration: 28,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
      },
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        overflow: "hidden",
        position: "relative",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 0",
        userSelect: "none",
      }}
    >
      <div ref={trackRef} style={{ display: "inline-flex", gap: "2.5rem", whiteSpace: "nowrap", paddingRight: "2.5rem" }}>
        {ITEMS.map((item) => (
          <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: "2.5rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}>
              {item}
            </span>
            <span style={{ color: "#a855f7", fontSize: "0.5rem" }}>{SEP}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
