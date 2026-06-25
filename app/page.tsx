"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import MatrixRain from "@/components/MatrixRain";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import SectionDivider from "@/components/SectionDivider";
import CornerButton from "@/components/CornerButton";
import ScrambleText from "@/components/ScrambleText";
import AsciiOverlay from "@/components/AsciiOverlay";
import Image from "next/image";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    type W = Window & { __loaderActive?: boolean; __loaderDone?: boolean };
    const loaderActive = (window as W).__loaderActive;
    const loaderDone   = (window as W).__loaderDone;
    let tl: gsap.core.Timeline;

    // fromTo makes start+end explicit so gsap.set pre-hiding doesn't break the tween
    function animateHero() {
      const frame = document.querySelector(".hero-photo-frame") as HTMLElement;
      const h = frame ? frame.offsetHeight : 450;
      const D = 2.5; // codedgar default duration

      const from = { opacity: 0, y: 20 };
      const to   = (extra?: object) => ({ opacity: 1, y: 0, duration: 0.5, ease: "power2.out", ...extra });
      tl = gsap.timeline({ delay: 0.15 });

      // Text: one by one (codedgar values)
      tl.fromTo(".hero-tag",     from, to(), 0 * 0.16)
        .fromTo(".hero-heading", from, to(), 1 * 0.16)
        .fromTo(".hero-line",    from, to(), 2 * 0.16)
        .fromTo(".hero-sub",     from, to(), 3 * 0.16)
        .fromTo(".hero-cta",     from, to(), 4 * 0.16);

      const photoStart = 5 * 0.16;

      // Frame fades in
      tl.fromTo(".hero-image", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, photoStart);

      // Photo: clip-path + blur reveal (circ.inOut — codedgar's ease)
      tl.fromTo(".photo-reveal",
        { clipPath: `inset(${h}px 0px 0px 0px)`, filter: "blur(10px) hue-rotate(0deg)" },
        { clipPath: "inset(0px 0px 0px 0px)", filter: "blur(0px) hue-rotate(0deg)", duration: D, ease: "circ.inOut" },
        photoStart);

      // Trail wrap clips open in sync with photo (trail only visible at reveal edge)
      tl.fromTo(".photo-trail-wrap",
        { clipPath: `inset(${h}px 0px 0px 0px)` },
        { clipPath: "inset(0px 0px 0px 0px)", duration: D, ease: "circ.inOut" },
        photoStart);

      // Trail sweeps bottom → top
      tl.fromTo(".photo-trail", { y: h }, { y: -30, duration: D, ease: "circ.inOut" }, photoStart);

      // Chromatic aberration: grows then shrinks (codedgar)
      tl.fromTo(".photo-trail", { "--ca-offset": "1px" }, { "--ca-offset": "4px", duration: D * 0.5, ease: "power2.in" }, photoStart)
        .to(".photo-trail", { "--ca-offset": "1px", duration: D * 0.5, ease: "power2.out" }, photoStart + D * 0.5);

      // ASCII overlay clips away from bottom (disappears upward, same direction as photo reveal)
      tl.fromTo(".ascii-overlay",
        { clipPath: "inset(0px 0px 0px 0px)" },
        { clipPath: `inset(0px 0px ${h}px 0px)`, duration: D, ease: "circ.inOut" },
        photoStart);

      // Shake + hue-rotate at 85% — exact codedgar values
      const shakeAt = photoStart + D * 0.85;
      tl.to(".hero-photo-frame", { skewX: 1.5,  x:  3, duration: 0.04, ease: "none"        }, shakeAt)
        .to(".hero-photo-frame", { skewX: -0.8, x: -2, duration: 0.04, ease: "none"        }, shakeAt + 0.04)
        .to(".hero-photo-frame", { skewX: 0,    x:  0, duration: 0.03, ease: "power2.out"  }, shakeAt + 0.08)
        .to(".photo-reveal",     { filter: "blur(0px) hue-rotate(15deg)", duration: 0.05, ease: "none" }, shakeAt)
        .to(".photo-reveal",     { filter: "blur(0px) hue-rotate(0deg)",  duration: 0.05, ease: "none" }, shakeAt + 0.05);
    }

    if (loaderActive && !loaderDone) {
      // First visit — loader is still running, wait for it
      window.addEventListener("portfolio:loader-done", animateHero, { once: true });
    } else {
      // Return visit or loader already done — pre-hide then animate immediately
      gsap.set([".hero-tag", ".hero-heading", ".hero-line", ".hero-sub", ".hero-cta"], { opacity: 0, y: 20 });
      gsap.set(".hero-image", { opacity: 0 });
      animateHero();
    }

    return () => {
      window.removeEventListener("portfolio:loader-done", animateHero);
      tl?.kill();
    };
  }, []);

  return (
    <>
      <div className="relative overflow-hidden">
        <MatrixRain />
        <section
          ref={heroRef}
          className="container relative z-10 grid min-h-[92vh] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="flex flex-col min-w-0">
            <p className="hero-tag section-tag mb-8">
              {"// hello.world"} — available for work
            </p>

            <h1
              className="hero-heading font-bold tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", lineHeight: 1.2 }}
            >
              <span style={{ display: "block" }}>Hello, I&apos;m Meet —</span>
              {/* Fixed-height wrapper: locks the scramble text to one line so GSAP content changes never shift the photo or buttons */}
              <span style={{ display: "block", height: "1.2em", overflow: "hidden" }}>
                <ScrambleText
                  from="Full-Stack Developer"
                  to="Meet Upadhyay"
                  className="accent-text"
                  style={{ display: "block", whiteSpace: "nowrap" }}
                />
              </span>
            </h1>

            <div
              className="hero-line mt-8"
              style={{ height: "1px", background: "var(--border)" }}
            />

            <p
              className="hero-sub mt-8 max-w-xl text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              I build fast, modern web applications with React, Next.js, and
              TypeScript. Currently open to software engineering and Data/AI
              roles in Toronto and remote.
            </p>

            <div className="hero-cta flex flex-wrap gap-8" style={{ marginTop: "15px" }}>
              <CornerButton href="#projects" variant="primary">
                View my work
              </CornerButton>
              <CornerButton href="#contact" variant="secondary">
                Get in touch
              </CornerButton>
            </div>
          </div>

          <div className="hero-image relative z-10 hidden lg:flex lg:justify-end">
            <div className="hero-photo-frame">
              <div className="photo-reveal" style={{ position: "absolute", inset: 0 }}>
                <Image
                  src="/profile.jpg"
                  alt="Meet Upadhyay"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 0px, 338px"
                />
              </div>
              {/* Trail wrap clips in sync with photo so trail only shows at reveal edge */}
              <div className="photo-trail-wrap" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
                <div className="photo-trail" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 30, willChange: "transform" }} />
              </div>
              {/* ASCII overlay — sits on top, clips away upward as photo scans in below */}
              <div className="ascii-overlay" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
                <AsciiOverlay src="/profile.jpg" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <SectionDivider />
      <About />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Contact />
    </>
  );
}
