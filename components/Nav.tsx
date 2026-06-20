"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const navStyle = {
  background: "color-mix(in srgb, var(--bg-primary) 95%, transparent)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderBottom: "1px solid var(--border)",
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
  const headerRef = useRef<HTMLElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -24,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { scope: headerRef }
  );

  // Move the single shared bubble to whichever link is hovered — avoids mounting/unmounting
  function handleMouseEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    const nav = navRef.current;
    const bubble = bubbleRef.current;
    if (!nav || !bubble) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = e.currentTarget.getBoundingClientRect();

    gsap.to(bubble, {
      opacity: 1,
      x: linkRect.left - navRect.left + 7,
      width: linkRect.width - 14,
      duration: 0.3,
      ease: "power3.out",
    });

    // purple text on hovered link
    gsap.to(e.currentTarget.querySelector("span"), {
      color: "#a855f7",
      duration: 0.2,
    });
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    gsap.to(e.currentTarget.querySelector("span"), {
      color: "var(--text-muted)",
      duration: 0.2,
    });
  }

  function handleNavLeave() {
    gsap.to(bubbleRef.current, { opacity: 0, duration: 0.2 });
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={navStyle}
    >
      <div className="flex w-full items-center justify-between px-6 py-5 lg:px-12">
        <Link
          href="/"
          className="font-mono font-medium accent-text"
          style={{ fontSize: "13px", letterSpacing: "0.04em" }}
        >
          Meet.dev
        </Link>

        <nav
          ref={navRef}
          className="relative flex items-center gap-1"
          onMouseLeave={handleNavLeave}
        >
          {/* shared sliding bubble */}
          <div
            ref={bubbleRef}
            style={{
              position: "absolute",
              top: 5,
              bottom: 5,
              left: 0,
              width: 0,
              borderRadius: 999,
              opacity: 0,
              pointerEvents: "none",
              ...bubbleGlass,
            }}
          />

          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                position: "relative",
                padding: "10px 22px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.04em",
                }}
              >
                {link.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
