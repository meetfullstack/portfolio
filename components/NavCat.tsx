"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── pixel grid ────────────────────────────────────────────────────
const P  = 3;        // CSS px per "pixel"
const CW = 16;       // cat width  in pixels
const CH = 14;       // cat height in pixels
const CW_PX = CW * P;
const CH_PX = CH * P;

const WALK_SPD   = 45;   // px / s
const SPRINT_SPD = 160;  // px / s
const MARGIN     = 12;   // px from nav edge

// ── palette ──────────────────────────────────────────────────────
const C = {
  body:  "#1a1a2e",
  dark:  "#0d0d1a",
  eye:   "#a855f7",
  shine: "#ddd6ff",
  nose:  "#ff9eb5",
  ear:   "#3a0d50",
};

// ── draw helpers ─────────────────────────────────────────────────
type Ctx = CanvasRenderingContext2D;

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x * P, y * P, w * P, h * P);
}

// ── sprite frames ────────────────────────────────────────────────

function drawBase(ctx: Ctx) {
  // Ears
  fill(ctx, 4, 0, 2, 1, C.body); fill(ctx, 5, 0, 1, 1, C.ear);
  fill(ctx, 9, 0, 2, 1, C.body); fill(ctx, 9, 0, 1, 1, C.ear);
  fill(ctx, 4, 1, 3, 1, C.body);
  fill(ctx, 9, 1, 3, 1, C.body);
  // Head
  fill(ctx, 3, 2, 10, 5, C.body);
  fill(ctx, 4, 7, 8,  1, C.body); // chin
  // Eyes
  fill(ctx, 5, 3, 2, 1, C.eye);  fill(ctx, 5, 3, 1, 1, C.shine);
  fill(ctx, 9, 3, 2, 1, C.eye);  fill(ctx, 9, 3, 1, 1, C.shine);
  // Nose + mouth
  fill(ctx, 7, 5, 2, 1, C.nose);
  fill(ctx, 6, 6, 1, 1, C.dark); fill(ctx, 9, 6, 1, 1, C.dark);
}

function drawWalk(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  // Tail (left side when facing right)
  fill(ctx, 0, 7, 1, 3, C.body); fill(ctx, 1, 9, 1, 1, C.body);
  // Body
  fill(ctx, 1, 7, 11, 4, C.body);
  drawBase(ctx);

  if (frame === 0) {
    fill(ctx, 2,  11, 2, 3, C.body);
    fill(ctx, 6,  11, 2, 3, C.body);
    fill(ctx, 9,  11, 2, 3, C.body);
    fill(ctx, 11, 11, 2, 3, C.body);
  } else {
    fill(ctx, 2, 11, 2, 2, C.body); fill(ctx, 3, 13, 1, 1, C.body); // front stride
    fill(ctx, 6, 12, 2, 2, C.body); fill(ctx, 5, 13, 1, 1, C.body);
    fill(ctx, 8, 11, 2, 2, C.body); fill(ctx, 9, 13, 1, 1, C.body); // back stride
    fill(ctx, 11,12, 2, 2, C.body); fill(ctx,10, 13, 1, 1, C.body);
  }

  if (dir === -1) ctx.restore();
}

function drawSprint(ctx: Ctx, frame: number, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }

  // Tail streams back
  fill(ctx, 0, 6, 1, 1, C.body); fill(ctx, 0, 7, 1, 2, C.body);
  fill(ctx, 1, 8, 1, 1, C.body);
  fill(ctx, 1, 7, 11, 4, C.body);
  drawBase(ctx);

  // Gallop legs
  if (frame === 0) {
    fill(ctx, 1,  11, 2, 2, C.body); fill(ctx, 2,  13, 2, 1, C.body); // front extended
    fill(ctx, 5,  11, 2, 2, C.body); fill(ctx, 4,  13, 1, 1, C.body);
    fill(ctx, 9,  11, 2, 2, C.body); fill(ctx, 10, 13, 2, 1, C.body); // back extended
    fill(ctx, 12, 11, 2, 2, C.body); fill(ctx, 11, 13, 1, 1, C.body);
  } else {
    fill(ctx, 3, 11, 2, 2, C.body); fill(ctx, 4, 13, 1, 1, C.body);
    fill(ctx, 6, 12, 2, 2, C.body); fill(ctx, 5, 13, 1, 1, C.body);
    fill(ctx, 8, 11, 2, 2, C.body); fill(ctx, 9, 13, 1, 1, C.body);
    fill(ctx, 10,12, 2, 2, C.body); fill(ctx, 11,13, 1, 1, C.body);
  }

  if (dir === -1) ctx.restore();
}

function drawSit(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Tail wrapped to side
  fill(ctx, 0, 9, 1, 2, C.body); fill(ctx, 1, 11, 3, 1, C.body);
  // Body (wider puff when sitting)
  fill(ctx, 1, 7, 12, 5, C.body);
  // Paws
  fill(ctx, 3, 12, 3, 1, C.body); fill(ctx, 8, 12, 3, 1, C.body);
  drawBase(ctx);
}

function drawSleep(ctx: Ctx) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Curled round blob
  fill(ctx, 2, 4, 12, 8, C.body);
  fill(ctx, 3, 3,  9, 1, C.body);
  fill(ctx, 4, 2,  7, 1, C.body);
  // Curled tail
  fill(ctx, 1, 6, 1, 3, C.body); fill(ctx, 0, 8, 1, 1, C.body);
  // Tucked head — just ears + closed eyes visible
  fill(ctx, 4, 2, 2, 1, C.body); // left ear
  fill(ctx, 9, 2, 2, 1, C.body); // right ear
  // Closed eyes (lines)
  fill(ctx, 5, 4, 2, 1, C.dark);
  fill(ctx, 9, 4, 2, 1, C.dark);
  // Z z z (small dots above)
  fill(ctx, 12, 1, 1, 1, C.eye);
  fill(ctx, 13, 0, 1, 1, C.eye);
}

function drawLick(ctx: Ctx, frame: number) {
  drawSit(ctx);
  // Raised paw to face
  if (frame === 0) {
    fill(ctx, 3, 9,  2, 2, C.body);
  } else {
    fill(ctx, 3, 8,  2, 3, C.body);
    fill(ctx, 2, 7,  2, 1, C.body); // paw near cheek
  }
}

function drawBump(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  if (dir === -1) { ctx.save(); ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }
  // Tail droops down
  fill(ctx, 0, 9, 1, 4, C.body); fill(ctx, 1, 12, 1, 1, C.body);
  fill(ctx, 1, 7, 11, 4, C.body);
  drawBase(ctx);
  // Legs standing
  fill(ctx, 2,  11, 2, 3, C.body);
  fill(ctx, 6,  11, 2, 3, C.body);
  fill(ctx, 9,  11, 2, 3, C.body);
  fill(ctx, 11, 11, 2, 3, C.body);
  // ? above head
  fill(ctx, 10, 0, 1, 1, C.eye);
  fill(ctx, 10, 1, 1, 2, C.eye);
  fill(ctx, 11, 0, 1, 1, C.eye);
  fill(ctx, 11, 2, 1, 1, C.eye);
  if (dir === -1) ctx.restore();
}

function drawPoke(ctx: Ctx, dir: 1 | -1) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Jump up: translate canvas up
  ctx.save();
  ctx.translate(0, -P * 3);
  if (dir === -1) { ctx.translate(CW_PX, 0); ctx.scale(-1, 1); }
  fill(ctx, 0, 7, 1, 3, C.body);
  fill(ctx, 1, 7, 11, 4, C.body);
  drawBase(ctx);
  // Legs tucked under
  fill(ctx, 3, 11, 2, 2, C.body); fill(ctx, 7, 11, 2, 2, C.body);
  fill(ctx, 9, 11, 2, 2, C.body); fill(ctx, 11,11, 2, 2, C.body);
  // !! above
  fill(ctx, 7, 0, 1, 2, C.eye);
  fill(ctx, 9, 0, 1, 2, C.eye);
  ctx.restore();
}

function drawHold(ctx: Ctx, frame: number) {
  ctx.clearRect(0, 0, CW_PX, CH_PX);
  // Wobble tilt
  const angle = frame === 0 ? -0.12 : 0.12;
  ctx.save();
  ctx.translate(CW_PX / 2, CH_PX / 2);
  ctx.rotate(angle);
  ctx.translate(-CW_PX / 2, -CH_PX / 2);
  fill(ctx, 0, 7, 1, 3, C.body);
  fill(ctx, 1, 7, 11, 4, C.body);
  drawBase(ctx);
  // Paws gripping (splayed)
  fill(ctx, 1,  11, 2, 3, C.body);
  fill(ctx, 5,  11, 2, 3, C.body);
  fill(ctx, 9,  11, 2, 3, C.body);
  fill(ctx, 12, 11, 2, 3, C.body);
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

// ── Types ─────────────────────────────────────────────────────────

type State = "walk" | "idle-sit" | "idle-lick" | "idle-sleep" | "sprint" | "bump" | "poke" | "hold";

// ── Component ────────────────────────────────────────────────────

export default function NavCat() {
  const wrapRef      = useRef<HTMLDivElement>(null); // full-width rail inside header
  const containerRef = useRef<HTMLDivElement>(null); // the cat "body" div
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  const xRef         = useRef(80);
  const dirRef       = useRef<1 | -1>(1);
  const stateRef     = useRef<State>("walk");
  const frameRef     = useRef(0);
  const gsapRef      = useRef<gsap.core.Tween | null>(null);
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const msgTimer     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rafRef       = useRef<number>(0);
  const lastScrollY  = useRef(0);
  const pokeQueue    = useRef(false);

  const [bubble, setBubble] = useState<string | null>(null);
  const [tip, setTip]       = useState(false);

  // update cat container left position
  const updatePos = useCallback(() => {
    if (containerRef.current) containerRef.current.style.left = xRef.current + "px";
  }, []);

  // show a speech bubble for `ms` ms
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
      const state = stateRef.current;
      const dir   = dirRef.current;
      const interval = (state === "sprint") ? 90 : (state === "idle-sleep" ? 600 : 200);

      if (t - lastTime > interval) {
        lastTime = t;
        frameRef.current = (frameRef.current + 1) % 2;
        const f = frameRef.current;

        switch (state) {
          case "walk":       drawWalk(ctx, f, dir);  break;
          case "sprint":     drawSprint(ctx, f, dir); break;
          case "idle-sit":   drawSit(ctx);            break;
          case "idle-sleep": drawSleep(ctx);           break;
          case "idle-lick":  drawLick(ctx, f);        break;
          case "bump":       drawBump(ctx, dir);       break;
          case "poke":       drawPoke(ctx, dir);       break;
          case "hold":       drawHold(ctx, f);         break;
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
      dirRef.current  = targetX > xRef.current ? 1 : -1;
      stateRef.current = "sprint";
      const dist = Math.abs(targetX - xRef.current);
      gsapRef.current = gsap.to(xRef, {
        current: targetX,
        duration: Math.max(0.2, dist / SPRINT_SPD),
        ease: "power2.out",
        onUpdate: updatePos,
        onComplete: onDone,
      });
    }

    // Start
    updatePos();
    walk();

    // ── Scheduled chatter ───────────────────────────────────────
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

    // ── Scroll reaction ─────────────────────────────────────────
    function onScroll() {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;
      if (delta > 18 && stateRef.current !== "hold" && stateRef.current !== "poke") {
        stopAll();
        stateRef.current = "hold";
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
          if (stateRef.current === "hold") { stateRef.current = "walk"; walk(); }
        }, 900);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Nav link hover ──────────────────────────────────────────
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

    // expose sprintTo + walk for click handler (via ref on wrap dataset)
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

    const wrap = wrapRef.current as HTMLDivElement & { __catSprint?: (x: number, cb?: () => void) => void; __catWalk?: () => void };
    const sprint = wrap?.__catSprint;
    const walk   = wrap?.__catWalk;
    gsapRef.current?.kill();
    stateRef.current = "poke";
    say(POKE_MSGS[Math.floor(Math.random() * POKE_MSGS.length)], 2000);

    // run away after 300ms
    setTimeout(() => {
      if (!sprint || !walk) { pokeQueue.current = false; return; }
      const w = wrapRef.current?.getBoundingClientRect().width ?? 800;
      const runDir = xRef.current > w / 2 ? -1 : 1;
      dirRef.current = (runDir * -1) as 1 | -1; // run away from click
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
    // Rail: full-width bar at bottom of header, hidden on mobile
    <div
      ref={wrapRef}
      className="hidden lg:block"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: CH_PX, pointerEvents: "none", overflow: "visible" }}
    >
      {/* Cat container */}
      <div
        ref={containerRef}
        style={{ position: "absolute", bottom: 0, left: 0, width: CW_PX, pointerEvents: "all", cursor: "pointer", userSelect: "none" }}
        onClick={handlePoke}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
      >
        {/* Tooltip */}
        {tip && (
          <div style={{
            position: "absolute", bottom: CH_PX + 4, left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-muted)",
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            Glitch
          </div>
        )}

        {/* Speech bubble */}
        {bubble && (
          <div style={{
            position: "absolute", bottom: CH_PX + 10, left: "50%", transform: "translateX(-50%)",
            background: "rgba(10,10,20,0.85)",
            border: "1px solid rgba(168,85,247,0.45)",
            backdropFilter: "blur(8px)",
            color: "#e0d4ff",
            fontFamily: "var(--font-mono)", fontSize: "0.58rem",
            padding: "4px 10px", borderRadius: "6px",
            whiteSpace: "nowrap", pointerEvents: "none",
            boxShadow: "0 2px 12px rgba(168,85,247,0.25)",
            zIndex: 60,
          }}>
            {bubble}
            {/* bubble tail */}
            <span style={{
              position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
              borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
              borderTop: "5px solid rgba(168,85,247,0.45)",
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
