"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="font-mono text-sm font-bold accent-text">
          meet.dev
        </Link>

        <nav className="flex items-center gap-8">
          <ul className="hidden sm:flex items-center gap-8">
            <li>
              {/* Added missing '<a' */}
              <a
                href="#about"
                className="section-comment transition-colors hover:text-purple-400"
              >
                about
              </a>
            </li>
            <li>
              {/* Added missing '<a' */}
              <a
                href="#projects"
                className="section-comment transition-colors hover:text-purple-400"
              >
                projects
              </a>
            </li>
            <li>
              {/* Added missing '<a' */}
              <a
                href="#contact"
                className="section-comment transition-colors hover:text-purple-400"
              >
                contact
              </a>
            </li>
          </ul>
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}
