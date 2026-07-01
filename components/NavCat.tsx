"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── sprite sheet — Glitch's own original artwork ────────────────────
// public/glitch-sprite.png: 18 rows of frames, 331x309 per cell.
const SHEET_SRC = "/glitch-sprite.png";
const CELL_W    = 331;
const CELL_H    = 309;
const SCALE     = 0.22;         // shrink down for the navbar
const CW_PX     = Math.round(CELL_W * SCALE);
const CH_PX     = Math.round(CELL_H * SCALE);

const WALK_SPD    = 45;
const SPRINT_SPD  = 160;
const ZOOMIES_SPD = 260;
const MARGIN      = 12;
const NUZZLE_COOLDOWN_MS = 8000;

const ACCENT = "#EFB878";

// ── pose row map (row index, frame count) ───────────────────────────
const POSE = {
  walk:       { row: 0,  count: 4 },
  sprint:     { row: 1,  count: 4 },
  sitBlink:   { row: 2,  count: 3 },
  sniffLick:  { row: 3,  count: 4 },
  sleep:      { row: 4,  count: 4 },
  alert:      { row: 5,  count: 2 },
  pounce:     { row: 6,  count: 4 },
  wobble:     { row: 7,  count: 3 },
  zoomies:    { row: 8,  count: 4 },
  midPause:   { row: 9,  count: 1 },
  stretch:    { row: 10, count: 3 },
  tailFlick:  { row: 11, count: 2 },
  playBall:   { row: 12, count: 4 },
  scratch:    { row: 13, count: 2 },
  yawn:       { row: 14, count: 2 },
  tailChase:  { row: 15, count: 4 },
  nuzzle:     { row: 16, count: 2 },
  curious:    { row: 17, count: 2 },
} as const;

type PoseName = keyof typeof POSE;

// ── draw helpers ─────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;

function drawFrame(ctx: Ctx, img: HTMLImageElement, pose: PoseName, frame: number, dir: 1 | -1) {
  const { row, count } = POSE[pose];
  const col = frame % count;

  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }
  ctx.drawImage(
    img,
    col * CELL_W, row * CELL_H, CELL_W, CELL_H,
    0, 0, CW_PX, CH_PX,
  );
  if (dir === -1) ctx.restore();
}

function drawMark(ctx: Ctx, glyph: "?" | "!!") {
  ctx.fillStyle = ACCENT;
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  ctx.fillText(glyph, CW_PX * 0.82, 12);
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

const POKE_MSGS   = ["hey!!", "ouch!", "( >ᴗ<)", "uwu", "hiss!", "mrow?", "!!"];
const ZOOM_MSGS   = ["wheee!!", "zoom zoom", "catch me!", "vroom", "can't stop!"];
const NUZZLE_MSGS = ["hii <3", "pspsps back", "*nuzzle*", "hru?", "missed u"];

// ── behaviour states ────────────────────────────────────────────
type State =
  | "walk" | "sprint" | "bump" | "poke" | "hold" | "zoomies" | "nuzzle"
  | "idle-sit" | "idle-lick" | "idle-sleep" | "idle-stretch"
  | "idle-scratch" | "idle-yawn" | "idle-tailchase" | "idle-curious" | "idle-ball";

// weighted idle pool — common cozy poses appear more often than playful ones
const IDLE_POOL: { state: State; minDur: number; maxDur: number }[] = [
  { state: "idle-sit",       minDur: 1800, maxDur: 3500 },
  { state: "idle-sit",       minDur: 1800, maxDur: 3500 },
  { state: "idle-lick",      minDur: 1800, maxDur: 3200 },
  { state: "idle-sleep",     minDur: 2500, maxDur: 5000 },
  { state: "idle-stretch",   minDur: 1400, maxDur: 2000 },
  { state: "idle-scratch",   minDur: 1200, maxDur: 1800 },
  { state: "idle-yawn",      minDur: 1400, maxDur: 2000 },
  { state: "idle-tailchase", minDur: 1600, maxDur: 2400 },
  { state: "idle-curious",   minDur: 1200, maxDur: 2000 },
  { state: "idle-ball",      minDur: 2200, maxDur: 3800 },
];

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
  const lastNuzzle  = useRef(0);

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

      const state = stateRef.current;
      const dir   = dirRef.current;
      const interval =
        state === "sprint" || state === "zoomies" ? 85 :
        state === "idle-tailchase" ? 120 :
        state === "idle-scratch"   ? 140 :
        state === "idle-sleep"     ? 500 :
        180;

      if (t - lastTime > interval) {
        lastTime = t;
        frameRef.current += 1;
        const f = frameRef.current;

        switch (state) {
          case "walk":            drawFrame(ctx, img, "walk", f, dir);        break;
          case "sprint":           drawFrame(ctx, img, "sprint", f, dir);      break;
          case "zoomies":          drawFrame(ctx, img, "zoomies", f, dir);     break;
          case "idle-sit":         drawFrame(ctx, img, "sitBlink", f % 6 === 0 ? 1 : 0, 1); break;
          case "idle-sleep":       drawFrame(ctx, img, "sleep", f, 1);         break;
          case "idle-lick":        drawFrame(ctx, img, "sniffLick", f, 1);     break;
          case "idle-stretch":     drawFrame(ctx, img, "stretch", f, 1);       break;
          case "idle-scratch":     drawFrame(ctx, img, "scratch", f, 1);       break;
          case "idle-yawn":        drawFrame(ctx, img, "yawn", f, 1);          break;
          case "idle-tailchase":   drawFrame(ctx, img, "tailChase", f, 1);     break;
          case "idle-curious":     drawFrame(ctx, img, "curious", f, 1);       break;
          case "idle-ball":        drawFrame(ctx, img, "playBall", f, dir);    break;
          case "nuzzle":           drawFrame(ctx, img, "nuzzle", f, 1);        break;
          case "bump":
            drawFrame(ctx, img, "alert", 1, dir);
            drawMark(ctx, "?");
            break;
          case "poke":
            drawFrame(ctx, img, "pounce", f, dir);
            drawMark(ctx, "!!");
            break;
          case "hold":              drawFrame(ctx, img, "wobble", f, 1);       break;
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
        const roll = Math.random();
        if      (roll < 0.10) doZoomies();
        else if (roll < 0.45) doIdle();
        else                  walk();
      }, 800);
    }

    function doIdle() {
      stopAll();
      const pick = IDLE_POOL[Math.floor(Math.random() * IDLE_POOL.length)];
      stateRef.current = pick.state;
      const dur = pick.minDur + Math.random() * (pick.maxDur - pick.minDur);
      idleTimer.current = setTimeout(() => { stateRef.current = "walk"; walk(); }, dur);
    }

    function doZoomies() {
      stopAll();
      const { min, max } = bounds();
      const target = min + Math.random() * (max - min);
      dirRef.current   = target > xRef.current ? 1 : -1;
      stateRef.current = "zoomies";
      say(ZOOM_MSGS[Math.floor(Math.random() * ZOOM_MSGS.length)], 1800);
      const dist = Math.abs(target - xRef.current);
      gsapRef.current = gsap.to(xRef, {
        current: target,
        duration: Math.max(0.3, dist / ZOOMIES_SPD),
        ease: "power1.inOut",
        onUpdate: updatePos,
        onComplete: () => { stateRef.current = "walk"; walk(); },
      });
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

    (wrap as HTMLDivElement & { __catSprint?: typeof sprintTo; __catWalk?: typeof walk; __catNuzzle?: typeof doIdle })
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

  // ── Gentle hover → nuzzle reaction ─────────────────────────────
  function handleHoverEnter() {
    setTip(true);
    const now = Date.now();
    const idleStates: State[] = [
      "idle-sit", "idle-lick", "idle-sleep", "idle-stretch",
      "idle-scratch", "idle-yawn", "idle-tailchase", "idle-curious", "idle-ball",
    ];
    if (
      now - lastNuzzle.current > NUZZLE_COOLDOWN_MS &&
      idleStates.includes(stateRef.current) &&
      !pokeQueue.current
    ) {
      lastNuzzle.current = now;
      gsapRef.current?.kill();
      if (idleTimer.current) clearTimeout(idleTimer.current);
      stateRef.current = "nuzzle";
      say(NUZZLE_MSGS[Math.floor(Math.random() * NUZZLE_MSGS.length)], 2000);
      idleTimer.current = setTimeout(() => { stateRef.current = "idle-sit"; }, 1400);
    }
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
        onMouseEnter={handleHoverEnter}
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
