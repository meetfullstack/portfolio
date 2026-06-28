"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── pixel grid ────────────────────────────────────────────────────
const P     = 3;    // CSS px per "pixel"
const CW    = 18;   // cat width  in pixels
const CH    = 15;   // cat height in pixels
const CW_PX = CW * P;
const CH_PX = CH * P;

const WALK_SPD   = 45;
const SPRINT_SPD = 160;
const MARGIN     = 12;

// ── orange tabby palette (matches reference image) ────────────────
const C = {
  BK: "#1a0a00",  // thick dark outline
  OR: "#D98B3C",  // warm orange body
  LO: "#EFB060",  // light orange (highlight/ears)
  CR: "#F5E6CC",  // cream face & belly
  PK: "#F4A0A0",  // pink (inner ear, nose)
  DK: "#A86018",  // dark stripe / shadow
  WH: "#FFFFFF",  // eye shine
  GR: "#C8B8A0",  // grey paw tint
};

// ── draw helpers ─────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x * P, y * P, w * P, h * P);
}

// ── base: head + ears, drawn on top of whatever body pose ─────────
// Cat faces RIGHT.  x=9..17 = head zone, x=0..13 = body zone.
function drawBase(ctx: Ctx) {
  const { BK, OR, LO, CR, PK, DK, WH } = C;

  // Ears — two small pointed shapes above head
  // left ear
  fill(ctx, 10, 0, 2, 1, BK);
  fill(ctx, 10, 1, 1, 1, OR);  fill(ctx, 11, 1, 1, 1, BK);
  fill(ctx, 10, 0, 1, 1, PK);
  // right ear
  fill(ctx, 13, 0, 2, 1, BK);
  fill(ctx, 14, 1, 1, 1, OR);  fill(ctx, 13, 1, 1, 1, BK);
  fill(ctx, 14, 0, 1, 1, PK);

  // Head block (9w × 7h at x=9..17, y=1..7)
  fill(ctx,  9, 1, 9, 7, BK);    // outline
  fill(ctx, 10, 2, 7, 5, OR);    // orange fill
  // cream face center
  fill(ctx, 11, 2, 5, 5, CR);
  // top row of face stays orange (fur line)
  fill(ctx, 11, 2, 5, 1, OR);
  // orange stripe marks on cheeks
  fill(ctx, 10, 3, 1, 2, DK);
  fill(ctx, 16, 3, 1, 2, DK);
  // light orange highlight across top of head
  fill(ctx, 10, 2, 7, 1, LO);

  // Eyes — big black 2×2 with white shine dot
  fill(ctx, 11, 3, 2, 2, BK);   // left eye
  fill(ctx, 12, 3, 1, 1, WH);   // left shine
  fill(ctx, 14, 3, 2, 2, BK);   // right eye
  fill(ctx, 15, 3, 1, 1, WH);   // right shine

  // Nose — pink dot
  fill(ctx, 13, 5, 1, 1, PK);

  // Mouth — tiny v
  fill(ctx, 12, 6, 1, 1, BK);
  fill(ctx, 14, 6, 1, 1, BK);
}

// ── walk ──────────────────────────────────────────────────────────
function drawWalk(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  // Tail (curls up on left when facing right)
  fill(ctx, 0,  9, 1, 3, C.BK);
  fill(ctx, 0, 10, 1, 2, C.OR);
  fill(ctx, 1, 12, 2, 1, C.BK);
  fill(ctx, 1, 11, 2, 1, C.OR);

  // Body outline
  fill(ctx, 2, 7, 13, 5, C.BK);
  // Orange sides
  fill(ctx, 3, 8, 11, 3, C.OR);
  // Cream belly strip
  fill(ctx, 5, 8,  7, 3, C.CR);
  // Tabby stripes on body
  fill(ctx, 4, 8, 1, 3, C.DK);
  fill(ctx, 11,8, 1, 3, C.DK);

  drawBase(ctx);

  // Legs — frame 0 = neutral, frame 1 = stride
  if (frame === 0) {
    fill(ctx,  3, 12, 2, 3, C.BK); fill(ctx,  3, 12, 2, 2, C.OR); fill(ctx,  3, 14, 2, 1, C.CR);
    fill(ctx,  6, 12, 2, 3, C.BK); fill(ctx,  6, 12, 2, 2, C.OR); fill(ctx,  6, 14, 2, 1, C.CR);
    fill(ctx,  9, 12, 2, 3, C.BK); fill(ctx,  9, 12, 2, 2, C.OR); fill(ctx,  9, 14, 2, 1, C.CR);
    fill(ctx, 11, 12, 2, 3, C.BK); fill(ctx, 11, 12, 2, 2, C.OR); fill(ctx, 11, 14, 2, 1, C.CR);
  } else {
    // front pair forward, back pair back
    fill(ctx,  2, 11, 2, 2, C.BK); fill(ctx,  2, 11, 2, 1, C.OR); fill(ctx,  2, 12, 2, 1, C.CR);
    fill(ctx,  6, 12, 2, 3, C.BK); fill(ctx,  6, 12, 2, 2, C.OR); fill(ctx,  5, 14, 2, 1, C.CR);
    fill(ctx,  9, 11, 2, 2, C.BK); fill(ctx,  9, 11, 2, 1, C.OR); fill(ctx,  9, 12, 2, 1, C.CR);
    fill(ctx, 12, 12, 2, 3, C.BK); fill(ctx, 12, 12, 2, 2, C.OR); fill(ctx, 11, 14, 2, 1, C.CR);
  }

  if (dir === -1) ctx.restore();
}

// ── sprint ────────────────────────────────────────────────────────
function drawSprint(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  // Tail streams back (horizontal)
  fill(ctx, 0, 8, 1, 1, C.BK);
  fill(ctx, 0, 9, 2, 2, C.OR);
  fill(ctx, 2, 7, 13, 5, C.BK);
  fill(ctx, 3, 8, 11, 3, C.OR);
  fill(ctx, 5, 8,  7, 3, C.CR);
  fill(ctx, 4, 8, 1, 3, C.DK);
  fill(ctx, 11,8, 1, 3, C.DK);

  drawBase(ctx);

  // Gallop — legs fully extended
  if (frame === 0) {
    fill(ctx,  1, 11, 2, 2, C.BK); fill(ctx,  1, 11, 2, 1, C.OR); fill(ctx,  1, 12, 2, 1, C.CR);
    fill(ctx,  5, 12, 2, 2, C.BK); fill(ctx,  5, 12, 2, 1, C.OR); fill(ctx,  4, 13, 2, 1, C.CR);
    fill(ctx,  9, 11, 2, 2, C.BK); fill(ctx,  9, 11, 2, 1, C.OR); fill(ctx, 10, 12, 2, 1, C.CR);
    fill(ctx, 12, 12, 2, 2, C.BK); fill(ctx, 12, 12, 2, 1, C.OR); fill(ctx, 11, 13, 2, 1, C.CR);
  } else {
    fill(ctx,  3, 12, 2, 2, C.BK); fill(ctx,  3, 12, 2, 1, C.OR); fill(ctx,  4, 13, 2, 1, C.CR);
    fill(ctx,  6, 11, 2, 2, C.BK); fill(ctx,  6, 11, 2, 1, C.OR); fill(ctx,  5, 12, 2, 1, C.CR);
    fill(ctx,  8, 12, 2, 2, C.BK); fill(ctx,  8, 12, 2, 1, C.OR); fill(ctx,  9, 13, 2, 1, C.CR);
    fill(ctx, 11, 11, 2, 2, C.BK); fill(ctx, 11, 11, 2, 1, C.OR); fill(ctx, 10, 12, 2, 1, C.CR);
  }

  if (dir === -1) ctx.restore();
}

// ── idle sit ──────────────────────────────────────────────────────
function drawSit(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Tail wraps around to front-left
  fill(ctx, 0, 10, 1, 3, C.BK);
  fill(ctx, 0, 11, 1, 2, C.OR);
  fill(ctx, 1, 13, 3, 1, C.BK);
  fill(ctx, 1, 12, 3, 1, C.OR);
  // Puffier sitting body
  fill(ctx, 2, 7, 13, 6, C.BK);
  fill(ctx, 3, 8, 11, 4, C.OR);
  fill(ctx, 5, 8,  7, 4, C.CR);
  fill(ctx, 4, 8, 1, 4, C.DK);
  fill(ctx, 11,8, 1, 4, C.DK);
  // Paws sitting flat
  fill(ctx, 3, 12, 3, 1, C.BK); fill(ctx, 3, 12, 3, 1, C.CR);
  fill(ctx, 8, 12, 3, 1, C.BK); fill(ctx, 8, 12, 3, 1, C.CR);
  drawBase(ctx);
}

// ── idle sleep ────────────────────────────────────────────────────
function drawSleep(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Curled blob
  fill(ctx, 2, 5, 14, 8, C.BK);
  fill(ctx, 3, 6, 12, 6, C.OR);
  fill(ctx, 5, 7,  7, 4, C.CR);
  fill(ctx, 4, 6, 1, 6, C.DK);
  fill(ctx, 11,6, 1, 6, C.DK);
  // Curled tail tip
  fill(ctx, 1, 8, 1, 3, C.BK);
  fill(ctx, 1, 9, 1, 2, C.OR);
  // Tiny ear bumps
  fill(ctx, 5, 5, 2, 1, C.OR); fill(ctx, 5, 5, 1, 1, C.PK);
  fill(ctx, 9, 5, 2, 1, C.OR); fill(ctx, 9, 5, 1, 1, C.PK);
  // Closed eyes (dashes)
  fill(ctx, 6, 7, 2, 1, C.BK);
  fill(ctx, 10,7, 2, 1, C.BK);
  // Sleeping nose
  fill(ctx, 8, 8, 1, 1, C.PK);
  // Z z (purple-ish for fun)
  fill(ctx, 14, 4, 1, 1, C.OR);
  fill(ctx, 15, 3, 1, 1, C.LO);
  fill(ctx, 16, 2, 1, 1, C.PK);
}

// ── idle lick ────────────────────────────────────────────────────
function drawLick(ctx: Ctx, frame: number) {
  drawSit(ctx);
  if (frame === 0) {
    // Paw raised to mid-chest
    fill(ctx, 3, 9, 2, 3, C.BK);
    fill(ctx, 3, 9, 2, 2, C.OR);
    fill(ctx, 3, 11,2, 1, C.CR);
  } else {
    // Paw raised to face (licking)
    fill(ctx, 3, 7, 2, 4, C.BK);
    fill(ctx, 3, 7, 2, 3, C.OR);
    fill(ctx, 2, 6, 2, 1, C.CR);  // paw near cheek
    fill(ctx, 3, 10,2, 1, C.CR);
  }
}

// ── bump (hits wall) ─────────────────────────────────────────────
function drawBump(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  fill(ctx, 0, 10, 1, 3, C.BK);
  fill(ctx, 0, 11, 1, 2, C.OR);
  fill(ctx, 2, 7, 13, 5, C.BK);
  fill(ctx, 3, 8, 11, 3, C.OR);
  fill(ctx, 5, 8,  7, 3, C.CR);
  fill(ctx, 4, 8, 1, 3, C.DK);
  fill(ctx, 11,8, 1, 3, C.DK);
  drawBase(ctx);
  // All four legs standing
  fill(ctx,  3, 12, 2, 3, C.BK); fill(ctx,  3, 12, 2, 2, C.OR); fill(ctx,  3, 14, 2, 1, C.CR);
  fill(ctx,  6, 12, 2, 3, C.BK); fill(ctx,  6, 12, 2, 2, C.OR); fill(ctx,  6, 14, 2, 1, C.CR);
  fill(ctx,  9, 12, 2, 3, C.BK); fill(ctx,  9, 12, 2, 2, C.OR); fill(ctx,  9, 14, 2, 1, C.CR);
  fill(ctx, 11, 12, 2, 3, C.BK); fill(ctx, 11, 12, 2, 2, C.OR); fill(ctx, 11, 14, 2, 1, C.CR);
  // ? mark above head
  fill(ctx, 16, 0, 1, 1, C.LO);
  fill(ctx, 16, 1, 1, 2, C.LO);
  fill(ctx, 17, 0, 1, 1, C.LO);
  fill(ctx, 17, 2, 1, 1, C.LO);

  if (dir === -1) ctx.restore();
}

// ── poke (jump up) ────────────────────────────────────────────────
function drawPoke(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  ctx.save();
  ctx.translate(0, -P * 2);
  if (dir === -1) { ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  fill(ctx, 0, 9, 1, 3, C.BK);
  fill(ctx, 0,10, 1, 2, C.OR);
  fill(ctx, 2, 7, 13, 5, C.BK);
  fill(ctx, 3, 8, 11, 3, C.OR);
  fill(ctx, 5, 8,  7, 3, C.CR);
  drawBase(ctx);
  // Legs tucked
  fill(ctx,  3, 12, 2, 2, C.BK); fill(ctx,  3, 12, 2, 1, C.OR); fill(ctx,  3, 13, 2, 1, C.CR);
  fill(ctx,  7, 12, 2, 2, C.BK); fill(ctx,  7, 12, 2, 1, C.OR); fill(ctx,  7, 13, 2, 1, C.CR);
  fill(ctx,  9, 12, 2, 2, C.BK); fill(ctx,  9, 12, 2, 1, C.OR); fill(ctx,  9, 13, 2, 1, C.CR);
  fill(ctx, 11, 12, 2, 2, C.BK); fill(ctx, 11, 12, 2, 1, C.OR); fill(ctx, 11, 13, 2, 1, C.CR);
  // !! above
  fill(ctx, 7, 0, 1, 2, C.LO);
  fill(ctx, 9, 0, 1, 2, C.LO);

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

  fill(ctx, 0, 9, 1, 3, C.BK);
  fill(ctx, 0,10, 1, 2, C.OR);
  fill(ctx, 2, 7, 13, 5, C.BK);
  fill(ctx, 3, 8, 11, 3, C.OR);
  fill(ctx, 5, 8,  7, 3, C.CR);
  fill(ctx, 4, 8, 1, 3, C.DK);
  fill(ctx, 11,8, 1, 3, C.DK);
  drawBase(ctx);
  // Splayed paws gripping
  fill(ctx,  1, 12, 2, 3, C.BK); fill(ctx,  1, 12, 2, 2, C.OR); fill(ctx,  1, 14, 2, 1, C.CR);
  fill(ctx,  5, 12, 2, 3, C.BK); fill(ctx,  5, 12, 2, 2, C.OR); fill(ctx,  5, 14, 2, 1, C.CR);
  fill(ctx,  9, 12, 2, 3, C.BK); fill(ctx,  9, 12, 2, 2, C.OR); fill(ctx,  9, 14, 2, 1, C.CR);
  fill(ctx, 12, 12, 2, 3, C.BK); fill(ctx, 12, 12, 2, 2, C.OR); fill(ctx, 12, 14, 2, 1, C.CR);

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
