"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── pixel grid — wider canvas for realistic proportions ────────────
const P     = 3;    // CSS px per "pixel"
const CW    = 22;   // cat width  in pixels
const CH    = 16;   // cat height in pixels
const CW_PX = CW * P;
const CH_PX = CH * P;

const WALK_SPD   = 45;
const SPRINT_SPD = 160;
const MARGIN     = 12;

// ── orange tabby palette ────────────────────────────────────────
const C = {
  BK: "#1a0a00",  // thick dark outline
  OR: "#D98B3C",  // warm orange body
  LO: "#EFB060",  // light orange (highlight/ears)
  CR: "#F5E6CC",  // cream face & belly
  PK: "#F4A0A0",  // pink (inner ear, nose)
  DK: "#A86018",  // dark stripe / shadow
  WH: "#FFFFFF",  // eye shine
};

// ── draw helpers ─────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x * P, y * P, w * P, h * P);
}

// ── head: smaller than body, drawn at the front (right side) ──────
// Head zone: x=13..21 (8 wide), y=1..8 (7 tall) — clearly smaller than the body block.
function drawHead(ctx: Ctx) {
  const { BK, OR, LO, CR, PK, DK, WH } = C;

  // Ears — pointed, tilted outward
  fill(ctx, 14, 0, 2, 1, BK);
  fill(ctx, 14, 1, 1, 1, OR); fill(ctx, 15, 1, 1, 1, BK);
  fill(ctx, 14, 0, 1, 1, PK);

  fill(ctx, 18, 0, 2, 1, BK);
  fill(ctx, 19, 1, 1, 1, OR); fill(ctx, 18, 1, 1, 1, BK);
  fill(ctx, 19, 0, 1, 1, PK);

  // Head block — rounder, smaller than torso
  fill(ctx, 13, 1, 8, 6, BK);     // outline
  fill(ctx, 14, 2, 6, 4, OR);     // orange fill
  fill(ctx, 13, 7, 8, 1, BK);     // chin outline row
  fill(ctx, 14, 7, 6, 1, OR);

  // Cream muzzle patch — lower/narrower like a real face
  fill(ctx, 15, 3, 4, 4, CR);
  fill(ctx, 14, 2, 6, 1, OR);     // forehead band stays orange

  // Cheek stripe marks
  fill(ctx, 14, 3, 1, 2, DK);
  fill(ctx, 19, 3, 1, 2, DK);
  // Light highlight across forehead
  fill(ctx, 15, 2, 4, 1, LO);

  // Eyes — angled, smaller, with shine
  fill(ctx, 15, 4, 2, 2, BK);
  fill(ctx, 16, 4, 1, 1, WH);
  fill(ctx, 18, 4, 2, 2, BK);
  fill(ctx, 19, 4, 1, 1, WH);

  // Nose
  fill(ctx, 17, 6, 1, 1, PK);

  // Mouth
  fill(ctx, 16, 7, 1, 1, BK);
  fill(ctx, 18, 7, 1, 1, BK);
}

// ── walk ──────────────────────────────────────────────────────────
function drawWalk(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  // Tail — long, curved, tapering at the tip
  fill(ctx, 0,  7, 1, 1, C.BK);
  fill(ctx, 0,  8, 2, 3, C.BK);
  fill(ctx, 1,  9, 1, 2, C.OR);
  fill(ctx, 1, 11, 2, 1, C.BK);
  fill(ctx, 2, 11, 1, 1, C.OR);

  // Body — elongated, tapered torso (wider than tall, low profile)
  fill(ctx, 2, 8, 13, 5, C.BK);
  fill(ctx, 3, 9, 11, 3, C.OR);
  fill(ctx, 5, 9,  7, 3, C.CR);
  fill(ctx, 4, 9, 1, 3, C.DK);
  fill(ctx, 11,9, 1, 3, C.DK);

  drawHead(ctx);

  // Legs — slimmer, tapered, frame 0 = neutral, frame 1 = stride
  if (frame === 0) {
    fill(ctx,  3, 13, 2, 3, C.BK); fill(ctx,  3, 13, 2, 2, C.OR); fill(ctx,  3, 15, 2, 1, C.CR);
    fill(ctx,  6, 13, 2, 3, C.BK); fill(ctx,  6, 13, 2, 2, C.OR); fill(ctx,  6, 15, 2, 1, C.CR);
    fill(ctx,  9, 13, 2, 3, C.BK); fill(ctx,  9, 13, 2, 2, C.OR); fill(ctx,  9, 15, 2, 1, C.CR);
    fill(ctx, 11, 13, 2, 3, C.BK); fill(ctx, 11, 13, 2, 2, C.OR); fill(ctx, 11, 15, 2, 1, C.CR);
  } else {
    fill(ctx,  2, 12, 2, 2, C.BK); fill(ctx,  2, 12, 2, 1, C.OR); fill(ctx,  2, 13, 2, 1, C.CR);
    fill(ctx,  6, 13, 2, 3, C.BK); fill(ctx,  6, 13, 2, 2, C.OR); fill(ctx,  5, 15, 2, 1, C.CR);
    fill(ctx,  9, 12, 2, 2, C.BK); fill(ctx,  9, 12, 2, 1, C.OR); fill(ctx,  9, 13, 2, 1, C.CR);
    fill(ctx, 12, 13, 2, 3, C.BK); fill(ctx, 12, 13, 2, 2, C.OR); fill(ctx, 11, 15, 2, 1, C.CR);
  }

  if (dir === -1) ctx.restore();
}

// ── sprint ────────────────────────────────────────────────────────
function drawSprint(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  // Tail streams back, low and stretched
  fill(ctx, 0, 9, 1, 1, C.BK);
  fill(ctx, 0,10, 2, 2, C.OR);
  fill(ctx, 2, 8, 13, 5, C.BK);
  fill(ctx, 3, 9, 11, 3, C.OR);
  fill(ctx, 5, 9,  7, 3, C.CR);
  fill(ctx, 4, 9, 1, 3, C.DK);
  fill(ctx, 11,9, 1, 3, C.DK);

  drawHead(ctx);

  // Gallop — legs fully extended
  if (frame === 0) {
    fill(ctx,  1, 12, 2, 2, C.BK); fill(ctx,  1, 12, 2, 1, C.OR); fill(ctx,  1, 13, 2, 1, C.CR);
    fill(ctx,  5, 13, 2, 2, C.BK); fill(ctx,  5, 13, 2, 1, C.OR); fill(ctx,  4, 14, 2, 1, C.CR);
    fill(ctx,  9, 12, 2, 2, C.BK); fill(ctx,  9, 12, 2, 1, C.OR); fill(ctx, 10, 13, 2, 1, C.CR);
    fill(ctx, 12, 13, 2, 2, C.BK); fill(ctx, 12, 13, 2, 1, C.OR); fill(ctx, 11, 14, 2, 1, C.CR);
  } else {
    fill(ctx,  3, 13, 2, 2, C.BK); fill(ctx,  3, 13, 2, 1, C.OR); fill(ctx,  4, 14, 2, 1, C.CR);
    fill(ctx,  6, 12, 2, 2, C.BK); fill(ctx,  6, 12, 2, 1, C.OR); fill(ctx,  5, 13, 2, 1, C.CR);
    fill(ctx,  8, 13, 2, 2, C.BK); fill(ctx,  8, 13, 2, 1, C.OR); fill(ctx,  9, 14, 2, 1, C.CR);
    fill(ctx, 11, 12, 2, 2, C.BK); fill(ctx, 11, 12, 2, 1, C.OR); fill(ctx, 10, 13, 2, 1, C.CR);
  }

  if (dir === -1) ctx.restore();
}

// ── idle sit ──────────────────────────────────────────────────────
function drawSit(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Tail wraps around to front-left
  fill(ctx, 0, 11, 1, 3, C.BK);
  fill(ctx, 0, 12, 1, 2, C.OR);
  fill(ctx, 1, 14, 3, 1, C.BK);
  fill(ctx, 1, 13, 3, 1, C.OR);
  // Puffier sitting torso — taller, rounder
  fill(ctx, 2, 7, 13, 7, C.BK);
  fill(ctx, 3, 8, 11, 5, C.OR);
  fill(ctx, 5, 8,  7, 5, C.CR);
  fill(ctx, 4, 8, 1, 5, C.DK);
  fill(ctx, 11,8, 1, 5, C.DK);
  // Paws sitting flat
  fill(ctx, 3, 13, 3, 1, C.BK); fill(ctx, 3, 13, 3, 1, C.CR);
  fill(ctx, 8, 13, 3, 1, C.BK); fill(ctx, 8, 13, 3, 1, C.CR);
  drawHead(ctx);
}

// ── idle sleep ────────────────────────────────────────────────────
function drawSleep(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Curled blob, low and wide
  fill(ctx, 2, 6, 15, 8, C.BK);
  fill(ctx, 3, 7, 13, 6, C.OR);
  fill(ctx, 5, 8,  8, 4, C.CR);
  fill(ctx, 4, 7, 1, 6, C.DK);
  fill(ctx, 12,7, 1, 6, C.DK);
  // Curled tail tip
  fill(ctx, 1, 9, 1, 3, C.BK);
  fill(ctx, 1, 10,1, 2, C.OR);
  // Tiny ear bumps
  fill(ctx, 6, 6, 2, 1, C.OR); fill(ctx, 6, 6, 1, 1, C.PK);
  fill(ctx, 10,6, 2, 1, C.OR); fill(ctx, 10,6, 1, 1, C.PK);
  // Closed eyes (dashes)
  fill(ctx, 7, 8, 2, 1, C.BK);
  fill(ctx, 11,8, 2, 1, C.BK);
  // Sleeping nose
  fill(ctx, 9, 9, 1, 1, C.PK);
  // Z z
  fill(ctx, 16, 4, 1, 1, C.OR);
  fill(ctx, 17, 3, 1, 1, C.LO);
  fill(ctx, 18, 2, 1, 1, C.PK);
}

// ── idle lick ────────────────────────────────────────────────────
function drawLick(ctx: Ctx, frame: number) {
  drawSit(ctx);
  if (frame === 0) {
    fill(ctx, 3, 10, 2, 3, C.BK);
    fill(ctx, 3, 10, 2, 2, C.OR);
    fill(ctx, 3, 12, 2, 1, C.CR);
  } else {
    fill(ctx, 3, 7, 2, 4, C.BK);
    fill(ctx, 3, 7, 2, 3, C.OR);
    fill(ctx, 2, 6, 2, 1, C.CR);
    fill(ctx, 3, 10,2, 1, C.CR);
  }
}

// ── bump (hits wall) ─────────────────────────────────────────────
function drawBump(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  fill(ctx, 0, 11, 1, 3, C.BK);
  fill(ctx, 0, 12, 1, 2, C.OR);
  fill(ctx, 2, 8, 13, 5, C.BK);
  fill(ctx, 3, 9, 11, 3, C.OR);
  fill(ctx, 5, 9,  7, 3, C.CR);
  fill(ctx, 4, 9, 1, 3, C.DK);
  fill(ctx, 11,9, 1, 3, C.DK);
  drawHead(ctx);
  fill(ctx,  3, 13, 2, 3, C.BK); fill(ctx,  3, 13, 2, 2, C.OR); fill(ctx,  3, 15, 2, 1, C.CR);
  fill(ctx,  6, 13, 2, 3, C.BK); fill(ctx,  6, 13, 2, 2, C.OR); fill(ctx,  6, 15, 2, 1, C.CR);
  fill(ctx,  9, 13, 2, 3, C.BK); fill(ctx,  9, 13, 2, 2, C.OR); fill(ctx,  9, 15, 2, 1, C.CR);
  fill(ctx, 11, 13, 2, 3, C.BK); fill(ctx, 11, 13, 2, 2, C.OR); fill(ctx, 11, 15, 2, 1, C.CR);
  // ? mark above head
  fill(ctx, 19, 0, 1, 1, C.LO);
  fill(ctx, 19, 1, 1, 2, C.LO);
  fill(ctx, 20, 0, 1, 1, C.LO);
  fill(ctx, 20, 2, 1, 1, C.LO);

  if (dir === -1) ctx.restore();
}

// ── poke (jump up) ────────────────────────────────────────────────
function drawPoke(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  ctx.save();
  ctx.translate(0, -P * 2);
  if (dir === -1) { ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  fill(ctx, 0, 10, 1, 3, C.BK);
  fill(ctx, 0, 11, 1, 2, C.OR);
  fill(ctx, 2, 8, 13, 5, C.BK);
  fill(ctx, 3, 9, 11, 3, C.OR);
  fill(ctx, 5, 9,  7, 3, C.CR);
  drawHead(ctx);
  fill(ctx,  3, 13, 2, 2, C.BK); fill(ctx,  3, 13, 2, 1, C.OR); fill(ctx,  3, 14, 2, 1, C.CR);
  fill(ctx,  7, 13, 2, 2, C.BK); fill(ctx,  7, 13, 2, 1, C.OR); fill(ctx,  7, 14, 2, 1, C.CR);
  fill(ctx,  9, 13, 2, 2, C.BK); fill(ctx,  9, 13, 2, 1, C.OR); fill(ctx,  9, 14, 2, 1, C.CR);
  fill(ctx, 11, 13, 2, 2, C.BK); fill(ctx, 11, 13, 2, 1, C.OR); fill(ctx, 11, 14, 2, 1, C.CR);
  // !! above
  fill(ctx, 9, 0, 1, 2, C.LO);
  fill(ctx, 11,0, 1, 2, C.LO);

  ctx.restore();
}

// ── hold (scroll wobble) ──────────────────────────────────────────
function drawHold(ctx: Ctx, frame: number) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  const angle = frame === 0 ? -0.12 : 0.12;
  ctx.save();
  ctx.translate(CW_PX / 2, CH_PX / 2);
  ctx.rotate(angle);
  ctx.translate(-CW_PX / 2, -CH_PX / 2);

  fill(ctx, 0, 10, 1, 3, C.BK);
  fill(ctx, 0, 11, 1, 2, C.OR);
  fill(ctx, 2, 8, 13, 5, C.BK);
  fill(ctx, 3, 9, 11, 3, C.OR);
  fill(ctx, 5, 9,  7, 3, C.CR);
  fill(ctx, 4, 9, 1, 3, C.DK);
  fill(ctx, 11,9, 1, 3, C.DK);
  drawHead(ctx);
  fill(ctx,  1, 13, 2, 3, C.BK); fill(ctx,  1, 13, 2, 2, C.OR); fill(ctx,  1, 15, 2, 1, C.CR);
  fill(ctx,  5, 13, 2, 3, C.BK); fill(ctx,  5, 13, 2, 2, C.OR); fill(ctx,  5, 15, 2, 1, C.CR);
  fill(ctx,  9, 13, 2, 3, C.BK); fill(ctx,  9, 13, 2, 2, C.OR); fill(ctx,  9, 15, 2, 1, C.CR);
  fill(ctx, 12, 13, 2, 3, C.BK); fill(ctx, 12, 13, 2, 2, C.OR); fill(ctx, 12, 15, 2, 1, C.CR);

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

    let lastTime = 0;

    function loop(t: number) {
      const state    = stateRef.current;
      const dir      = dirRef.current;
      const interval = state === "sprint" ? 90 : state === "idle-sleep" ? 600 : 200;

      if (t - lastTime > interval) {
        lastTime = t;
        frameRef.current = (frameRef.current + 1) % 2;
        const f = frameRef.current;

        switch (state) {
          case "walk":       drawWalk(ctx, f, dir);   break;
          case "sprint":     drawSprint(ctx, f, dir); break;
          case "idle-sit":   drawSit(ctx);             break;
          case "idle-sleep": drawSleep(ctx);            break;
          case "idle-lick":  drawLick(ctx, f);         break;
          case "bump":       drawBump(ctx, dir);        break;
          case "poke":       drawPoke(ctx, dir);        break;
          case "hold":       drawHold(ctx, f);          break;
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
