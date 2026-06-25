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

const bubbleGlass = {
  background: "rgba(168,85,247,0.08)",
  boxShadow: [
    "inset 0 0 0 1px rgba(168,85,247,0.25)",
    "inset 1px 2px 0px -1px rgba(255,255,255,0.5)",
    "inset -1px -2px 0px -1px rgba(255,255,255,0.3)",
    "0px 2px 12px 0px rgba(168,85,247,0.12)",
  ].join(", "),
};

function isDark() {
  return document.documentElement.classList.contains("dark");
}

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoLineRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -24,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { scope: headerRef },
  );

  function handleLogoEnter() {
    // color targets the <Link> — SVG inherits via currentColor, text also shifts
    gsap.to(logoRef.current, {
      color: "#a855f7",
      duration: 0.25,
      ease: "power2.out",
    });
    gsap.to(logoLineRef.current, {
      width: "100%",
      duration: 0.3,
      ease: "power2.out",
    });
  }

  function handleLogoLeave() {
    gsap.to(logoRef.current, {
      color: "var(--text-primary)",
      duration: 0.25,
      ease: "power2.out",
    });
    gsap.to(logoLineRef.current, {
      width: 0,
      duration: 0.2,
      ease: "power2.in",
    });
  }

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

    gsap.to(e.currentTarget.querySelector("span"), {
      color: "#a855f7",
      duration: 0.2,
    });
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    gsap.to(e.currentTarget.querySelector("span"), {
      color: isDark() ? "var(--text-muted)" : "var(--text-primary)",
      duration: 0.2,
    });
  }

  function handleNavLeave() {
    gsap.to(bubbleRef.current, { opacity: 0, duration: 0.2 });
  }

  return (
    <header
      ref={headerRef}
      className="nav-header fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="flex items-center justify-between"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 48px" }}
      >
        {/* Logo: geometric M mark + meet.dev text, codedgar-style */}
        <Link
          ref={logoRef}
          href="/"
          onMouseEnter={handleLogoEnter}
          onMouseLeave={handleLogoLeave}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          {/* Geometric MD mark — thick outline style */}
          <svg
            width="38"
            height="20"
            viewBox="0 -1 38 22"
            fill="none"
            aria-hidden="true"
          >
            <polyline
              points="2,18 2,2 10,11 18,2 18,18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="miter"
              strokeLinecap="butt"
            />
            <path
              d="M24,1 L24,17 L33,17 L36,14 L36,4 L33,1 Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="miter"
            />
          </svg>

          <span
            style={{
              position: "relative",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Meet.dev
            <span
              ref={logoLineRef}
              aria-hidden
              style={{
                position: "absolute",
                bottom: -2,
                left: 0,
                height: "1.5px",
                width: 0,
                background: "#a855f7",
                display: "block",
                borderRadius: 999,
              }}
            />
          </span>
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
                padding: "8px 18px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              <span
                className="nav-link-text"
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
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
