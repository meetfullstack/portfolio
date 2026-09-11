"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experience } from "@/lib/experience";

gsap.registerPlugin(ScrollTrigger);

const HEADING = "Where I have worked";

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Parallax drift on the oversized section number, matching every other section.
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

      // Same reveal grammar as Projects/Contact — the OS reduced-motion
      // preference already zeroes CSS animation, so mirror that for GSAP.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // toggleActions rather than `once: true`: a `once` trigger kills itself
      // when it fires, and if that happens while ScrollTrigger is refreshing
      // (e.g. the page reloads already scrolled past it) the refresh loop
      // reads a removed entry and throws "reading 'end'". Same one-shot play.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
      });
      tl.from(".experience-tag", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
        .from(".experience-word", { opacity: 0, y: "100%", duration: 0.5, stagger: 0.08, ease: "power3.out" }, "-=0.2")
        .from(".experience-item", { opacity: 0, y: 40, duration: 0.6, stagger: 0.12, ease: "power3.out" }, "-=0.2");
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-labelledby="experience-title"
      className="section relative"
    >
      <div className="container relative">
        <span aria-hidden="true" className="experience-tag section-number">
          2
        </span>
        <div className="section-header relative">
          <p className="experience-tag section-tag mb-3">02 // experience</p>
          <h2
            id="experience-title"
            aria-label={HEADING}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {HEADING.split(" ").map((word, i) => (
              <span key={`${word}-${i}`} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}>
                <span className="experience-word" style={{ display: "inline-block" }}>{word}</span>
              </span>
            ))}
          </h2>
        </div>

        <ol className="experience-list">
          {experience.map((entry, i) => (
            <li key={`${entry.company}-${entry.period}`} className="experience-item">
              {/* Meta rail — sticks alongside the card on desktop so the
                  period/company stay visible while reading long entries. */}
              <div className="experience-meta">
                <p className="section-tag">[{String(i + 1).padStart(2, "0")}]</p>
                <p className="experience-period">{entry.period}</p>
                <p className="experience-company">{entry.company}</p>
                {entry.location && (
                  <p className="experience-location">{entry.location}</p>
                )}
              </div>

              <article className="experience-card card p-8">
                <h3 className="experience-role">{entry.role}</h3>
                <p className="experience-summary">{entry.summary}</p>
                <ul className="experience-highlights">
                  {entry.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <ul className="experience-tech" aria-label="Technologies">
                  {entry.tech.map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
