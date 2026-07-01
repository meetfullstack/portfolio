"use client";

import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "next-view-transitions";
import { projects } from "@/lib/projects";
import type { ProjectDetail } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({ project }: { project: ProjectDetail }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-card work-card-custom"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
      }}
    >
      {/* Image area */}
      <div className="work-card-image" style={{ position: "relative", overflow: "hidden", background: "#0d0d0d", viewTransitionName: `project-img-${project.slug}` }}>
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="work-card-img"
            style={{ width: "100%", aspectRatio: "16/10", objectFit: "contain", display: "block", transition: "transform 0.6s ease" }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: "16/10", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "rgba(168,85,247,0.3)", letterSpacing: "0.15em" }}>
              {"// no preview yet"}
            </span>
          </div>
        )}
        {/* Hover gradient overlay */}
        <div className="work-card-overlay" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)",
          opacity: 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {/* Year + role */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "#a855f7",
            background: "rgba(168,85,247,0.1)",
            padding: "2px 7px",
            borderRadius: "2px",
            letterSpacing: "0.04em",
            fontWeight: 600,
          }}>
            {project.year}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            color: "var(--text-secondary)",
            letterSpacing: "0.03em",
          }}>
            {project.role}
          </span>
        </div>

        {/* Title */}
        <h3 className="work-card-title" style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          margin: "0.25rem 0 0",
          transition: "color 0.25s ease",
          viewTransitionName: `project-title-${project.slug}`,
        }}>
          {project.title}
        </h3>

        {/* Subtitle */}
        <p style={{
          fontSize: "0.875rem",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
          flex: 1,
        }}>
          {project.subtitle}
        </p>

        {/* Tech tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
          {project.tech.map((t) => (
            <span key={t} style={{
              border: "1px solid rgba(168,85,247,0.35)",
              padding: "3px 10px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "#a855f7",
              letterSpacing: "0.03em",
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* CTA — slides up on hover */}
        <div className="work-card-cta" style={{
          marginTop: "0.75rem",
          transform: "translateY(6px)",
          opacity: 0.7,
          transition: "transform 0.4s ease, opacity 0.4s ease",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "#a855f7",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          View case study <span className="work-card-arrow" style={{ display: "inline-block", transition: "transform 0.2s ease" }}>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Target position — GSAP lerps toward this
  const spotPos = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(spotPos.current, {
      x,
      y,
      duration: 0.15,
      ease: "power2.out",
      overwrite: true,
      onUpdate() {
        const el = spotlightRef.current;
        if (!el) return;
        const mask = `radial-gradient(300px circle at ${spotPos.current.x}px ${spotPos.current.y}px, black 20%, transparent 80%)`;
        el.style.maskImage = mask;
        el.style.webkitMaskImage = mask;
      },
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    gsap.to(spotlightRef.current, { opacity: 0, duration: 0.4, ease: "power2.out", overwrite: true });
  }, []);

  const handleMouseEnterSection = useCallback(() => {
    gsap.to(spotlightRef.current, { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: true });
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

      tl.from(".projects-tag",  { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
        .from(".projects-word", { opacity: 0, y: "100%", duration: 0.5, stagger: 0.08, ease: "power3.out" }, "-=0.2")
        .from(".project-card",     { opacity: 0, y: 50, duration: 0.7, stagger: 0.15, ease: "power3.out" }, "-=0.2");

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
      id="projects"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnterSection}
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)", position: "relative", overflow: "hidden" }}
    >
      {/* Base dot grid — dim, always visible */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(168,85,247,0.2) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />

      {/* Spotlight layer — glowing dots + purple wash, masked to cursor area */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          opacity: 0,
          // Two layers: glowing dots on top of purple glow
          backgroundImage: [
            "radial-gradient(circle, rgba(168,85,247,0.9) 1px, transparent 1px)",
            "radial-gradient(350px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(168,85,247,0.12), transparent 70%)",
          ].join(", "),
          backgroundSize: "20px 20px, 100% 100%",
          // Mask the glowing dots to only show near cursor
          maskImage: "radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), black 20%, transparent 80%)",
        } as React.CSSProperties}
      />

      <style>{`
        .work-card-custom:hover { border-color: rgba(168,85,247,0.4) !important; box-shadow: 0 12px 40px rgba(168,85,247,0.08); }
        .work-card-custom:hover .work-card-title { color: #a855f7 !important; }
        .work-card-custom:hover .work-card-cta { transform: translateY(0) !important; opacity: 1 !important; }
        .work-card-custom:hover .work-card-arrow { transform: translateX(4px); }
        .work-card-custom:hover .work-card-img { transform: scale(1.05); }
        .work-card-custom:hover .work-card-overlay { opacity: 1 !important; }
      `}</style>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="projects-tag section-tag mb-3">02 // projects.work</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {"Things I have built".split(" ").map((word) => (
                <span key={word} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}>
                  <span className="projects-word" style={{ display: "inline-block" }}>{word}</span>
                </span>
              ))}
            </h2>
          </div>
          <span aria-hidden="true" className="projects-tag section-number">02</span>
        </div>

        <div className="mt-12" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "1.5rem",
        }}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
