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
        <svg
          width={CW}
          height={CH}
          viewBox={`0 0 ${CW} ${CH}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <filter id="svg-cat-drop" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#A86018" floodOpacity="0.35" />
            </filter>
          </defs>

          <g ref={catGroupRef} style={{ transformOrigin: `${CW / 2}px ${CH}px` }}>

            {/* ── Tail (outline then fill) ── */}
            <path
              d="M 10 34 C 4 30, 2 24, 6 20 C 8 18, 10 20, 8 22"
              fill="none" stroke="#1a0a00" strokeWidth="6" strokeLinecap="round"
              style={{ transformOrigin: "10px 34px" }}
            />
            <path
              ref={tailRef}
              d="M 10 34 C 4 30, 2 24, 6 20 C 8 18, 10 20, 8 22"
              fill="none" stroke="#D98B3C" strokeWidth="4" strokeLinecap="round"
              style={{ transformOrigin: "10px 34px" }}
            />

            {/* ── Body outline + orange fill + cream belly ── */}
            <ellipse cx="24" cy="32" rx="16" ry="10" fill="#1a0a00" />
            <ellipse
              ref={bodyRef}
              cx="24" cy="32" rx="15" ry="9"
              fill="#D98B3C"
              filter="url(#svg-cat-drop)"
            />
            {/* Tabby stripes */}
            <line x1="15" y1="27" x2="14" y2="37" stroke="#A86018" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="27" x2="35" y2="37" stroke="#A86018" strokeWidth="1.5" strokeLinecap="round" />
            {/* Cream belly */}
            <ellipse cx="24" cy="33" rx="8" ry="6" fill="#F5E6CC" />

            {/* ── Legs (orange + cream paw tips) ── */}
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

            {/* ── Head outline + orange fill + cream face ── */}
            <circle cx="38" cy="18" r="13" fill="#1a0a00" />
            <circle
              ref={headRef}
              cx="38" cy="18" r="12"
              fill="#D98B3C"
            />
            {/* Light orange highlight on top */}
            <ellipse cx="38" cy="12" rx="7" ry="4" fill="#EFB060" opacity="0.6" />
            {/* Cream face */}
            <ellipse cx="38" cy="20" rx="7" ry="8" fill="#F5E6CC" />
            {/* Cheek stripe marks */}
            <line x1="28" y1="15" x2="27" y2="19" stroke="#A86018" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="29" y1="13" x2="28.5" y2="17" stroke="#A86018" strokeWidth="1.2" strokeLinecap="round" />

            {/* ── Ears ── */}
            <polygon points="28,8 32,17 26,17" fill="#1a0a00" />
            <polygon points="29,10 31,16 27,16" fill="#D98B3C" />
            <polygon points="29.5,11 31,15.5 27.5,15.5" fill="#F4A0A0" />

            <polygon points="46,8 42,17 48,17" fill="#1a0a00" />
            <polygon points="45,10 43,16 47,16" fill="#D98B3C" />
            <polygon points="44.5,11 43,15.5 46.5,15.5" fill="#F4A0A0" />

            {/* ── Eyes — big black with white shine ── */}
            <ellipse
              ref={eyeLRef}
              cx="33" cy="17" rx="3.5" ry="3.5"
              fill="#1a0a00"
            />
            <circle cx="34.3" cy="15.5" r="1.3" fill="#FFFFFF" />

            <ellipse
              ref={eyeRRef}
              cx="43" cy="17" rx="3.5" ry="3.5"
              fill="#1a0a00"
            />
            <circle cx="44.3" cy="15.5" r="1.3" fill="#FFFFFF" />

            {/* ── Nose ── */}
            <ellipse cx="38" cy="22" rx="1.8" ry="1.2" fill="#F4A0A0" />

            {/* ── Mouth ── */}
            <path d="M 36 23 Q 38 25.5 40 23" fill="none" stroke="#1a0a00" strokeWidth="0.9" strokeLinecap="round" />

            {/* ── Raised paw (lick animation) ── */}
            <rect
              ref={pawRaisedRef}
              x="10" y="30" width="5" height="8" rx="2.5"
              fill="#D98B3C"
              stroke="#1a0a00" strokeWidth="0.8"
              opacity="0"
              style={{ transformOrigin: "12px 38px" }}
            />

            {/* ── Z z (sleep) ── */}
            <text
              ref={zzRef}
              x="49" y="8"
              fontFamily="var(--font-mono)"
              fontSize="7"
              fill="#EFB060"
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
