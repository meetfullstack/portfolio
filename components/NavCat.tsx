"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── pixel grid — small, chunky, itch.io-style mascot sprite ────────
const P     = 4;    // CSS px per "pixel" — bigger chunks, fewer pixels
const CW    = 16;   // cat width  in pixels
const CH    = 13;   // cat height in pixels
const CW_PX = CW * P;
const CH_PX = CH * P;

const WALK_SPD   = 45;
const SPRINT_SPD = 160;
const MARGIN     = 12;

// ── orange tabby palette — matches the itch.io reference sprite ───
const C = {
  BK: "#2a1505",  // dark brown outline (not pure black)
  OR: "#E0954B",  // warm orange body
  LO: "#EFB878",  // light orange highlight
  CR: "#F5E6CC",  // cream chest/belly
  PK: "#F2A0A8",  // pink nose/mouth
  DK: "#B06A2C",  // shadow stripe tone
  SH: "#9A8278",  // ground shadow (muted mauve-grey)
};

// ── draw helpers ─────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x * P, y * P, w * P, h * P);
}

// ── head — small bump on top of the torso (right side, facing right) ──
// Head zone: x=10..14 (5 wide), y=1..5 — single eye dot, side-profile.
function drawHead(ctx: Ctx) {
  const { BK, OR, CR, PK } = C;

  // Ears — two tiny triangular nubs
  fill(ctx, 10, 0, 1, 1, BK);
  fill(ctx, 13, 0, 1, 1, BK);

  // Head block — smaller than the torso
  fill(ctx, 10, 1, 5, 5, BK);    // outline
  fill(ctx, 11, 2, 3, 3, OR);    // orange fill

  // Cream muzzle patch
  fill(ctx, 12, 3, 2, 2, CR);

  // Single eye dot (side profile — only one eye visible)
  fill(ctx, 11, 2, 1, 1, BK);

  // Nose
  fill(ctx, 13, 3, 1, 1, PK);
}

// ── torso — low, simple rounded block ──────────────────────────────
function drawTorso(ctx: Ctx) {
  const { BK, OR, CR } = C;
  fill(ctx, 2, 5, 9, 4, BK);     // outline
  fill(ctx, 3, 6, 7, 2, OR);     // orange fill
  fill(ctx, 4, 7, 5, 1, CR);     // cream belly strip
}

// ── ground shadow — flat ellipse under the feet ─────────────────────
function drawShadow(ctx: Ctx) {
  fill(ctx, 3, 11, 9, 1, C.SH);
}

// ── walk ──────────────────────────────────────────────────────────
function drawWalk(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  drawShadow(ctx);

  // Tail — thin upright shaft with a small curl-back cap at the tip
  fill(ctx, 1, 2, 1, 3, C.BK); fill(ctx, 1, 3, 1, 2, C.OR);
  fill(ctx, 0, 1, 2, 1, C.BK); fill(ctx, 1, 1, 1, 1, C.OR);

  drawTorso(ctx);
  drawHead(ctx);

  // Legs — small stubs, alternate per frame
  if (frame === 0) {
    fill(ctx, 3, 9, 1, 2, C.BK); fill(ctx, 3, 9, 1, 1, C.OR);
    fill(ctx, 8, 9, 1, 2, C.BK); fill(ctx, 8, 9, 1, 1, C.OR);
  } else {
    fill(ctx, 4, 9, 1, 2, C.BK); fill(ctx, 4, 9, 1, 1, C.OR);
    fill(ctx, 7, 9, 1, 2, C.BK); fill(ctx, 7, 9, 1, 1, C.OR);
  }

  if (dir === -1) ctx.restore();
}

// ── sprint ────────────────────────────────────────────────────────
function drawSprint(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  drawShadow(ctx);

  // Tail streams flat behind
  fill(ctx, 0, 5, 2, 1, C.BK); fill(ctx, 0, 6, 1, 1, C.OR);

  drawTorso(ctx);
  drawHead(ctx);

  // Gallop — legs stretched further apart
  if (frame === 0) {
    fill(ctx, 2, 9, 1, 2, C.BK); fill(ctx, 2, 9, 1, 1, C.OR);
    fill(ctx, 9, 9, 1, 2, C.BK); fill(ctx, 9, 9, 1, 1, C.OR);
  } else {
    fill(ctx, 5, 9, 1, 2, C.BK); fill(ctx, 5, 9, 1, 1, C.OR);
    fill(ctx, 6, 9, 1, 2, C.BK); fill(ctx, 6, 9, 1, 1, C.OR);
  }

  if (dir === -1) ctx.restore();
}

// ── idle sit ──────────────────────────────────────────────────────
function drawSit(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);

  fill(ctx, 3, 11, 9, 1, C.SH);

  // Tail drops from the rear and curls forward along the ground
  fill(ctx, 0, 7, 1, 3, C.BK); fill(ctx, 0, 8, 1, 1, C.OR);
  fill(ctx, 0, 9, 3, 1, C.BK); fill(ctx, 1, 9, 1, 1, C.OR);

  // Taller, puffier sitting torso
  fill(ctx, 2, 4, 9, 5, C.BK);
  fill(ctx, 3, 5, 7, 3, C.OR);
  fill(ctx, 4, 6, 5, 1, C.CR);

  // Front paws together
  fill(ctx, 3, 9, 2, 1, C.BK); fill(ctx, 3, 9, 2, 1, C.OR);
  fill(ctx, 7, 9, 2, 1, C.BK); fill(ctx, 7, 9, 2, 1, C.OR);

  drawHead(ctx);
}

// ── idle sleep ────────────────────────────────────────────────────
function drawSleep(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);

  fill(ctx, 2, 11, 10, 1, C.SH);

  // Curled low blob
  fill(ctx, 2, 6, 11, 5, C.BK);
  fill(ctx, 3, 7, 9, 3, C.OR);
  fill(ctx, 4, 8, 6, 2, C.CR);

  // Curled tail tip tucked beside the body
  fill(ctx, 0, 7, 2, 2, C.BK); fill(ctx, 1, 8, 1, 1, C.OR);

  // Tiny ear bumps
  fill(ctx, 5, 6, 1, 1, C.BK);
  fill(ctx, 8, 6, 1, 1, C.BK);

  // Closed eye (dash)
  fill(ctx, 6, 8, 2, 1, C.BK);

  // Sleeping nose
  fill(ctx, 9, 8, 1, 1, C.PK);

  // Z z
  fill(ctx, 12, 3, 1, 1, C.OR);
  fill(ctx, 13, 2, 1, 1, C.LO);
}

// ── idle lick ────────────────────────────────────────────────────
function drawLick(ctx: Ctx, frame: number) {
  drawSit(ctx);
  if (frame === 0) {
    fill(ctx, 2, 7, 1, 2, C.BK); fill(ctx, 2, 7, 1, 1, C.OR);
  } else {
    fill(ctx, 2, 5, 1, 3, C.BK); fill(ctx, 2, 5, 1, 2, C.OR);
  }
}

// ── bump (hits wall) ─────────────────────────────────────────────
function drawBump(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  drawShadow(ctx);
  fill(ctx, 1, 2, 1, 3, C.BK); fill(ctx, 1, 3, 1, 2, C.OR);
  fill(ctx, 0, 1, 2, 1, C.BK); fill(ctx, 1, 1, 1, 1, C.OR);
  drawTorso(ctx);
  drawHead(ctx);
  fill(ctx, 3, 9, 1, 2, C.BK); fill(ctx, 3, 9, 1, 1, C.OR);
  fill(ctx, 8, 9, 1, 2, C.BK); fill(ctx, 8, 9, 1, 1, C.OR);

  // ? mark above head
  fill(ctx, 13, 0, 1, 1, C.LO);
  fill(ctx, 14, 0, 1, 1, C.LO);

  if (dir === -1) ctx.restore();
}

// ── poke (jump up) ────────────────────────────────────────────────
function drawPoke(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  ctx.save();
  ctx.translate(0, -P * 2);
  if (dir === -1) { ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  drawShadow(ctx);
  fill(ctx, 1, 2, 1, 3, C.BK); fill(ctx, 1, 3, 1, 2, C.OR);
  drawTorso(ctx);
  drawHead(ctx);
  // Legs tucked
  fill(ctx, 4, 9, 1, 1, C.BK); fill(ctx, 4, 9, 1, 1, C.OR);
  fill(ctx, 7, 9, 1, 1, C.BK); fill(ctx, 7, 9, 1, 1, C.OR);
  // !! above
  fill(ctx, 10, 0, 1, 2, C.LO);
  fill(ctx, 12, 0, 1, 2, C.LO);

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

  drawShadow(ctx);
  fill(ctx, 1, 2, 1, 3, C.BK); fill(ctx, 1, 3, 1, 2, C.OR);
  drawTorso(ctx);
  drawHead(ctx);
  fill(ctx, 2, 9, 1, 2, C.BK); fill(ctx, 2, 9, 1, 1, C.OR);
  fill(ctx, 9, 9, 1, 2, C.BK); fill(ctx, 9, 9, 1, 1, C.OR);

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
