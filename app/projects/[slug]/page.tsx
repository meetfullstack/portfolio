"use client";

import { useEffect, useRef } from "react";
import { notFound, useParams } from "next/navigation";
import { Link } from "next-view-transitions";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getProject, projects } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = getProject(slug);
  const headerRef = useRef<HTMLElement>(null);

  if (!project) notFound();

  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prev = projects[currentIndex - 1];
  const next = projects[currentIndex + 1];

  useEffect(() => {
    const lenis = (window as Window & { __lenis?: { scrollTo: (target: number, opts?: object) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header elements slide in
      gsap.from(".ph-back",     { opacity: 0, x: -16, duration: 0.5, ease: "power3.out", delay: 0.1 });
      gsap.from(".ph-meta",     { opacity: 0, y: 16, duration: 0.5, ease: "power3.out", delay: 0.2 });
      gsap.from(".ph-label",    { opacity: 0, y: 12, duration: 0.4, ease: "power3.out", delay: 0.3 });
      gsap.from(".ph-title",    { opacity: 0, y: 20, duration: 0.6, ease: "power3.out", delay: 0.35 });
      gsap.from(".ph-role",     { opacity: 0, y: 16, duration: 0.5, ease: "power3.out", delay: 0.45 });
      gsap.from(".ph-subtitle", { opacity: 0, y: 14, duration: 0.5, ease: "power3.out", delay: 0.5 });

      // Apply initial hidden state immediately so the image is never visible unblurred
      const frame = document.querySelector(".ph-image") as HTMLElement;
      const h = frame ? frame.offsetHeight : 400;
      gsap.set(".pi-reveal", { clipPath: `inset(${h}px 0px 0px 0px)`, filter: "blur(10px)" });
      gsap.set(".pi-blur",   { clipPath: "inset(0px 0px 0px 0px)" });
      gsap.set(".pi-trail",  { y: h });

      // Refresh ScrollTrigger after scroll-to-top so positions are correct
      ScrollTrigger.refresh();

      // Photo reveal — triggered on scroll
      ScrollTrigger.create({
        trigger: ".ph-image",
        start: "top 85%",
        once: true,
        onEnter: () => {
          const currentFrame = document.querySelector(".ph-image") as HTMLElement;
          const currentH = currentFrame ? currentFrame.offsetHeight : h;
          const D = 2.5;

          const tl = gsap.timeline();

          // Clip-path reveal from bottom
          tl.fromTo(".pi-reveal",
            { clipPath: `inset(${currentH}px 0px 0px 0px)`, filter: "blur(10px)" },
            { clipPath: "inset(0px 0px 0px 0px)", filter: "blur(0px)", duration: D, ease: "circ.inOut" });

          // Trail sweeps bottom → top
          gsap.set(".pi-trail", { y: currentH });
          tl.to(".pi-trail", { y: -30, duration: D, ease: "circ.inOut",
            onComplete: () => gsap.set(".pi-trail", { display: "none" }) }, 0);

          // Blurred overlay clips away upward
          tl.fromTo(".pi-blur",
            { clipPath: "inset(0px 0px 0px 0px)" },
            { clipPath: `inset(0px 0px ${currentH}px 0px)`, duration: D, ease: "circ.inOut" }, 0);

          // Shake + hue-rotate at 85%
          const shakeAt = D * 0.85;
          tl.to(".ph-image", { skewX: 1.5,  x:  3, duration: 0.04, ease: "none" }, shakeAt)
            .to(".ph-image", { skewX: -0.8, x: -2, duration: 0.04, ease: "none" }, shakeAt + 0.04)
            .to(".ph-image", { skewX: 0,    x:  0, duration: 0.03, ease: "power2.out" }, shakeAt + 0.08)
            .to(".pi-reveal", { filter: "blur(0px) hue-rotate(15deg)", duration: 0.05 }, shakeAt)
            .to(".pi-reveal", { filter: "blur(0px) hue-rotate(0deg)",  duration: 0.05 }, shakeAt + 0.05);
        },
      });

      // Sidebar + content
      gsap.from(".ph-sidebar", { opacity: 0, x: -20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".ph-details", start: "top 80%", once: true } });
      gsap.from(".ph-content", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out", delay: 0.1,
        scrollTrigger: { trigger: ".ph-details", start: "top 80%", once: true } });

      // Nav
      gsap.from(".ph-nav-link", { opacity: 0, y: 16, duration: 0.5, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".ph-nav", start: "top 90%", once: true } });
    });

    return () => ctx.revert();
  }, [slug]);

  return (
    <main>
      {/* ── Header ── */}
      <header
        ref={headerRef}
        style={{
          paddingTop: "calc(56px + 3rem)",
          paddingBottom: "3rem",
          background: "var(--bg-primary)",
        }}
      >
        <div className="container">
          {/* Back link */}
          <Link
            href="/#projects"
            className="ph-back"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "2rem",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#a855f7"; (e.currentTarget.querySelector(".back-arr") as HTMLElement).style.transform = "translateX(-4px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget.querySelector(".back-arr") as HTMLElement).style.transform = "translateX(0)"; }}
          >
            <span className="back-arr" style={{ display: "inline-block", transition: "transform 0.2s ease" }}>←</span>
            All Projects
          </Link>

          {/* Meta: year + category */}
          <div className="ph-meta" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 600,
              color: "#a855f7", background: "rgba(168,85,247,0.1)",
              padding: "3px 8px", borderRadius: "2px",
            }}>
              {project.year}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.65rem",
              color: "var(--text-secondary)", background: "var(--bg-card)",
              padding: "3px 8px", borderRadius: "2px",
            }}>
              {project.category}
            </span>
          </div>

          {/* Annotation */}
          <p className="ph-label section-tag" style={{ marginBottom: "0.75rem" }}>
            {"// project."}{project.slug.replace(/-/g, "_")}
          </p>

          {/* Title */}
          <h1
            className="ph-title"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "0.75rem",
              viewTransitionName: `project-title-${slug}`,
            }}
          >
            {project.title}
          </h1>

          {/* Role */}
          <p className="ph-role" style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            color: "#a855f7",
            marginBottom: "0.6rem",
          }}>
            {project.role}
          </p>

          {/* Subtitle */}
          <p className="ph-subtitle" style={{
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            maxWidth: 580,
          }}>
            {project.subtitle}
          </p>
        </div>
      </header>

      {/* ── Project image ── */}
      {project.image && (
        <section style={{ background: "var(--bg-secondary)", padding: "3rem 0" }}>
          <div className="container">
            <div
              className="ph-image"
              style={{
                maxWidth: 860, margin: "0 auto",
                viewTransitionName: `project-img-${slug}`,
                position: "relative", overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              {/* Sharp image — reveals upward */}
              <div className="pi-reveal" style={{ position: "relative", width: "100%" }}>
                <img
                  src={project.image}
                  alt={project.title}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              {/* Scanning trail */}
              <div className="pi-trail" style={{
                position: "absolute", left: 0, right: 0, top: 0, height: 30,
                zIndex: 2, pointerEvents: "none", willChange: "transform",
              }} />
              {/* Blurred overlay — clips away as sharp image reveals */}
              <div className="pi-blur" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
                <img
                  src={project.image}
                  alt=""
                  aria-hidden="true"
                  style={{ width: "100%", display: "block", filter: "blur(14px)", transform: "scale(1.05)" }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Details: sidebar + content ── */}
      <section
        className="ph-details"
        style={{
          padding: "4rem 0",
          background: "var(--bg-primary)",
        }}
      >
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "4rem" }}>

            {/* Sidebar */}
            <aside className="ph-sidebar" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Key Features */}
              <div style={{ paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  color: "var(--text-secondary)", textTransform: "uppercase",
                  letterSpacing: "0.12em", marginBottom: "0.75rem",
                }}>
                  Key Features
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {project.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)", alignItems: "flex-start" }}>
                      <span style={{ color: "#a855f7", fontFamily: "var(--font-mono)", flexShrink: 0 }}>+</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div style={{ paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  color: "var(--text-secondary)", textTransform: "uppercase",
                  letterSpacing: "0.12em", marginBottom: "0.75rem",
                }}>
                  Technologies
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {project.tech.map((t) => (
                    <span key={t} style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.63rem",
                      color: "#a855f7",
                      background: "rgba(168,85,247,0.08)",
                      border: "1px solid rgba(168,85,247,0.25)",
                      padding: "3px 8px",
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      fontFamily: "var(--font-mono)", fontSize: "0.78rem",
                      color: "#a855f7", textDecoration: "none",
                      padding: "0.6rem 1rem",
                      border: "1px solid rgba(168,85,247,0.4)",
                      transition: "background 0.2s ease, color 0.2s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a855f7"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#a855f7"; }}
                  >
                    View on GitHub <span>→</span>
                  </a>
                )}
                {project.live && project.live !== "/" && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      fontFamily: "var(--font-mono)", fontSize: "0.78rem",
                      color: "#a855f7", textDecoration: "none",
                      padding: "0.6rem 1rem",
                      border: "1px solid rgba(168,85,247,0.4)",
                      transition: "background 0.2s ease, color 0.2s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a855f7"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#a855f7"; }}
                  >
                    Visit Live Site <span>→</span>
                  </a>
                )}
              </div>
            </aside>

            {/* Content */}
            <div className="ph-content" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {project.content.map((section) => (
                <div key={section.heading}>
                  <h2 style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: "0.75rem",
                    color: "var(--text-primary)",
                  }}>
                    {section.heading}
                  </h2>
                  <p style={{
                    fontSize: "0.9375rem",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Project nav ── */}
      <section
        className="ph-nav"
        style={{ background: "var(--bg-secondary)", padding: "2.5rem 0", borderTop: "1px solid var(--border)" }}
      >
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {prev ? (
              <Link href={`/projects/${prev.slug}`} className="ph-nav-link" style={{
                display: "flex", flexDirection: "column", gap: "0.25rem",
                padding: "1rem 1.25rem", textDecoration: "none",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                minWidth: 180, transition: "border-color 0.2s ease",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,85,247,0.4)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>← Previous</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{prev.title}</span>
              </Link>
            ) : <div />}

            <Link href="/#projects" style={{
              fontFamily: "var(--font-mono)", fontSize: "0.7rem",
              color: "var(--text-secondary)", textDecoration: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
            }}>
              <span style={{ fontSize: "1rem" }}>⊞</span>
              All Projects
            </Link>

            {next ? (
              <Link href={`/projects/${next.slug}`} className="ph-nav-link" style={{
                display: "flex", flexDirection: "column", gap: "0.25rem",
                padding: "1rem 1.25rem", textDecoration: "none",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                minWidth: 180, textAlign: "right", transition: "border-color 0.2s ease",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,85,247,0.4)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>Next →</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{next.title}</span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>
    </main>
  );
}
