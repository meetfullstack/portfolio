"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "Tailwind CSS",
  "GitHub Actions",
  "Cypress",
  "Selenium",
  "Python",
  "REST APIs",
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      tl.from(".about-tag", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
        .from(".about-heading", { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .from(".about-card", {
          opacity: 0,
          y: 40,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
        }, "-=0.2")
        .from(".about-skill", {
          opacity: 0,
          scale: 0.85,
          duration: 0.3,
          stagger: 0.04,
          ease: "back.out(1.4)",
        }, "-=0.2");

      // Parallax drift on the oversized section number.
      gsap.to(".section-number", {
        yPercent: -28,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef }
  );

  function handleSkillEnter(e: React.MouseEvent<HTMLSpanElement>) {
    gsap.to(e.currentTarget, { scale: 1.07, duration: 0.2, ease: "power2.out" });
  }

  function handleSkillLeave(e: React.MouseEvent<HTMLSpanElement>) {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      style={{
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="container">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="about-tag section-tag mb-3">01 // about.me</p>
            <h2 className="about-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Who I am
            </h2>
          </div>
          <span aria-hidden="true" className="about-tag section-number">
            01
          </span>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="about-card card p-8">
            <p className="section-tag mb-4">background</p>
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Full-stack developer based in Toronto. I recently completed a
              Post-Graduate Diploma in Full Stack Software Development at
              Lambton College, with hands-on experience building UI components,
              web applications, and backend services with NestJS.
            </p>
          </div>
          <div className="about-card card p-8">
            <p className="section-tag mb-4">focus</p>
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Lately going deep on agentic development workflows — building with
              Claude Code, Codex CLI, and Cursor. Currently open to software
              engineering and Data/AI roles in Toronto and remote.
            </p>
          </div>
          <div className="about-card card p-8" style={{ gridColumn: "1 / -1" }}>
          <p className="section-tag mb-6">tech stack</p>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                onMouseEnter={handleSkillEnter}
                onMouseLeave={handleSkillLeave}
                className="about-skill tag cursor-default"
                style={{ display: "inline-block" }}
              >
                {skill}
              </span>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
