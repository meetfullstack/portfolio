"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import MatrixRain from "@/components/MatrixRain";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import SectionDivider from "@/components/SectionDivider";
import CornerButton from "@/components/CornerButton";
import ScrambleText from "@/components/ScrambleText";
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
      // Use naturalHeight fallback if image hasn't painted yet
      const img = frame?.querySelector("img") as HTMLImageElement | null;
      const h = (frame && frame.offsetHeight > 0) ? frame.offsetHeight : (img?.naturalHeight || 450);
      const D = 2.5; // codedgar default duration

      const from = { opacity: 0, y: 20 };
      const to   = (extra?: object) => ({ opacity: 1, y: 0, duration: 0.5, ease: "power2.out", ...extra });
      tl = gsap.timeline({ delay: 0.15 });

      // Text: one by one (codedgar values)
      tl.fromTo(".hero-tag",     from, to(), 0 * 0.16)
        .fromTo(".hero-heading", from, to(), 1 * 0.16)

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

      // Trail sweeps bottom → top; frame's overflow:hidden clips it naturally
      gsap.set(".photo-trail", { y: h });
      tl.to(".photo-trail", { y: -30, duration: D, ease: "circ.inOut",
        onComplete: () => gsap.set(".photo-trail", { display: "none" }) }, photoStart);

      // Chromatic aberration: grows then shrinks (codedgar)
      tl.fromTo(".photo-trail", { "--ca-offset": "1px" }, { "--ca-offset": "4px", duration: D * 0.5, ease: "power2.in" }, photoStart)
        .to(".photo-trail", { "--ca-offset": "1px", duration: D * 0.5, ease: "power2.out" }, photoStart + D * 0.5);

      // Blurred overlay clips away from bottom (disappears upward as sharp photo reveals below)
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

    // Always pre-hide immediately — loader covers the page so this is invisible on first visit
    gsap.set([".hero-tag", ".hero-heading", ".hero-sub", ".hero-cta"], { opacity: 0, y: 20 });
    gsap.set(".hero-image", { opacity: 0 });

    if (loaderActive && !loaderDone) {
      // First visit — loader is still running, wait for it
      window.addEventListener("portfolio:loader-done", animateHero, { once: true });
    } else {
      // Return visit or loader already done — animate immediately
      animateHero();
    }

    return () => {
      window.removeEventListener("portfolio:loader-done", animateHero);
      tl?.kill();
    };
  }, []);

  return (
    <>
      <section
        ref={heroRef}
        id="hero"
        aria-labelledby="hero-title"
        className="section relative overflow-hidden"
        style={{
          paddingTop: "calc(var(--section-gap) + 42px)",
          paddingBottom: "calc(var(--section-gap) + 4rem)",
        }}
      >
        <MatrixRain />
        <div className="container relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_338px]">
          <div className="flex flex-col min-w-0 order-2 lg:order-1">
            <p className="hero-tag section-tag mb-6">
              {"// hello.world"} — available for work
            </p>

            <h1
              id="hero-title"
              aria-label="Hello, I'm Meet — Full-Stack Developer"
              className="hero-heading font-bold tracking-tight"
            >
              <span style={{ display: "block" }}>Hello, I&apos;m Meet —</span>
              <span style={{ display: "block", minHeight: "1.2em" }}>
                <ScrambleText
                  from="Full-Stack Developer"
                  to="Building AI Applications"
                  className="accent-text"
                  style={{ display: "block", whiteSpace: "nowrap" }}
                />
              </span>
            </h1>

            <p
              className="hero-sub max-w-[440px] text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)", marginTop: "0.8rem" }}
            >
              I build fast, modern web applications with React, Next.js, and
              TypeScript. Currently open to software engineering and Data/AI
              roles in Toronto and remote.
            </p>

            <div className="hero-cta flex flex-wrap gap-8" style={{ marginTop: "1.3rem" }}>
              <CornerButton href="#projects" variant="primary">
                View my work
              </CornerButton>
              <CornerButton href="#contact" variant="secondary">
                Get in touch
              </CornerButton>
            </div>
          </div>

          <div className="hero-image relative z-10 min-w-0 flex justify-center order-1 lg:order-2 lg:justify-end">
            <div className="hero-photo-frame">
              <div className="photo-reveal" style={{ position: "absolute", inset: 0 }}>
                <Image
                  src="/profile.jpg"
                  alt="Meet Upadhyay"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 90vw, 338px"
                />
              </div>
              <div className="photo-trail" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 30, zIndex: 2, pointerEvents: "none", willChange: "transform" }} />
              {/* Blurred overlay — clips away upward as sharp photo reveals below */}
              <div className="ascii-overlay" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
                <Image
                  src="/profile.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 90vw, 338px"
                  style={{ filter: "blur(14px)", transform: "scale(1.05)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span className="section-tag">{"// scroll to explore"}</span>
          <svg
            className="hero-scroll-chevron"
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M8 4L8 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path
              d="M2 14L8 20L14 14"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <About />
      <Experience />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Contact />
      <SectionDivider />
    </>
  );
}
