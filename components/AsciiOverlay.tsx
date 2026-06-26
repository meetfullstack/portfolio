"use client";

import { useEffect, useRef } from "react";

const CHARS = " .";

export default function AsciiOverlay({ src, style }: { src: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      const W   = canvas.offsetWidth  || 338;
      const H   = canvas.offsetHeight || 450;
      const dpr = window.devicePixelRatio || 1;

      // Sample at low resolution — chars are ~1.8× taller than wide
      const COLS = 55;
      const ROWS = Math.round(COLS * (H / W) * 0.55);

      const tmp  = document.createElement("canvas");
      tmp.width  = COLS;
      tmp.height = ROWS;
      const tc   = tmp.getContext("2d")!;
      tc.drawImage(img, 0, 0, COLS, ROWS);
      const px = tc.getImageData(0, 0, COLS, ROWS).data;

      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      const cw = W / COLS;
      const ch = H / ROWS;
      ctx.font         = `bold ${ch * 1.05}px "JetBrains Mono", monospace`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i    = (row * COLS + col) * 4;
          const luma = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
          const char = CHARS[Math.round(luma * (CHARS.length - 1))];
          if (char === " ") continue;

          // Actual photo color, slightly boosted saturation
          const r = px[i], g = px[i + 1], b = px[i + 2];
          const alpha = 0.4 + luma * 0.6;
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillText(char, (col + 0.5) * cw, (row + 0.5) * ch);
        }
      }
    };
    img.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
