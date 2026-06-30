"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import gsap from "gsap";

// ── dimensions ────────────────────────────────────────────────────
const CW     = 54;
const CH     = 44;
const MARGIN = 12;

// speeds (px/s)
const SPD_STALK  = 18;
const SPD_WALK   = 45;
const SPD_SPRINT = 160;
const SPD_ZOOM   = 320;

// ── XState machine ────────────────────────────────────────────────
type CatContext = {
  // idle decisions
  idlePick:    number;
  shouldIdle:  boolean;
  idleDur:     number;
  // sprinting to a nav link
  sprintX:     number;
  // walk mode this cycle
  walkSpeed:   number;   // px/s — varies so she doesn't always move at same pace
  shouldZoom:  boolean;  // after bump: do zoomies instead of walk?
  // mid-stop
  midStopPick: number;   // which mini-idle to show
};

type CatEvent =
  | { type: "EDGE_HIT" }
  | { type: "SPRINT_TO"; x: number }
  | { type: "ARRIVED" }
  | { type: "LINK_LEAVE" }
  | { type: "POKE" }
  | { type: "SCROLL" }
  | { type: "MID_STOP" }    // random timer fires while walking
  | { type: "RESUME" }      // mid-stop over, keep going
  | { type: "ZOOM_DONE" };  // all zoomies bounces complete

const catMachine = setup({
  types: { context: {} as CatContext, events: {} as CatEvent },
  delays: {
    IDLE_DUR:     ({ context }: { context: CatContext }) => context.idleDur,
    MID_STOP_DUR: ({ context }: { context: CatContext }) =>
      context.midStopPick < 0.5 ? 900 + Math.random() * 600   // sit — short
                                 : 1400 + Math.random() * 800, // lick — slightly longer
  },
  guards: {
    shouldIdle: ({ context }: { context: CatContext }) => context.shouldIdle,
    shouldZoom: ({ context }: { context: CatContext }) => context.shouldZoom,
    pickSit:    ({ context }: { context: CatContext }) => context.idlePick < 0.33,
    pickLick:   ({ context }: { context: CatContext }) => context.idlePick < 0.66,
  },
}).createMachine({
  id: "glitch",
  initial: "walk",
  context: {
    idlePick:    0.5,
    shouldIdle:  false,
    idleDur:     2000,
    sprintX:     0,
    walkSpeed:   SPD_WALK,
    shouldZoom:  false,
    midStopPick: 0.5,
  },
  states: {

    // ── walking normally ─────────────────────────────────────────
    walk: {
      on: {
        EDGE_HIT: {
          target: "bump",
          actions: assign({
            shouldIdle:  () => Math.random() < 0.40,
            shouldZoom:  () => Math.random() < 0.12,  // 12% chance of zoomies
            idlePick:    () => Math.random(),
            idleDur:     () => 2000 + Math.random() * 4000,
            // next walk speed — sometimes she creeps, usually normal
            walkSpeed:   () => Math.random() < 0.2 ? SPD_STALK : SPD_WALK + (Math.random() - 0.5) * 20,
          }),
        },
        MID_STOP: {
          target: "mid-stop",
          actions: assign({ midStopPick: () => Math.random() }),
        },
        SPRINT_TO: {
          target: "sprint",
          actions: assign({ sprintX: ({ event }) => (event as { type: "SPRINT_TO"; x: number }).x }),
        },
        POKE:   "poke",
        SCROLL: "hold",
      },
    },

    // ── mid-walk pause (real cats stop randomly) ─────────────────
    "mid-stop": {
      // machine-owned timer, then resume — no manual setTimeout
      after: { MID_STOP_DUR: "walk" },
      on: {
        POKE:      "poke",
        SCROLL:    "hold",
        SPRINT_TO: {
          target: "sprint",
          actions: assign({ sprintX: ({ event }) => (event as { type: "SPRINT_TO"; x: number }).x }),
        },
      },
    },

    // ── zoomies — bounces handled in component, machine just waits ─
    zoomies: {
      on: {
        ZOOM_DONE: [
          { guard: "shouldIdle", target: "idle-pick" },
          { target: "walk" },
        ],
        POKE:   "poke",
        SCROLL: "hold",
      },
    },

    // ── sprinting to a nav link ───────────────────────────────────
    sprint: {
      on: {
        ARRIVED:    "idle-sit",
        LINK_LEAVE: "walk",
        EDGE_HIT: {
          target: "bump",
          actions: assign({
            shouldIdle: () => Math.random() < 0.40,
            shouldZoom: () => Math.random() < 0.12,
            idlePick:   () => Math.random(),
            idleDur:    () => 2000 + Math.random() * 4000,
            walkSpeed:  () => SPD_WALK + (Math.random() - 0.5) * 20,
          }),
        },
        POKE:   "poke",
        SCROLL: "hold",
      },
    },

    // ── hits a wall ───────────────────────────────────────────────
    bump: {
      after: {
        700: [
          { guard: "shouldZoom",  target: "zoomies" },
          { guard: "shouldIdle",  target: "idle-pick" },
          { target: "walk" },
        ],
      },
      on: { POKE: "poke" },
    },

    // ── transient: pick an idle ───────────────────────────────────
    "idle-pick": {
      always: [
        { guard: "pickSit",  target: "idle-sit" },
        { guard: "pickLick", target: "idle-lick" },
        { target: "idle-sleep" },
      ],
    },

    // ── idle states ───────────────────────────────────────────────
    "idle-sit": {
      after: { IDLE_DUR: "walk" },
      on: {
        SPRINT_TO: {
          target: "sprint",
          actions: assign({ sprintX: ({ event }) => (event as { type: "SPRINT_TO"; x: number }).x }),
        },
        LINK_LEAVE: "walk",
        POKE:       "poke",
        SCROLL:     "hold",
      },
    },

    "idle-lick":  { after: { IDLE_DUR: "walk" }, on: { POKE: "poke", SCROLL: "hold" } },

    "idle-sleep": {
      after: {
        // sleeps longer — she's really comfortable
        IDLE_DUR: {
          target: "walk",
          actions: assign({ walkSpeed: () => SPD_STALK }), // groggy after sleeping
        },
      },
      on: { POKE: "poke", SCROLL: "hold" },
    },

    // ── poke reaction ─────────────────────────────────────────────
    poke:       { after: { 350: "run-away" } },
    "run-away": { on: { ARRIVED: "idle-sit", POKE: "poke" } },

    // ── scroll hold ───────────────────────────────────────────────
    hold: {
      after: { 900: "walk" },
      on: { POKE: "poke" },
    },
  },
});

// ── messages ─────────────────────────────────────────────────────
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
const POKE_MSGS  = ["hey!!", "ouch!", "( >ᴗ<)", "uwu", "hiss!", "mrow?", "!!"];
const ZOOM_MSGS  = ["ZOOMIES!!", "weeee!", "zoom zoom", ":3c", "go go go!"];

// ── component ────────────────────────────────────────────────────
export default function NavCatSVG() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG element refs
  const catGroupRef  = useRef<SVGGElement>(null);
  const tailRef      = useRef<SVGPathElement>(null);
  const bodyRef      = useRef<SVGEllipseElement>(null);
  const headRef      = useRef<SVGCircleElement>(null);
  const legFLRef     = useRef<SVGRectElement>(null);
  const legFRRef     = useRef<SVGRectElement>(null);
  const legBLRef     = useRef<SVGRectElement>(null);
  const legBRRef     = useRef<SVGRectElement>(null);
  const eyeLRef      = useRef<SVGEllipseElement>(null);
  const eyeRRef      = useRef<SVGEllipseElement>(null);
  const pawRaisedRef = useRef<SVGRectElement>(null);
  const zzRef        = useRef<SVGTextElement>(null);

  const xRef        = useRef(80);
  const dirRef      = useRef<1 | -1>(1);
  const gsapRef     = useRef<gsap.core.Tween | null>(null);
  const animTlRef   = useRef<gsap.core.Timeline | null>(null);
  const zoomLeftRef = useRef(0);  // bounces remaining in zoomies
  const lastScrollY = useRef(0);

  const [bubble, setBubble]  = useState<string | null>(null);
  const [tip, setTip]        = useState(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const msgTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [state, send] = useMachine(catMachine);

  const updatePos = useCallback(() => {
    if (containerRef.current) containerRef.current.style.left = xRef.current + "px";
  }, []);

  const say = useCallback((msg: string, ms = 3000) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(msg);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);

  // ── SVG animation helpers ─────────────────────────────────────
  const LEG_O = { transformOrigin: "50% 0%" };

  function applyDir(dir: 1 | -1) {
    gsap.set(catGroupRef.current, { scaleX: dir, transformOrigin: `${CW / 2}px ${CH}px` });
  }

  function resetVisuals() {
    gsap.set(zzRef.current,        { opacity: 0 });
    gsap.set(pawRaisedRef.current, { opacity: 0, y: 0, rotation: 0 });
    gsap.set(catGroupRef.current,  { y: 0, rotation: 0 });
    gsap.set([eyeLRef.current, eyeRRef.current], { scaleY: 1, transformOrigin: "center center" });
    gsap.to(tailRef.current, { rotation: 0, duration: 0.3, transformOrigin: "10px 34px" });
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([bodyRef.current, headRef.current], { y: 0, scaleX: 1, scaleY: 1 });
  }

  function playWalkAnim(speed: "normal" | "fast" | "slow" = "normal") {
    animTlRef.current?.kill();
    const d = speed === "fast" ? 0.08 : speed === "slow" ? 0.35 : 0.2;
    const rot = speed === "slow" ? 14 : 22; // smaller leg swing when stalking
    const tl = gsap.timeline({ repeat: -1 });
    tl.to([legFLRef.current, legBRRef.current], { rotation:  rot, duration: d, ease: "sine.inOut", ...LEG_O })
      .to([legFRRef.current, legBLRef.current], { rotation: -rot, duration: d, ease: "sine.inOut", ...LEG_O }, 0)
      .to([legFLRef.current, legBRRef.current], { rotation: -rot, duration: d, ease: "sine.inOut", ...LEG_O })
      .to([legFRRef.current, legBLRef.current], { rotation:  rot, duration: d, ease: "sine.inOut", ...LEG_O });
    gsap.to(bodyRef.current, { y: -1.5, duration: d * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(headRef.current, { y: -1.5, duration: d * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    animTlRef.current = tl;
  }

  function playSitAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, ...LEG_O });
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(tailRef.current, { rotation: 18, duration: 1.3, ease: "sine.inOut",
      transformOrigin: "10px 34px" });
  }

  function playSleepAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, ...LEG_O });
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(bodyRef.current, { scaleX: 1.04, scaleY: 0.96, duration: 1.6,
      ease: "sine.inOut", transformOrigin: "center center" });
    gsap.to([eyeLRef.current, eyeRRef.current], { scaleY: 0.1, duration: 0.4,
      transformOrigin: "center center" });
    gsap.to(zzRef.current, { opacity: 1, duration: 0.4 });
  }

  function playLickAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, ...LEG_O });
    gsap.set(pawRaisedRef.current, { opacity: 1 });
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(pawRaisedRef.current, { y: -8, rotation: -20, duration: 0.5,
      ease: "sine.inOut", transformOrigin: "bottom center" });
  }

  function playBumpAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, ...LEG_O });
    gsap.to(tailRef.current, { rotation: -30, duration: 0.3, transformOrigin: "10px 34px" });
    gsap.timeline({ repeat: 2, yoyo: true })
      .to(headRef.current, { rotation: 10, duration: 0.2, transformOrigin: "50% 100%" });
  }

  function playPokeAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, ...LEG_O });
    gsap.timeline()
      .to(catGroupRef.current, { y: -10, duration: 0.15, ease: "power2.out" })
      .to(catGroupRef.current, { y: 0,   duration: 0.30, ease: "bounce.out" });
  }

  function playHoldAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, ...LEG_O });
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(catGroupRef.current, { rotation: -8, duration: 0.12,
      ease: "sine.inOut", transformOrigin: "center bottom" });
  }

  // ── movement ──────────────────────────────────────────────────
  const sprintTo = useCallback((targetX: number, spd: number, onDone?: () => void) => {
    gsapRef.current?.kill();
    dirRef.current = targetX > xRef.current ? 1 : -1;
    applyDir(dirRef.current);
    const dist = Math.abs(targetX - xRef.current);
    gsapRef.current = gsap.to(xRef, {
      current:    targetX,
      duration:   Math.max(0.1, dist / spd),
      ease:       spd >= SPD_ZOOM ? "none" : "power2.out",
      onUpdate:   updatePos,
      onComplete: onDone,
    });
  }, [updatePos]); // eslint-disable-line react-hooks/exhaustive-deps

  const startWalk = useCallback((speed: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w      = wrap.getBoundingClientRect().width;
    const target = dirRef.current === 1 ? w - CW - MARGIN : MARGIN;
    const dist   = Math.abs(target - xRef.current);
    if (dist < 1) { send({ type: "EDGE_HIT" }); return; }
    gsapRef.current?.kill();
    gsapRef.current = gsap.to(xRef, {
      current:    target,
      duration:   dist / speed,
      ease:       "none",
      onUpdate:   updatePos,
      onComplete: () => send({ type: "EDGE_HIT" }),
    });
  }, [send, updatePos]);

  // Recursive zoom bounce — machine just waits for ZOOM_DONE
  const doZoom = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w      = wrap.getBoundingClientRect().width;
    const target = dirRef.current === 1 ? w - CW - MARGIN : MARGIN;
    gsapRef.current = gsap.to(xRef, {
      current:  target,
      duration: Math.abs(target - xRef.current) / SPD_ZOOM,
      ease:     "none",
      onUpdate: updatePos,
      onComplete: () => {
        if (zoomLeftRef.current > 0) {
          zoomLeftRef.current--;
          dirRef.current = dirRef.current === 1 ? -1 : 1;
          applyDir(dirRef.current);
          doZoom();
        } else {
          send({ type: "ZOOM_DONE" });
        }
      },
    });
  }, [send, updatePos]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── react to state changes ────────────────────────────────────
  useEffect(() => {
    const sv  = state.value as string;
    const ctx = state.context;

    if (!["walk", "sprint", "run-away", "zoomies"].includes(sv)) {
      gsapRef.current?.kill();
    }

    resetVisuals();
    applyDir(dirRef.current);

    switch (sv) {
      case "walk": {
        const spd = ctx.walkSpeed;
        playWalkAnim(spd < 30 ? "slow" : "normal");
        startWalk(spd);
        break;
      }

      case "mid-stop":
        // sit or lick depending on midStopPick (machine fires MID_STOP_DUR timer)
        if (ctx.midStopPick < 0.5) playSitAnim();
        else playLickAnim();
        break;

      case "zoomies":
        playWalkAnim("fast");
        zoomLeftRef.current = Math.floor(Math.random() * 2) + 1; // 1-2 extra bounces
        say(ZOOM_MSGS[Math.floor(Math.random() * ZOOM_MSGS.length)], 2000);
        doZoom();
        break;

      case "sprint":
        playWalkAnim("fast");
        sprintTo(ctx.sprintX, SPD_SPRINT, () => send({ type: "ARRIVED" }));
        break;

      case "bump":
        dirRef.current = dirRef.current === 1 ? -1 : 1;
        applyDir(dirRef.current);
        playBumpAnim();
        break;

      case "idle-sit":   playSitAnim();   break;
      case "idle-lick":  playLickAnim();  break;
      case "idle-sleep": playSleepAnim(); break;

      case "poke":
        say(POKE_MSGS[Math.floor(Math.random() * POKE_MSGS.length)], 2000);
        playPokeAnim();
        break;

      case "run-away": {
        playWalkAnim("fast");
        const w      = wrapRef.current?.getBoundingClientRect().width ?? 800;
        dirRef.current = (xRef.current > w / 2 ? -1 : 1) as 1 | -1;
        applyDir(dirRef.current);
        const target = dirRef.current === 1 ? w - CW - MARGIN : MARGIN;
        sprintTo(target, SPD_SPRINT, () => send({ type: "ARRIVED" }));
        break;
      }

      case "hold":
        playHoldAnim();
        break;
    }
  }, [state.value]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── mid-walk random stop timer ────────────────────────────────
  // Fires only while in walk state; machine discards MID_STOP in other states
  useEffect(() => {
    if (state.value !== "walk") return;
    // 5–12 s after entering walk, maybe stop
    const delay = 5000 + Math.random() * 7000;
    const t = setTimeout(() => {
      if (Math.random() < 0.30) send({ type: "MID_STOP" });
      // else just keep walking — nothing happens
    }, delay);
    return () => clearTimeout(t);
  }, [state.value, send]);

  // ── scroll ────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;
      if (delta > 18) send({ type: "SCROLL" });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [send]);

  // ── nav link hover ────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const navLinks = wrap.closest("header")?.querySelectorAll("nav a");

    function onLinkEnter(e: Event) {
      const link  = e.currentTarget as HTMLElement;
      const wrapR = wrap!.getBoundingClientRect();
      const linkR = link.getBoundingClientRect();
      send({ type: "SPRINT_TO", x: linkR.left - wrapR.left + linkR.width / 2 - CW / 2 });
    }
    function onLinkLeave() { send({ type: "LINK_LEAVE" }); }

    navLinks?.forEach(l => {
      l.addEventListener("mouseenter", onLinkEnter);
      l.addEventListener("mouseleave", onLinkLeave);
    });
    return () => {
      navLinks?.forEach(l => {
        l.removeEventListener("mouseenter", onLinkEnter);
        l.removeEventListener("mouseleave", onLinkLeave);
      });
    };
  }, [send]);

  // ── scheduled chatter ─────────────────────────────────────────
  useEffect(() => {
    function scheduleMsg() {
      msgTimer.current = setTimeout(() => {
        const msg = Math.random() < 0.2
          ? timeGreeting()
          : IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
        say(msg);
        scheduleMsg();
      }, 12000 + Math.random() * 18000);
    }
    const greetTimer = setTimeout(() => { say(timeGreeting(), 4000); scheduleMsg(); }, 4000);
    return () => {
      clearTimeout(greetTimer);
      clearTimeout(msgTimer.current);
      clearTimeout(bubbleTimer.current);
    };
  }, [say]);

  useEffect(() => { updatePos(); }, [updatePos]);

  // ── render ───────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="hidden lg:block"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: CH,
        pointerEvents: "none", overflow: "visible" }}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", bottom: 0, left: 0, width: CW,
          pointerEvents: "all", cursor: "pointer", userSelect: "none" }}
        onClick={() => send({ type: "POKE" })}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
      >
        {tip && (
          <div style={{
            position: "absolute", bottom: CH + 4, left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-muted)",
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>Glitch</div>
        )}

        {bubble && (
          <div style={{
            position: "absolute", bottom: CH + 10, left: "50%", transform: "translateX(-50%)",
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

        {/* SVG cat — orange tabby */}
        <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}
          style={{ display: "block", overflow: "visible" }}>
          <defs>
            <filter id="svg-cat-drop" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1"
                floodColor="#A86018" floodOpacity="0.35" />
            </filter>
          </defs>

          <g ref={catGroupRef} style={{ transformOrigin: `${CW / 2}px ${CH}px` }}>

            {/* Tail */}
            <path d="M 10 34 C 4 30, 2 24, 6 20 C 8 18, 10 20, 8 22"
              fill="none" stroke="#1a0a00" strokeWidth="6" strokeLinecap="round"
              style={{ transformOrigin: "10px 34px" }} />
            <path ref={tailRef}
              d="M 10 34 C 4 30, 2 24, 6 20 C 8 18, 10 20, 8 22"
              fill="none" stroke="#D98B3C" strokeWidth="4" strokeLinecap="round"
              style={{ transformOrigin: "10px 34px" }} />

            {/* Body */}
            <ellipse cx="24" cy="32" rx="16" ry="10" fill="#1a0a00" />
            <ellipse ref={bodyRef} cx="24" cy="32" rx="15" ry="9"
              fill="#D98B3C" filter="url(#svg-cat-drop)" />
            <line x1="15" y1="27" x2="14" y2="37"
              stroke="#A86018" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="27" x2="35" y2="37"
              stroke="#A86018" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="24" cy="33" rx="8" ry="6" fill="#F5E6CC" />

            {/* Legs */}
            <rect ref={legFLRef} x="11" y="37" width="5" height="8" rx="2.5" fill="#1a0a00" />
            <rect x="11.5" y="37" width="4" height="7" rx="2" fill="#D98B3C" />
            <ellipse cx="13.5" cy="44.5" rx="2.2" ry="1.2" fill="#F5E6CC" />

            <rect ref={legFRRef} x="18" y="37" width="5" height="8" rx="2.5" fill="#1a0a00" />
            <rect x="18.5" y="37" width="4" height="7" rx="2" fill="#D98B3C" />
            <ellipse cx="20.5" cy="44.5" rx="2.2" ry="1.2" fill="#F5E6CC" />

            <rect ref={legBLRef} x="26" y="37" width="5" height="8" rx="2.5" fill="#1a0a00" />
            <rect x="26.5" y="37" width="4" height="7" rx="2" fill="#D98B3C" />
            <ellipse cx="28.5" cy="44.5" rx="2.2" ry="1.2" fill="#F5E6CC" />

            <rect ref={legBRRef} x="33" y="37" width="5" height="8" rx="2.5" fill="#1a0a00" />
            <rect x="33.5" y="37" width="4" height="7" rx="2" fill="#D98B3C" />
            <ellipse cx="35.5" cy="44.5" rx="2.2" ry="1.2" fill="#F5E6CC" />

            {/* Head */}
            <circle cx="38" cy="18" r="13" fill="#1a0a00" />
            <circle ref={headRef} cx="38" cy="18" r="12" fill="#D98B3C" />
            <ellipse cx="38" cy="12" rx="7" ry="4" fill="#EFB060" opacity="0.6" />
            <ellipse cx="38" cy="20" rx="7" ry="8" fill="#F5E6CC" />
            <line x1="28" y1="15" x2="27" y2="19"
              stroke="#A86018" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="29" y1="13" x2="28.5" y2="17"
              stroke="#A86018" strokeWidth="1.2" strokeLinecap="round" />

            {/* Ears */}
            <polygon points="28,8 32,17 26,17" fill="#1a0a00" />
            <polygon points="29,10 31,16 27,16" fill="#D98B3C" />
            <polygon points="29.5,11 31,15.5 27.5,15.5" fill="#F4A0A0" />
            <polygon points="46,8 42,17 48,17" fill="#1a0a00" />
            <polygon points="45,10 43,16 47,16" fill="#D98B3C" />
            <polygon points="44.5,11 43,15.5 46.5,15.5" fill="#F4A0A0" />

            {/* Eyes */}
            <ellipse ref={eyeLRef} cx="33" cy="17" rx="3.5" ry="3.5" fill="#1a0a00" />
            <circle cx="34.3" cy="15.5" r="1.3" fill="#FFFFFF" />
            <ellipse ref={eyeRRef} cx="43" cy="17" rx="3.5" ry="3.5" fill="#1a0a00" />
            <circle cx="44.3" cy="15.5" r="1.3" fill="#FFFFFF" />

            {/* Nose + mouth */}
            <ellipse cx="38" cy="22" rx="1.8" ry="1.2" fill="#F4A0A0" />
            <path d="M 36 23 Q 38 25.5 40 23"
              fill="none" stroke="#1a0a00" strokeWidth="0.9" strokeLinecap="round" />

            {/* Raised paw (lick) */}
            <rect ref={pawRaisedRef}
              x="10" y="30" width="5" height="8" rx="2.5"
              fill="#D98B3C" stroke="#1a0a00" strokeWidth="0.8"
              opacity="0" style={{ transformOrigin: "12px 38px" }} />

            {/* Z z (sleep) */}
            <text ref={zzRef} x="49" y="8"
              fontFamily="var(--font-mono)" fontSize="7"
              fill="#EFB060" opacity="0" style={{ pointerEvents: "none" }}>
              z z
            </text>

          </g>
        </svg>
      </div>
    </div>
  );
}
