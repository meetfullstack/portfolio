"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── canvas size ───────────────────────────────────────────────────
const CW = 54;
const CH = 44;

const WALK_SPD   = 45;
const SPRINT_SPD = 160;
const MARGIN     = 12;

// ── messages (same as pixel version) ─────────────────────────────
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

  // movement refs
  const xRef       = useRef(80);
  const dirRef     = useRef<1 | -1>(1);
  const stateRef   = useRef<State>("walk");
  const gsapRef    = useRef<gsap.core.Tween | null>(null);
  const animTlRef  = useRef<gsap.core.Timeline | null>(null);
  const idleTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleTimer= useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const msgTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastScrollY= useRef(0);
  const pokeQueue  = useRef(false);

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

  // ── SVG sprite animations ─────────────────────────────────────
  const LEG_ORIGIN = { transformOrigin: "50% 0%" };

  function resetLegs() {
    gsap.set([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current],
      { rotation: 0, y: 0, ...LEG_ORIGIN });
  }

  function playWalkAnim(fast = false) {
    animTlRef.current?.kill();
    const d = fast ? 0.1 : 0.2;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to([legFLRef.current, legBRRef.current], { rotation:  22, duration: d, ease: "sine.inOut", ...LEG_ORIGIN })
      .to([legFRRef.current, legBLRef.current], { rotation: -22, duration: d, ease: "sine.inOut", ...LEG_ORIGIN }, 0)
      .to([legFLRef.current, legBRRef.current], { rotation: -22, duration: d, ease: "sine.inOut", ...LEG_ORIGIN })
      .to([legFRRef.current, legBLRef.current], { rotation:  22, duration: d, ease: "sine.inOut", ...LEG_ORIGIN });
    // body bob
    gsap.to(bodyRef.current,  { y: -1.5, duration: d * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(headRef.current,  { y: -1.5, duration: d * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    animTlRef.current = tl;
  }

  function playSitAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    resetLegs();
    gsap.set([legFLRef.current, legFRRef.current], { rotation: 0, y: 0 });
    // tail gently sways
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(tailRef.current, { rotation: 18, duration: 1.3, ease: "sine.inOut",
      transformOrigin: "80% 50%" });
  }

  function playSleepAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    resetLegs();
    // slow body breathing
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(bodyRef.current, { scaleX: 1.04, scaleY: 0.96, duration: 1.6, ease: "sine.inOut",
      transformOrigin: "center center" });
    // eyes close
    gsap.to([eyeLRef.current, eyeRRef.current], { scaleY: 0.1, duration: 0.4, transformOrigin: "center center" });
    // show z z
    gsap.to(zzRef.current, { opacity: 1, duration: 0.4 });
  }

  function playLickAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    resetLegs();
    // raise paw to face
    gsap.set(pawRaisedRef.current, { opacity: 1 });
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(pawRaisedRef.current, { y: -8, rotation: -20, duration: 0.5, ease: "sine.inOut",
      transformOrigin: "bottom center" });
  }

  function playBumpAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    resetLegs();
    // tail drops
    gsap.to(tailRef.current, { rotation: -30, duration: 0.3, transformOrigin: "80% 50%" });
    // head tilts confused
    gsap.timeline({ repeat: 2, yoyo: true })
      .to(headRef.current, { rotation: 10, duration: 0.2, transformOrigin: "50% 100%" });
  }

  function playPokeAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    resetLegs();
    // jump up then land
    gsap.timeline()
      .to(catGroupRef.current, { y: -10, duration: 0.15, ease: "power2.out" })
      .to(catGroupRef.current, { y: 0, duration: 0.3, ease: "bounce.out" });
  }

  function playHoldAnim() {
    animTlRef.current?.kill();
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    resetLegs();
    // wobble left-right
    animTlRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    animTlRef.current.to(catGroupRef.current, { rotation: -8, duration: 0.12, ease: "sine.inOut",
      transformOrigin: "center bottom" });
  }

  function resetVisuals() {
    gsap.set(zzRef.current, { opacity: 0 });
    gsap.set(pawRaisedRef.current, { opacity: 0, y: 0, rotation: 0 });
    gsap.set(catGroupRef.current, { y: 0, rotation: 0 });
    gsap.set([eyeLRef.current, eyeRRef.current], { scaleY: 1, transformOrigin: "center center" });
    gsap.to(tailRef.current, { rotation: 0, duration: 0.3, transformOrigin: "80% 50%" });
    gsap.killTweensOf([bodyRef.current, headRef.current]);
    gsap.set([bodyRef.current, headRef.current], { y: 0, scaleX: 1, scaleY: 1 });
  }

  function applyDir(dir: 1 | -1) {
    if (!catGroupRef.current) return;
    gsap.set(catGroupRef.current, { scaleX: dir, transformOrigin: "center center" });
  }

  // ── movement + state machine ──────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function bounds() {
      const w = wrap!.getBoundingClientRect().width;
      return { min: MARGIN, max: w - CW - MARGIN };
    }

    function stopAll() {
      gsapRef.current?.kill();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    }

    function enterState(s: State) {
      stateRef.current = s;
      resetVisuals();
      applyDir(dirRef.current);
      switch (s) {
        case "walk":       playWalkAnim(false); break;
        case "sprint":     playWalkAnim(true);  break;
        case "idle-sit":   playSitAnim();        break;
        case "idle-sleep": playSleepAnim();      break;
        case "idle-lick":  playLickAnim();       break;
        case "bump":       playBumpAnim();       break;
        case "poke":       playPokeAnim();       break;
        case "hold":       playHoldAnim();       break;
      }
    }

    function walk() {
      const { min, max } = bounds();
      const target = dirRef.current === 1 ? max : min;
      const dist   = Math.abs(target - xRef.current);
      if (dist < 1) { handleEdge(); return; }

      enterState("walk");
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
      enterState("bump");
      setTimeout(() => {
        dirRef.current = dirRef.current === 1 ? -1 : 1;
        applyDir(dirRef.current);
        if (Math.random() < 0.35) doIdle();
        else walk();
      }, 800);
    }

    function doIdle() {
      stopAll();
      const pick = Math.random();
      if      (pick < 0.33) enterState("idle-sit");
      else if (pick < 0.66) enterState("idle-lick");
      else                  enterState("idle-sleep");
      const dur = 1800 + Math.random() * 3000;
      idleTimer.current = setTimeout(() => walk(), dur);
    }

    function sprintTo(targetX: number, onDone?: () => void) {
      stopAll();
      dirRef.current  = targetX > xRef.current ? 1 : -1;
      enterState("sprint");
      applyDir(dirRef.current);
      const dist = Math.abs(targetX - xRef.current);
      gsapRef.current = gsap.to(xRef, {
        current: targetX,
        duration: Math.max(0.2, dist / SPRINT_SPD),
        ease: "power2.out",
        onUpdate: updatePos,
        onComplete: onDone,
      });
    }

    // initial position
    updatePos();
    walk();

    // chatter
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

    // scroll
    function onScroll() {
      const delta = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;
      if (delta > 18 && stateRef.current !== "hold" && stateRef.current !== "poke") {
        stopAll();
        enterState("hold");
        idleTimer.current = setTimeout(() => {
          if (stateRef.current === "hold") walk();
        }, 900);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // nav link hover sprint
    const navLinks = wrap.closest("header")?.querySelectorAll("nav a");

    function onLinkEnter(e: Event) {
      const link    = e.currentTarget as HTMLElement;
      const wrapR   = wrap!.getBoundingClientRect();
      const linkR   = link.getBoundingClientRect();
      const targetX = linkR.left - wrapR.left + linkR.width / 2 - CW / 2;
      sprintTo(targetX, () => enterState("idle-sit"));
    }

    function onLinkLeave() {
      if (stateRef.current === "idle-sit" || stateRef.current === "sprint") {
        setTimeout(() => { if (stateRef.current !== "poke") walk(); }, 400);
      }
    }

    navLinks?.forEach(l => {
      l.addEventListener("mouseenter", onLinkEnter);
      l.addEventListener("mouseleave", onLinkLeave);
    });

    // expose for click handler
    type WrapExt = HTMLDivElement & { __svgSprint?: typeof sprintTo; __svgWalk?: typeof walk };
    (wrap as WrapExt).__svgSprint = sprintTo;
    (wrap as WrapExt).__svgWalk   = walk;

    return () => {
      stopAll();
      animTlRef.current?.kill();
      clearTimeout(greetTimer);
      clearTimeout(msgTimer.current);
      clearTimeout(bubbleTimer.current);
      window.removeEventListener("scroll", onScroll);
      navLinks?.forEach(l => {
        l.removeEventListener("mouseenter", onLinkEnter);
        l.removeEventListener("mouseleave", onLinkLeave);
      });
    };
  }, [say, updatePos]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── click / poke ─────────────────────────────────────────────
  function handlePoke() {
    if (pokeQueue.current) return;
    pokeQueue.current = true;

    type WrapExt = HTMLDivElement & { __svgSprint?: (x: number, cb?: () => void) => void; __svgWalk?: () => void };
    const wrap   = wrapRef.current as WrapExt;
    const sprint = wrap?.__svgSprint;
    const walk   = wrap?.__svgWalk;

    stateRef.current = "poke";
    playPokeAnim();
    say(POKE_MSGS[Math.floor(Math.random() * POKE_MSGS.length)], 2000);

    setTimeout(() => {
      if (!sprint || !walk) { pokeQueue.current = false; return; }
      const w   = wrapRef.current?.getBoundingClientRect().width ?? 800;
      dirRef.current = (xRef.current > w / 2 ? -1 : 1) as 1 | -1;
      const target   = dirRef.current === 1 ? w - CW - MARGIN : MARGIN;
      sprint(target, () => {
        stateRef.current = "idle-sit";
        playSitAnim();
        setTimeout(() => { walk(); pokeQueue.current = false; }, 1200);
      });
    }, 350);
  }

  // ── render ───────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="hidden lg:block"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: CH, pointerEvents: "none", overflow: "visible" }}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", bottom: 0, left: 0, width: CW, pointerEvents: "all", cursor: "pointer", userSelect: "none" }}
        onClick={handlePoke}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
      >
        {/* Tooltip */}
        {tip && (
          <div style={{
            position: "absolute", bottom: CH + 4, left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-muted)",
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            Glitch
          </div>
        )}

        {/* Speech bubble */}
        {bubble && (
          <div style={{
            position: "absolute", bottom: CH + 10, left: "50%", transform: "translateX(-50%)",
            background: "rgba(10,10,20,0.88)",
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
            <span style={{
              position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
              borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
              borderTop: "5px solid rgba(168,85,247,0.45)",
            }} />
          </div>
        )}

        {/* SVG cat */}
        <svg
          width={CW}
          height={CH}
          viewBox={`0 0 ${CW} ${CH}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            {/* Purple eye glow */}
            <filter id="svg-cat-eye-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Soft body glow */}
            <filter id="svg-cat-body-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Everything inside this group gets flipped for direction */}
          <g ref={catGroupRef} style={{ transformOrigin: `${CW / 2}px ${CH}px` }}>

            {/* ── Tail ── */}
            <path
              ref={tailRef}
              d="M 10 34 C 4 30, 2 24, 6 20 C 8 18, 10 20, 8 22"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ transformOrigin: "10px 34px" }}
            />

            {/* ── Body ── */}
            <ellipse
              ref={bodyRef}
              cx="24"
              cy="32"
              rx="15"
              ry="9"
              fill="#1a1a2e"
              filter="url(#svg-cat-body-glow)"
            />

            {/* ── Legs ── */}
            <rect ref={legFLRef} x="12" y="37" width="5" height="7" rx="2.5" fill="#1a1a2e" />
            <rect ref={legFRRef} x="19" y="37" width="5" height="7" rx="2.5" fill="#1a1a2e" />
            <rect ref={legBLRef} x="26" y="37" width="5" height="7" rx="2.5" fill="#0d0d1a" />
            <rect ref={legBRRef} x="33" y="37" width="5" height="7" rx="2.5" fill="#0d0d1a" />

            {/* ── Head ── */}
            <circle
              ref={headRef}
              cx="38"
              cy="18"
              r="12"
              fill="#1a1a2e"
            />

            {/* ── Ears ── */}
            {/* Left ear */}
            <polygon points="28,8 32,16 26,16" fill="#1a1a2e" />
            <polygon points="29,9 31,15 27,15" fill="#3a0d50" />
            {/* Right ear */}
            <polygon points="46,8 42,16 48,16" fill="#1a1a2e" />
            <polygon points="45,9 43,15 47,15" fill="#3a0d50" />

            {/* ── Eyes ── */}
            <ellipse
              ref={eyeLRef}
              cx="33"
              cy="17"
              rx="3"
              ry="3"
              fill="#a855f7"
              filter="url(#svg-cat-eye-glow)"
            />
            <ellipse
              ref={eyeRRef}
              cx="43"
              cy="17"
              rx="3"
              ry="3"
              fill="#a855f7"
              filter="url(#svg-cat-eye-glow)"
            />
            {/* Eye pupils */}
            <ellipse cx="33" cy="17" rx="1.5" ry="1.8" fill="#0d0d1a" />
            <ellipse cx="43" cy="17" rx="1.5" ry="1.8" fill="#0d0d1a" />
            {/* Eye shines */}
            <circle cx="34" cy="16" r="0.9" fill="#ddd6ff" />
            <circle cx="44" cy="16" r="0.9" fill="#ddd6ff" />

            {/* ── Nose ── */}
            <ellipse cx="38" cy="21" rx="1.5" ry="1" fill="#ff9eb5" />

            {/* ── Mouth ── */}
            <path d="M 36 22 Q 38 24 40 22" fill="none" stroke="#0d0d1a" strokeWidth="0.8" strokeLinecap="round" />

            {/* ── Raised paw (for lick animation) ── */}
            <rect
              ref={pawRaisedRef}
              x="11" y="30" width="5" height="7" rx="2.5"
              fill="#a855f7"
              opacity="0"
              style={{ transformOrigin: "13px 37px" }}
            />

            {/* ── Z z (sleep indicator) ── */}
            <text
              ref={zzRef}
              x="48" y="8"
              fontFamily="var(--font-mono)"
              fontSize="7"
              fill="#a855f7"
              opacity="0"
              style={{ pointerEvents: "none" }}
            >
              z z
            </text>

          </g>
        </svg>
      </div>
    </div>
  );
}
