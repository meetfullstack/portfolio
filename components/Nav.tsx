"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const links = [
  { href: "#about", label: "about" },
  { href: "#projects", label: "projects" },
  { href: "#contact", label: "contact" },
];

const navGlass = {
  background: "rgba(180,180,180,0.12)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: [
    "inset -0.3px -1px 4px 0px rgba(0,0,0,0.1)",
    "0px 4px 12px 0px rgba(0,0,0,0.1)",
    "0px 8px 32px 0px rgba(0,0,0,0.1)",
  ].join(", "),
};

const bubbleGlass = {
  background: "rgba(168,85,247,0.1)",
  boxShadow: [
    "inset 0 0 0 1px rgba(168,85,247,0.35)",
    "inset 2px 3px 0px -2px rgba(255,255,255,0.6)",
    "inset -2px -2px 0px -2px rgba(255,255,255,0.4)",
    "inset -0.3px -1px 4px 0px rgba(0,0,0,0.06)",
    "0px 4px 16px 0px rgba(168,85,247,0.15)",
    "0px 8px 24px 0px rgba(168,85,247,0.08)",
  ].join(", "),
};

export default function Nav() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50"
      style={{
        ...navGlass,
      }}
    >
      <div className="container flex items-center justify-between py-7">
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Link
            href="/"
            className="font-mono text-base font-bold accent-text"
            style={{ letterSpacing: "0.06em" }}
          >
            meet.dev
          </Link>
        </motion.div>

        <nav
          className="flex items-center gap-1"
          onMouseLeave={() => setHoveredLink(null)}
        >
          {links.map((link) => (
            /* Added missing '<a' */
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredLink(link.href)}
              style={{
                position: "relative",
                padding: "10px 22px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              {hoveredLink === link.href && (
                <motion.div
                  layoutId="navBubble"
                  style={{
                    position: "absolute",
                    inset: "5px 7px",
                    borderRadius: 999,
                    ...bubbleGlass,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.8,
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  color:
                    hoveredLink === link.href ? "#a855f7" : "var(--text-muted)",
                  transition: "color 0.25s ease",
                  letterSpacing: "0.04em",
                }}
              >
                {link.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
