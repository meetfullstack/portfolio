"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import SectionDivider from "@/components/SectionDivider";
import CornerButton from "@/components/CornerButton";
import Image from "next/image";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(
        [
          ".hero-tag",
          ".hero-heading",
          ".hero-line",
          ".hero-sub",
          ".hero-cta",
          ".hero-stats",
        ],
        {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
        },
      );

      gsap.from(".hero-image", {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.2,
      });
    },
    { scope: heroRef },
  );

  return (
    <>
      <section
        ref={heroRef}
        className="container grid min-h-[92vh] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="flex flex-col">
          <p className="hero-tag section-tag mb-8">
            {"// hello.world"} — available for work
          </p>

          <h1
            className="hero-heading font-bold tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", lineHeight: 1.2 }}
          >
            <span style={{ display: "block" }}>Hello, I&apos;m Meet —</span>
            <span className="accent-text" style={{ display: "block" }}>
              Full-Stack Developer.
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
            TypeScript. Currently open to software engineering and Data/AI roles
            in Toronto and remote.
          </p>

          <div className="hero-cta mt-10 flex flex-wrap gap-8">
            <CornerButton href="#projects" variant="primary">
              View my work
            </CornerButton>
            <CornerButton href="#contact" variant="secondary">
              Get in touch
            </CornerButton>
          </div>

          <div
            className="hero-stats flex gap-12"
            style={{ marginTop: "3.5rem" }}
          >
            <div>
              <p className="accent-text text-3xl font-bold">2+</p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                years experience
              </p>
            </div>
            <div>
              <p className="accent-text text-3xl font-bold">3+</p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                projects shipped
              </p>
            </div>
            <div>
              <p className="accent-text text-3xl font-bold">5+</p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                technologies
              </p>
            </div>
          </div>
        </div>

        <div className="hero-image hidden lg:flex lg:justify-end">
          <div className="hero-photo-frame">
            <Image
              src="/profile.jpg"
              alt="Meet Upadhyay"
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 0px, 338px"
            />
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
