"use client";

import { motion } from "framer-motion";

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

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

export default function About() {
  return (
    <section
      id="about"
      style={{
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="container">
        <motion.p {...fadeUp(0)} className="section-tag mb-3">
          01 // about.me
        </motion.p>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          Who I am
        </motion.h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <motion.div {...fadeUp(0.2)} className="card p-8">
            <p className="section-tag mb-4">background</p>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Full-stack developer based in Toronto. I recently completed a
              Post-Graduate Diploma in Full Stack Software Development at
              Lambton College, with hands-on experience building UI components,
              web applications, and backend services with NestJS.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="card p-8">
            <p className="section-tag mb-4">focus</p>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Lately going deep on agentic development workflows — building with
              Claude Code, Codex CLI, and Cursor. I enjoy working across the
              full stack and am currently open to software engineering and
              Data/AI roles in Toronto and remote.
            </p>
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.4)} className="card mt-5 p-8">
          <p className="section-tag mb-6">tech stack</p>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-default rounded-full px-4 py-2 text-xs font-medium"
                style={{
                  border: "1px solid rgba(168, 85, 247, 0.25)",
                  background: "rgba(168, 85, 247, 0.08)",
                  color: "#a855f7",
                }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
