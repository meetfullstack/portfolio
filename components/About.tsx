"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionDivider from "@/components/SectionDivider";

gsap.registerPlugin(ScrollTrigger);

const HEADING = "Who I am";

// Quick-scan facts for the Background card. Every value comes from copy that
// already existed on the site — nothing here is invented.
const facts = [
  { label: "Based in", value: "Toronto, Canada" },
  { label: "Currently", value: "Full-stack developer" },
  { label: "Open to", value: "Software engineering & Data/AI roles, on-site or remote" },
];

const education = [
  {
    degree: "Post-Graduate Diploma, Full Stack Software Development",
    school: "Lambton College",
    period: "2024 — 2025",
    detail:
      "Hands-on program covering UI components, web applications, and backend services with NestJS.",
  },
];

const stack = [
  { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { group: "Backend & Data", items: ["Node.js", "NestJS", "PostgreSQL", "REST APIs", "Python"] },
  { group: "Testing & Delivery", items: ["Cypress", "Selenium", "GitHub Actions"] },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgCardRef = useRef<HTMLElement>(null);
  const eduCardRef = useRef<HTMLElement>(null);
  const stackCardRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Section header
      gsap
        .timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        })
        .from(".about-tag", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
        .from(".about-word", { opacity: 0, y: "100%", duration: 0.5, stagger: 0.08, ease: "power3.out" }, "-=0.2");

      // Background card — the site's signature scan-line reveal (same
      // language as the hero photo and project images): the card wipes in
      // top-to-bottom while a purple line rides the reveal edge.
      const bgCard = bgCardRef.current;
      if (bgCard) {
        gsap
          .timeline({
            scrollTrigger: { trigger: bgCard, start: "top 85%", once: true },
          })
          .fromTo(
            bgCard,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.9,
              ease: "power3.inOut",
              // Drop the property afterwards so it stops clipping the card's
              // outer glow once the reveal has finished.
              clearProps: "clipPath",
            },
          )
          .fromTo(
            ".about-scanline",
            { y: 0, opacity: 1 },
            { y: () => bgCard.offsetHeight, duration: 0.9, ease: "power3.inOut" },
            0,
          )
          .to(".about-scanline", { opacity: 0, duration: 0.25 }, "-=0.2")
          .from(
            ".about-fact",
            { opacity: 0, y: 14, duration: 0.45, stagger: 0.08, ease: "power2.out" },
            "-=0.5",
          );
      }

      // Education — records slide in from the left, then each date pill pops.
      const eduCard = eduCardRef.current;
      if (eduCard) {
        gsap
          .timeline({
            scrollTrigger: { trigger: eduCard, start: "top 85%", once: true },
          })
          .from(eduCard, { opacity: 0, y: 40, duration: 0.6, ease: "power3.out" })
          .from(
            ".about-edu",
            { opacity: 0, x: -24, duration: 0.55, stagger: 0.12, ease: "power3.out" },
            "-=0.3",
          )
          .from(
            ".about-edu-period",
            { opacity: 0, scale: 0.8, duration: 0.4, stagger: 0.12, ease: "back.out(2)" },
            "-=0.35",
          );
      }

      // Tech stack — group labels lead, then the tags cascade in with the
      // same scale gesture they use on hover.
      const stackCard = stackCardRef.current;
      if (stackCard) {
        gsap
          .timeline({
            scrollTrigger: { trigger: stackCard, start: "top 85%", once: true },
          })
          .from(stackCard, { opacity: 0, y: 40, duration: 0.6, ease: "power3.out" })
          .from(
            ".about-stack-label",
            { opacity: 0, x: -16, duration: 0.4, stagger: 0.15, ease: "power2.out" },
            "-=0.3",
          )
          // Scale only, never `y`: these tags also have hover tweens on
          // transform, and two tweens fighting over it left them stranded
          // mid-animation. clearProps hands transform back to the hover
          // handlers once the entrance is done.
          .from(
            ".about-stack-items .tag",
            {
              opacity: 0,
              scale: 0.85,
              duration: 0.4,
              stagger: 0.03,
              ease: "back.out(1.7)",
              clearProps: "transform",
            },
            "-=0.45",
          );
      }
    },
    { scope: sectionRef }
  );

  // overwrite kills any in-flight transform tween on this tag (e.g. the
  // entrance stagger) so hover always wins cleanly instead of interleaving.
  function handleSkillEnter(e: React.MouseEvent<HTMLLIElement>) {
    gsap.to(e.currentTarget, { scale: 1.07, duration: 0.2, ease: "power2.out", overwrite: "auto" });
  }

  function handleSkillLeave(e: React.MouseEvent<HTMLLIElement>) {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out", overwrite: "auto" });
  }

  return (
    <section ref={sectionRef} id="about" aria-labelledby="about-title" className="relative">
      <SectionDivider />

      <div className="section">
        <div className="container relative">
          <span aria-hidden="true" className="about-tag section-number">
            1
          </span>

          <div className="section-header relative">
            <p className="about-tag section-tag mb-3">01 // about.me</p>
            <h2
              id="about-title"
              aria-label={HEADING}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ overflow: "hidden" }}
            >
              {HEADING.split(" ").map((word, i) => (
                <span key={`${word}-${i}`} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}>
                  <span className="about-word" style={{ display: "inline-block" }}>{word}</span>
                </span>
              ))}
            </h2>
          </div>

          <div className="about-stages">
            {/* ── 01 Background ── */}
            <article
              ref={bgCardRef}
              className="about-stage about-stage--background card p-8"
              aria-labelledby="about-background"
            >
              <span className="about-scanline" aria-hidden="true" />
              <p className="section-tag mb-4">background</p>
              <h3 id="about-background" className="about-stage-title">
                Full-stack developer building fast, modern web applications
              </h3>
              <p className="about-stage-body">
                Based in Toronto. I recently completed a Post-Graduate Diploma in Full Stack
                Software Development at Lambton College, with hands-on experience building UI
                components, web applications, and backend services with NestJS. Lately I&apos;m
                going deep on agentic development workflows — building with Claude Code, Codex
                CLI, and Cursor.
              </p>
              <dl className="about-facts">
                {facts.map((f) => (
                  <div key={f.label} className="about-fact">
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            {/* ── 02 Education ── */}
            <article
              ref={eduCardRef}
              className="about-stage card p-8"
              aria-labelledby="about-education"
            >
              <p className="section-tag mb-4">education</p>
              <h3 id="about-education" className="sr-only">
                Education
              </h3>
              <ul className="about-edu-list">
                {education.map((e) => (
                  <li key={e.degree} className="about-edu">
                    <div className="about-edu-head">
                      <p className="about-edu-degree">{e.degree}</p>
                      <span className="about-edu-period">{e.period}</span>
                    </div>
                    <p className="about-edu-school">{e.school}</p>
                    <p className="about-edu-detail">{e.detail}</p>
                  </li>
                ))}
              </ul>
            </article>

            {/* ── 03 Tech stack ── */}
            <article
              ref={stackCardRef}
              className="about-stage card p-8"
              aria-labelledby="about-stack"
            >
              <p className="section-tag mb-4">tech stack</p>
              <h3 id="about-stack" className="sr-only">
                Tech stack
              </h3>
              <div className="about-stack">
                {stack.map((g) => (
                  <div key={g.group} className="about-stack-group">
                    <p className="about-stack-label">{g.group}</p>
                    <ul className="about-stack-items" aria-label={g.group}>
                      {g.items.map((item) => (
                        <li
                          key={item}
                          className="tag cursor-default"
                          onMouseEnter={handleSkillEnter}
                          onMouseLeave={handleSkillLeave}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>

      <SectionDivider />
    </section>
  );
}
