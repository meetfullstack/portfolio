"use client";

import { motion } from "framer-motion";

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

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="card flex flex-col p-8"
    >
      <p className="section-tag mb-3">project.{num}</p>
      <h3 className="text-xl font-semibold">{project.title}</h3>
      <p
        className="mt-3 flex-1 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {project.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-6 flex gap-4 text-sm font-medium">
        {project.github !== "" ? (
          /* Added missing '<a' */
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-text transition-opacity hover:opacity-70"
          >
            GitHub →
          </a>
        ) : null}
        {project.live !== "" ? (
          /* Added missing '<a' */
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-text transition-opacity hover:opacity-70"
          >
            Live →
          </a>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      style={{
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="container">
        <motion.p {...fadeUp(0)} className="section-tag mb-3">
          02 // projects.work
        </motion.p>
        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          Things I have built
        </motion.h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
