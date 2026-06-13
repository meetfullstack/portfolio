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
  "Python",
  "Docker",
  "REST APIs",
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-number mb-2"
      >
        01 // about.me
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold sm:text-4xl"
      >
        Who I am
      </motion.h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <p className="section-number mb-3">background</p>
          <p className="text-sm leading-relaxed text-gray-500">
            Full-stack developer based in Toronto. I recently completed a
            Post-Graduate Diploma in Full Stack Software Development at Lambton
            College, with hands-on experience across the stack — from building
            UI components to backend work with NestJS.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <p className="section-number mb-3">focus</p>
          <p className="text-sm leading-relaxed text-gray-500">
            Lately I have been going deep on agentic development workflows —
            building with Claude Code, Codex CLI, and Cursor. Currently open to
            software engineering and Data/AI roles in Toronto and remote.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass mt-6 rounded-2xl p-6"
      >
        <p className="section-number mb-4">tech stack</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className="cursor-default rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
