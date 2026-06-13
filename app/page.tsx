"use client";

import { motion } from "framer-motion";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <section className="mx-auto flex min-h-[90vh] max-w-5xl flex-col justify-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-number mb-4"
        >
          hello.world
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-bold leading-tight sm:text-7xl"
          style={{ color: "var(--text-primary)" }}
        >
          I&apos;m Meet —{" "}
          <span className="accent-text">full-stack developer.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Specializing in React, Next.js, and agentic development workflows.
          Currently open to software engineering and Data/AI roles in Toronto
          and remote.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          {/* Added missing '<a' here */}
          <a
            href="#projects"
            style={{ background: "var(--accent-gradient)" }}
            className="rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View my work
          </a>

          {/* Added missing '<a' here */}
          <a
            href="#contact"
            className="glass rounded-full px-6 py-3 text-sm font-medium transition-all hover:opacity-80"
            style={{ color: "var(--text-primary)" }}
          >
            Get in touch
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 flex gap-8 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <div>
            <span className="accent-text text-2xl font-bold">2+</span>
            <p className="mt-1">years experience</p>
          </div>
          <div>
            <span className="accent-text text-2xl font-bold">3+</span>
            <p className="mt-1">projects shipped</p>
          </div>
          <div>
            <span className="accent-text text-2xl font-bold">5+</span>
            <p className="mt-1">technologies</p>
          </div>
        </motion.div>
      </section>

      <About />
      <Projects />
      <Contact />
    </>
  );
}
