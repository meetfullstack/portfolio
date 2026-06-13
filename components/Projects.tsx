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

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass flex flex-col rounded-2xl p-6 transition-all"
    >
      <p className="section-number mb-2">
        project.{String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="text-lg font-semibold">{project.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-sm font-medium">
        {project.github !== "" ? (
          /* Added missing '<a' */
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-text hover:opacity-80 transition-opacity"
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
            className="accent-text hover:opacity-80 transition-opacity"
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
    <section id="projects" className="mx-auto max-w-5xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-number mb-2"
      >
        02 // projects.work
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold sm:text-4xl"
      >
        Things I have built
      </motion.h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
