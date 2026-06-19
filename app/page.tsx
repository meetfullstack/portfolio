"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import SectionDivider from "@/components/SectionDivider";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(
        [".hero-tag", ".hero-heading", ".hero-sub", ".hero-cta", ".hero-stats"],
        {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
        }
      );
    },
    { scope: heroRef }
  );

  return (
    <>
      <section
        ref={heroRef}
        className="container flex min-h-[92vh] flex-col justify-center"
      >
        <p className="hero-tag section-tag mb-4">available for work</p>

        <h1 className="hero-heading max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl">
          Hi, I&apos;m Meet —{" "}
          <span className="accent-text">full-stack developer.</span>
        </h1>

        <p
          className="hero-sub mt-6 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          I build fast, modern web applications with React, Next.js, and
          TypeScript. Currently open to software engineering and Data/AI roles
          in Toronto and remote.
        </p>

        <div className="hero-cta mt-10 flex flex-wrap gap-4">
          <a
            href="#projects"
            className="accent-gradient rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            View my work
          </a>
          <a
            href="#contact"
            className="rounded-full px-7 py-3 text-sm font-semibold transition-all"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            Get in touch
          </a>
        </div>

        <div
          className="hero-stats mt-20 flex gap-12"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}
        >
          <div>
            <p className="accent-text text-3xl font-bold">2+</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              years experience
            </p>
          </div>
          <div>
            <p className="accent-text text-3xl font-bold">3+</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              projects shipped
            </p>
          </div>
          <div>
            <p className="accent-text text-3xl font-bold">5+</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              technologies
            </p>
          </div>
        </div>
      </section>

      <SectionDivider />
      <About />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Contact />
    </>
  );
}
