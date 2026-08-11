"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionDivider from "@/components/SectionDivider";

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

const education = [
  {
    degree: "Post-Graduate Diploma, Full Stack Software Development",
    school: "Lambton College",
    period: "2024 — 2025",
  },
];

const slideCount = 4;
const RING_RADIUS = 14;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ringFillRef = useRef<SVGCircleElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
        .from(".about-word", { opacity: 0, y: "100%", duration: 0.5, stagger: 0.08, ease: "power3.out" }, "-=0.2");

      // Users who prefer reduced motion get the slides stacked normally in
      // the JSX below — skip the scroll-hijacking pin/horizontal-drag
      // entirely rather than just speeding it up, since the disorientation
      // comes from the unexpected scroll direction, not the animation speed.
      if (reducedMotion) return;

      // Pin the ENTIRE box (top divider through bottom divider) once it's
      // centered in the viewport, then drag one full-width slide per "step"
      // of scroll before releasing back into normal vertical scroll.
      const pinTarget = pinRef.current;
      const track = trackRef.current;
      if (!pinTarget || !track) return;

      const slides = gsap.utils.toArray<HTMLElement>(".about-slide");

      const horizontalTween = gsap.to(track, {
        x: () => -window.innerWidth * (slideCount - 1),
        ease: "none",
        scrollTrigger: {
          trigger: pinTarget,
          start: () => `top center-=${pinTarget.offsetHeight / 2}`,
          end: () => `+=${window.innerWidth * (slideCount - 1)}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (ringFillRef.current) {
              ringFillRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - self.progress));
            }
          },
        },
      });

      // Subtle scale pulse per slide as it settles into place.
      slides.forEach((slide) => {
        gsap.fromTo(
          slide.querySelectorAll(".about-panel-reveal"),
          { scale: 0.96 },
          {
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: horizontalTween,
              start: "left 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  function handleSkillEnter(e: React.MouseEvent<HTMLSpanElement>) {
    gsap.to(e.currentTarget, { scale: 1.07, duration: 0.2, ease: "power2.out" });
  }

  function handleSkillLeave(e: React.MouseEvent<HTMLSpanElement>) {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
  }

  return (
    <section ref={sectionRef} id="about" className="relative">
      <div
        ref={pinRef}
        className="relative overflow-hidden"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <SectionDivider />

        <div
          className="section"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="container relative">
            <span aria-hidden="true" className="about-tag section-number">
              1
            </span>

            <div className="section-header relative flex items-center gap-4">
              <div>
                <p className="about-tag section-tag mb-3">01 // about.me</p>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ overflow: "hidden" }}>
                  {"Who I am".split(" ").map((word) => (
                    <span key={word} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}>
                      <span className="about-word" style={{ display: "inline-block" }}>{word}</span>
                    </span>
                  ))}
                </h2>
              </div>

              {/* circular progress ring, right after the heading — only meaningful during the scroll-drag, hidden when that's skipped for reduced motion */}
              {!reducedMotion && (
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                <circle cx="16" cy="16" r={RING_RADIUS} fill="none" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="3" />
                <circle
                  ref={ringFillRef}
                  cx="16"
                  cy="16"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE}
                />
              </svg>
              )}
            </div>
          </div>

          <div
            ref={trackRef}
            className={reducedMotion ? "flex flex-col" : "flex"}
            style={reducedMotion ? undefined : { width: "max-content" }}
          >
            <div className="about-slide flex-shrink-0" style={{ width: reducedMotion ? "100%" : "100vw" }}>
              <div className="container">
                <div className="about-panel-reveal card p-8 md:p-12">
                  <p className="section-tag mb-4">background</p>
                  <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                    Full-stack developer based in Toronto. I recently completed a
                    Post-Graduate Diploma in Full Stack Software Development at
                    Lambton College, with hands-on experience building UI components,
                    web applications, and backend services with NestJS.
                  </p>
                </div>
              </div>
            </div>

            <div className="about-slide flex-shrink-0" style={{ width: reducedMotion ? "100%" : "100vw" }}>
              <div className="container">
                <div className="about-panel-reveal card p-8 md:p-12">
                  <p className="section-tag mb-4">focus</p>
                  <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                    Lately going deep on agentic development workflows — building with
                    Claude Code, Codex CLI, and Cursor. Currently open to software
                    engineering and Data/AI roles in Toronto and remote.
                  </p>
                </div>
              </div>
            </div>

            <div className="about-slide flex-shrink-0" style={{ width: reducedMotion ? "100%" : "100vw" }}>
              <div className="container">
                <div className="about-panel-reveal card p-8 md:p-12">
                  <p className="section-tag mb-6">education</p>
                  <div className="flex flex-col gap-6 max-w-2xl">
                    {education.map((edu) => (
                      <div
                        key={edu.degree}
                        className="flex flex-col gap-1"
                        style={{
                          borderLeft: "2px solid rgba(168, 85, 247, 0.3)",
                          paddingLeft: "1rem",
                        }}
                      >
                        <p className="text-base font-semibold">{edu.degree}</p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {edu.school}
                        </p>
                        <p
                          className="text-sm"
                          style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                        >
                          {edu.period}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="about-slide flex-shrink-0" style={{ width: reducedMotion ? "100%" : "100vw" }}>
              <div className="container">
                <div className="about-panel-reveal card p-8 md:p-12">
                  <p className="section-tag mb-6">tech stack</p>
                  <div className="flex flex-wrap gap-3 max-w-2xl">
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
          </div>
        </div>

        <SectionDivider />
      </div>
    </section>
  );
}
