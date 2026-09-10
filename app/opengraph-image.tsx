import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

// Generated 1200x630 social card, statically optimized at build time.
// Replaces the previous portrait /profile.jpg (1516x1980, ~660KB), which
// rendered awkwardly cropped on link previews.

export const alt = "Meet Upadhyay — Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const host = new URL(SITE_URL).host;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0a0a",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            color: "#a855f7",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#a855f7",
              color: "#0a0a0a",
              fontWeight: 800,
              fontSize: 28,
            }}
          >
            M
          </div>
          Meet.dev
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 30, color: "#a855f7" }}>
            {"// hello.world"}
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            Meet Upadhyay
          </div>
          <div style={{ fontSize: 40, color: "#c4b5fd" }}>
            Full-Stack Developer
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#a1a1a6",
          }}
        >
          <span>React · Next.js · TypeScript</span>
          <span>{host}</span>
        </div>
      </div>
    ),
    size,
  );
}
