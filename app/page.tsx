"use client";

import { motion } from "framer-motion";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function Home() {
  return (
    <>
      <section className="container flex min-h-[92vh] flex-col justify-center">
        <motion.p {...fadeUp(0)} className="section-tag mb-4">
          available for work
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl"
        >
          Hi, I&apos;m Meet —{" "}
          <span className="accent-text">full-stack developer.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          I build fast, modern web applications with React, Next.js, and
          TypeScript. Currently open to software engineering and Data/AI roles
          in Toronto and remote.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-wrap gap-4">
          <a
            href="#projects"
            className="accent-gradient rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            View my work
          </a>

          <a
            href="#contact"
            className="rounded-full px-7 py-3 text-sm font-semibold transition-all"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            Get in touch
          </a>
        </motion.div>

        <motion.div
          {...fadeUp(0.5)}
          className="mt-20 flex gap-12"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}
        >
          <div>
            <p className="accent-text text-3xl font-bold">2+</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              years experience
            </p>
          </div>
          <div>
            <p className="accent-text text-3xl font-bold">3+</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              projects shipped
            </p>
          </div>
          <div>
            <p className="accent-text text-3xl font-bold">5+</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              technologies
            </p>
          </div>
        </motion.div>
      </section>

      <About />
      <Projects />
      <Contact />
    </>
  );
}
