"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  title: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
};

const projects: Project[] = [
  {
    title: "QA Automation Suite",
    description:
      "End-to-end test suite built with Cypress, Selenium, JMeter, and GitHub Actions CI. Covers UI, API, and load testing with automated reporting.",
    tech: ["Cypress", "Selenium", "Python", "JMeter", "GitHub Actions"],
    github: "https://github.com/meetfullstack",
    live: "",
  },
  {
    title: "Portfolio Website",
    description:
      "Built with Next.js 16, TypeScript, and Tailwind CSS. Features a contact form and AI assistant. Deployed on Vercel.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    github: "https://github.com/meetfullstack/portfolio",
    live: "",
  },
  {
    title: "Your Third Project",
    description:
      "Describe the problem you solved, your approach, and the outcome. Keep it specific.",
    tech: ["React", "NestJS", "PostgreSQL"],
    github: "",
    live: "",
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, "0");

  function handleEnter(e: React.MouseEvent<HTMLDivElement>) {
    gsap.to(e.currentTarget, { y: -6, duration: 0.3, ease: "power2.out" });
  }

  function handleLeave(e: React.MouseEvent<HTMLDivElement>) {
    gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: "power2.out" });
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="project-card card flex flex-col p-8"
      style={{ willChange: "transform" }}
    >
      <p className="section-tag mb-3">project.{num}</p>
      <h3 className="text-xl font-semibold">{project.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {project.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="mt-6 flex gap-4 text-sm font-medium">
        {project.github !== "" && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-text transition-opacity hover:opacity-70"
          >
            GitHub →
          </a>
        )}
        {project.live !== "" && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-text transition-opacity hover:opacity-70"
          >
            Live →
          </a>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
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

      tl.from(".projects-tag", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
        .from(".projects-heading", { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .from(".project-card", {
          opacity: 0,
          y: 50,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
        }, "-=0.2");

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
      style={{
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="container">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="projects-tag section-tag mb-3">02 // projects.work</p>
            <h2 className="projects-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Things I have built
            </h2>
          </div>
          <span aria-hidden="true" className="projects-tag section-number">
            02
          </span>
        </div>
        <div className="mt-12" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
