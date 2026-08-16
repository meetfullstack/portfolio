"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
        <span aria-hidden="true" className="section-number">
          2
        </span>
        <div className="section-header relative">
          <p className="section-tag mb-3">02 // experience</p>
          <h2 id="experience-title" className="text-4xl font-bold tracking-tight sm:text-5xl">Experience</h2>
        </div>
      </div>
    </section>
  );
}
