"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── sprite sheet — recolored from PixelCat (MIT, by Pistachios) ────
// See /CREDITS.md for license text + attribution.
const SHEET_SRC  = "/glitch-sprite.png";
const CELL       = 32;   // source cell size in the sprite sheet
const SCALE      = 2;    // output scale
const CW_PX      = CELL * SCALE;
const CH_PX      = CELL * SCALE;

const WALK_SPD   = 45;
const SPRINT_SPD = 160;
const MARGIN     = 12;

// Accent color for the "?" / "!!" reaction marks
const ACCENT = "#EFB878";

// ── frame coordinates (col, row) in the sheet — each cell is 32x32 ──
const F = {
  sit:    [0, 0] as [number, number],
  sitAlt: [0, 1] as [number, number],
  sniffA: [0, 2] as [number, number],
  sniffB: [3, 2] as [number, number],
  walkA:  [0, 4] as [number, number],
  walkB:  [4, 4] as [number, number],
  runA:   [0, 7] as [number, number],
  runB:   [3, 7] as [number, number],
  sleepA: [0, 6] as [number, number],
  sleepB: [2, 6] as [number, number],
  alert:  [3, 3] as [number, number],
  pounce: [1, 8] as [number, number],
};

// ── draw helpers ─────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;

function drawCell(ctx: Ctx, img: HTMLImageElement, cell: [number, number], dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }
  const [col, row] = cell;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, col * CELL, row * CELL, CELL, CELL, 0, 0, CW_PX, CH_PX);
  if (dir === -1) ctx.restore();
}

function drawMark(ctx: Ctx, glyph: "?" | "!!") {
  ctx.fillStyle = ACCENT;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText(glyph, CW_PX * 0.78, 12);
}

function drawWalk(ctx: Ctx, img: HTMLImageElement, frame: number, dir: 1 | -1) {
  drawCell(ctx, img, frame === 0 ? F.walkA : F.walkB, dir);
}

function drawSprint(ctx: Ctx, img: HTMLImageElement, frame: number, dir: 1 | -1) {
  drawCell(ctx, img, frame === 0 ? F.runA : F.runB, dir);
}

function drawSit(ctx: Ctx, img: HTMLImageElement) {
  drawCell(ctx, img, F.sit, 1);
}

function drawSleep(ctx: Ctx, img: HTMLImageElement, frame: number) {
  drawCell(ctx, img, frame === 0 ? F.sleepA : F.sleepB, 1);
}

function drawLick(ctx: Ctx, img: HTMLImageElement, frame: number) {
  drawCell(ctx, img, frame === 0 ? F.sniffA : F.sniffB, 1);
}

function drawBump(ctx: Ctx, img: HTMLImageElement, dir: 1 | -1) {
  drawCell(ctx, img, F.alert, dir);
  drawMark(ctx, "?");
}

function drawPoke(ctx: Ctx, img: HTMLImageElement, dir: 1 | -1) {
  ctx.save();
  ctx.translate(0, -SCALE * 4);
  drawCell(ctx, img, F.pounce, dir);
  drawMark(ctx, "!!");
  ctx.restore();
}

function drawHold(ctx: Ctx, img: HTMLImageElement, frame: number) {
  const angle = frame === 0 ? -0.12 : 0.12;
  ctx.save();
  ctx.translate(CW_PX / 2, CH_PX / 2);
  ctx.rotate(angle);
  ctx.translate(-CW_PX / 2, -CH_PX / 2);
  drawCell(ctx, img, F.sitAlt, 1);
  ctx.restore();
}

// ── Messages ─────────────────────────────────────────────────────

function timeGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning! ☀️";
  if (h >= 12 && h < 17) return "Good afternoon!";
  if (h >= 17 && h < 21) return "Good evening! 🌙";
  return "still up? 😴";
}

const IDLE_MSGS = [
  "meow", "purr...", "mrrrow!", "*yawn*", "pspsps",
  "// meow", "git commit -m 'meow'", "null pointer? meow.",
  "i see u", "(ฅ^•ﻌ•^)ฅ", "^._.^", "feed me pls",
];

const POKE_MSGS = ["hey!!", "ouch!", "( >ᴗ<)", "uwu", "hiss!", "mrow?", "!!"];

type State = "walk" | "idle-sit" | "idle-lick" | "idle-sleep" | "sprint" | "bump" | "poke" | "hold";

// ── Component ────────────────────────────────────────────────────

export default function NavCat() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  const xRef        = useRef(80);
  const dirRef      = useRef<1 | -1>(1);
  const stateRef    = useRef<State>("walk");
  const frameRef    = useRef(0);
  const gsapRef     = useRef<gsap.core.Tween | null>(null);
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const msgTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rafRef      = useRef<number>(0);
  const lastScrollY = useRef(0);
  const pokeQueue   = useRef(false);

  const [bubble, setBubble] = useState<string | null>(null);
  const [tip, setTip]       = useState(false);

  const updatePos = useCallback(() => {
    if (containerRef.current) containerRef.current.style.left = xRef.current + "px";
  }, []);

  const say = useCallback((msg: string, ms = 3000) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(msg);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);

  // ── Sprite loop ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const img = new window.Image();
    img.src = SHEET_SRC;

    let lastTime = 0;

    function loop(t: number) {
      if (!img.complete || img.naturalWidth === 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const state    = stateRef.current;
      const dir      = dirRef.current;
      const interval = state === "sprint" ? 90 : state === "idle-sleep" ? 600 : 200;

      if (t - lastTime > interval) {
        lastTime = t;
        frameRef.current = (frameRef.current + 1) % 2;
        const f = frameRef.current;

        switch (state) {
          case "walk":       drawWalk(ctx, img, f, dir);   break;
          case "sprint":     drawSprint(ctx, img, f, dir); break;
          case "idle-sit":   drawSit(ctx, img);             break;
          case "idle-sleep": drawSleep(ctx, img, f);         break;
          case "idle-lick":  drawLick(ctx, img, f);         break;
          case "bump":       drawBump(ctx, img, dir);        break;
          case "poke":       drawPoke(ctx, img, dir);        break;
          case "hold":       drawHold(ctx, img, f);          break;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Movement + behaviour machine ──────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function bounds() {
      const w = wrap!.getBoundingClientRect().width;
      return { min: MARGIN, max: w - CW_PX - MARGIN };
    }

    function stopAll() {
      gsapRef.current?.kill();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    }

    function walk() {
      const { min, max } = bounds();
      const target = dirRef.current === 1 ? max : min;
      const dist   = Math.abs(target - xRef.current);
      if (dist < 1) { handleEdge(); return; }

      stateRef.current = "walk";
      gsapRef.current?.kill();
      gsapRef.current = gsap.to(xRef, {
        current: target,
        duration: dist / WALK_SPD,
        ease: "none",
        onUpdate: updatePos,
        onComplete: handleEdge,
      });
    }

    function handleEdge() {
      stopAll();
      stateRef.current = "bump";
      setTimeout(() => {
        dirRef.current = dirRef.current === 1 ? -1 : 1;
        if (Math.random() < 0.35) doIdle();
        else walk();
      }, 800);
    }

    function doIdle() {
      stopAll();
      const pick = Math.random();
      if      (pick < 0.33) stateRef.current = "idle-sit";
      else if (pick < 0.66) stateRef.current = "idle-lick";
      else                  stateRef.current = "idle-sleep";
      const dur = 1800 + Math.random() * 3000;
      idleTimer.current = setTimeout(() => { stateRef.current = "walk"; walk(); }, dur);
    }

    function sprintTo(targetX: number, onDone?: () => void) {
      stopAll();
      dirRef.current   = targetX > xRef.current ? 1 : -1;
      stateRef.current = "sprint";
      const dist = Math.abs(targetX - xRef.current);
      gsapRef.current  = gsap.to(xRef, {
        current: targetX,
        duration: Math.max(0.2, dist / SPRINT_SPD),
        ease: "power2.out",
        onUpdate: updatePos,
        onComplete: onDone,
      });
    }

    updatePos();
    walk();

    // Scheduled chatter
    function scheduleMsg() {
      const delay = 12000 + Math.random() * 18000;
      msgTimer.current = setTimeout(() => {
        const msg = Math.random() < 0.2
          ? timeGreeting()
          : IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
        say(msg);
        scheduleMsg();
      }, delay);
    }
    const greetTimer = setTimeout(() => { say(timeGreeting(), 4000); scheduleMsg(); }, 4000);

    // Scroll reaction
    function onScroll() {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;
      if (delta > 18 && stateRef.current !== "hold" && stateRef.current !== "poke") {
        stopAll();
        stateRef.current = "hold";
        idleTimer.current = setTimeout(() => {
          if (stateRef.current === "hold") { stateRef.current = "walk"; walk(); }
        }, 900);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Nav link hover — sprint to hover target
    const navLinks = wrap.closest("header")?.querySelectorAll("nav a");

    function onLinkEnter(e: Event) {
      const link    = e.currentTarget as HTMLElement;
      const wrapR   = wrap!.getBoundingClientRect();
      const linkR   = link.getBoundingClientRect();
      const targetX = linkR.left - wrapR.left + linkR.width / 2 - CW_PX / 2;
      sprintTo(targetX, () => { stateRef.current = "idle-sit"; });
    }

    function onLinkLeave() {
      if (stateRef.current === "idle-sit" || stateRef.current === "sprint") {
        setTimeout(() => { stateRef.current = "walk"; walk(); }, 400);
      }
    }

    navLinks?.forEach(l => {
      l.addEventListener("mouseenter", onLinkEnter);
      l.addEventListener("mouseleave", onLinkLeave);
    });

    (wrap as HTMLDivElement & { __catSprint?: typeof sprintTo; __catWalk?: typeof walk })
      .__catSprint = sprintTo;
    (wrap as HTMLDivElement & { __catWalk?: typeof walk }).__catWalk = walk;

    return () => {
      stopAll();
      clearTimeout(greetTimer);
      clearTimeout(msgTimer.current);
      clearTimeout(bubbleTimer.current);
      window.removeEventListener("scroll", onScroll);
      navLinks?.forEach(l => {
        l.removeEventListener("mouseenter", onLinkEnter);
        l.removeEventListener("mouseleave", onLinkLeave);
      });
    };
  }, [say, updatePos]);

  // ── Click / poke ──────────────────────────────────────────────
  function handlePoke() {
    if (pokeQueue.current) return;
    pokeQueue.current = true;

    const wrap   = wrapRef.current as HTMLDivElement & { __catSprint?: (x: number, cb?: () => void) => void; __catWalk?: () => void };
    const sprint = wrap?.__catSprint;
    const walk   = wrap?.__catWalk;
    gsapRef.current?.kill();
    stateRef.current = "poke";
    say(POKE_MSGS[Math.floor(Math.random() * POKE_MSGS.length)], 2000);

    setTimeout(() => {
      if (!sprint || !walk) { pokeQueue.current = false; return; }
      const w      = wrapRef.current?.getBoundingClientRect().width ?? 800;
      const runDir = xRef.current > w / 2 ? -1 : 1;
      dirRef.current = (runDir * -1) as 1 | -1;
      const target = dirRef.current === 1 ? w - CW_PX - MARGIN : MARGIN;
      sprint(target, () => {
        stateRef.current = "idle-sit";
        setTimeout(() => {
          stateRef.current = "walk";
          walk();
          pokeQueue.current = false;
        }, 1200);
      });
    }, 350);
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="hidden lg:block"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: CH_PX, pointerEvents: "none", overflow: "visible" }}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", bottom: 0, left: 0, width: CW_PX, pointerEvents: "all", cursor: "pointer", userSelect: "none" }}
        onClick={handlePoke}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
      >
        {tip && (
          <div style={{
            position: "absolute", bottom: CH_PX + 4, left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-muted)",
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            Glitch
          </div>
        )}

        {bubble && (
          <div style={{
            position: "absolute", bottom: CH_PX + 10, left: "50%", transform: "translateX(-50%)",
            background: "rgba(245,230,204,0.92)",
            border: "1px solid rgba(217,139,60,0.6)",
            backdropFilter: "blur(8px)",
            color: "#5a2800",
            fontFamily: "var(--font-mono)", fontSize: "0.58rem",
            padding: "4px 10px", borderRadius: "6px",
            whiteSpace: "nowrap", pointerEvents: "none",
            boxShadow: "0 2px 12px rgba(217,139,60,0.3)",
            zIndex: 60,
          }}>
            {bubble}
            <span style={{
              position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
              borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
              borderTop: "5px solid rgba(217,139,60,0.6)",
            }} />
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={CW_PX}
          height={CH_PX}
          style={{ imageRendering: "pixelated", display: "block" }}
        />
      </div>
    </div>
  );
}
