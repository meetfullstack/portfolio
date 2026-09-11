"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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

type EducationEntry = {
  degree: string;
  school: string;
  period: string;
  detail?: string;
  awards?: string;
  /** Path under /public, e.g. "/logos/lambton.png". Falls back to `initials`. */
  logo?: string;
  initials: string;
};

const education: EducationEntry[] = [
  {
    degree: "Ontario College Graduate Certificate, Full Stack Software Development",
    school: "Lambton College, Sarnia, Ontario",
    initials: "LC",
    period: "Sep 2023 — Apr 2025",
    detail: "Grade: 3.8/4.0 GPA",
    awards: "Dean’s List",
  },
  {
    degree: "Master’s degree, Computer Science",
    school: "Hemchandracharya North Gujarat University",
    initials: "HNGU",
    period: "Sep 2020 — Apr 2022",
    detail: "Grade: 3.7/4.0 GPA",
  },
  {
    degree: "Bachelor of Computer Applications, Computer Science",
    school: "Hemchandracharya North Gujarat University, Patan",
    initials: "HNGU",
    period: "Sep 2017 — Apr 2020",
    detail: "Grade: 3.7/4.0 GPA",
  },
];

// Same technologies as before, now one flat list for the ticker.
const stack = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "REST APIs",
  "Python",
  "Cypress",
  "Selenium",
  "GitHub Actions",
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgCardRef = useRef<HTMLElement>(null);
  const eduCardRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Like codedgar's ticker: only run the marquee while it's on screen.
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.classList.toggle("is-animating", entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
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
            scrollTrigger: { trigger: bgCard, start: "top 85%", toggleActions: "play none none none" },
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
            scrollTrigger: { trigger: eduCard, start: "top 85%", toggleActions: "play none none none" },
          })
          // fromTo + clearProps: an explicit end state, and no inline
          // transform left behind — a stranded y:40 made this gap look bigger.
          .fromTo(
            eduCard,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", clearProps: "transform,opacity" },
          )
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
    },
    { scope: sectionRef }
  );

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
              <p className="about-stage-label section-tag mb-4">
                {/* Person */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
                background
              </p>
              <h3 id="about-background" className="about-stage-title">
                Full-stack developer building fast, modern web applications
              </h3>
              <p className="about-stage-body">
                Based in Toronto. I recently completed an Ontario College Graduate Certificate in Full
                Stack Software Development at Lambton College, with hands-on experience building UI
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
              <p className="about-stage-label section-tag mb-4">
                {/* Graduation cap */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 9l10-5 10 5-10 5-10-5z" />
                  <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
                  <path d="M22 9v6" />
                </svg>
                education
              </p>
              <h3 id="about-education" className="sr-only">
                Education
              </h3>
              <ul className="about-edu-list">
                {education.map((e) => (
                  <li key={e.degree} className="about-edu">
                    {/* Decorative: the school name is right beside it. */}
                    <span className="about-edu-logo" aria-hidden="true">
                      {e.logo ? (
                        <Image src={e.logo} alt="" width={48} height={48} />
                      ) : (
                        e.initials
                      )}
                    </span>
                    <div className="about-edu-body">
                      <div className="about-edu-head">
                        <p className="about-edu-degree">{e.degree}</p>
                        <span className="about-edu-period">{e.period}</span>
                      </div>
                      <p className="about-edu-school">{e.school}</p>
                      {e.detail && <p className="about-edu-detail">{e.detail}</p>}
                      {e.awards && (
                        <p className="about-edu-detail">Awards: {e.awards}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            {/* ── 03 Tech stack — codedgar-style ticker inside the card. The
                list is duplicated for a seamless loop; the copy is
                aria-hidden so screen readers hear each technology once. */}
            <article className="about-stage card p-8" aria-labelledby="about-stack">
              <p className="about-stage-label section-tag mb-4">
                {/* Code brackets */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 6l-6 6 6 6" />
                  <path d="M16 6l6 6-6 6" />
                  <path d="M14 4l-4 16" />
                </svg>
                tech stack
              </p>
              <h3 id="about-stack" className="sr-only">
                Tech stack
              </h3>
              <div
                ref={tickerRef}
                className="tech-ticker"
                role="region"
                aria-label="Technologies and skills"
                tabIndex={0}
              >
                <div className="tech-ticker__track">
                  <ul className="tech-ticker__content">
                    {stack.map((item) => (
                      <li key={item} className="tech-ticker__item">{item}</li>
                    ))}
                  </ul>
                  <ul className="tech-ticker__content" aria-hidden="true">
                    {stack.map((item) => (
                      <li key={item} className="tech-ticker__item">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <SectionDivider />
    </section>
  );
}
