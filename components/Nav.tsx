"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#contact", label: "Contact" },
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


export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoLineRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useGSAP(
    () => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -24,
        duration: 0.6,
        ease: "power3.out",
      });

      const nav = navRef.current;
      if (!nav) return;
      const hideBubble = () => gsap.to(bubbleRef.current, { opacity: 0, duration: 0.2, overwrite: true });
      nav.addEventListener("mouseleave", hideBubble);
      return () => nav.removeEventListener("mouseleave", hideBubble);
    },
    { scope: headerRef },
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      gsap.set(overlay, { display: "flex" });
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        ".mobile-nav-link",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power3.out", delay: 0.05 }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  function handleHashClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const href = e.currentTarget.getAttribute("href") ?? "";
    setMobileOpen(false);
    if (!href.startsWith("/#") && !href.startsWith("#")) return;
    // href is "/#section" — extract the hash and smooth-scroll only if on home page
    const hash = href.startsWith("/#") ? href.slice(1) : href;
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      const lenis = (window as Window & { __lenis?: { scrollTo: (el: Element, opts?: object) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(target, { offset: -80 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
    // No target on this page — let browser navigate to /#section normally
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
      overwrite: true,
    });

  }


  return (
    <>
    <header
      ref={headerRef}
      className="nav-header fixed top-0 left-0 right-0 z-50"
      style={{ position: "fixed" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "20px 32px" }}
      >
        {/* Logo: geometric M mark + meet.dev text, codedgar-style */}
        <Link
          ref={logoRef}
          href="/"
          onMouseEnter={handleLogoEnter}
          onMouseLeave={handleLogoLeave}
          onClick={() => { setMobileOpen(false); if (window.location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
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

        {/* Desktop nav — hidden below sm breakpoint */}
        <nav
          ref={navRef}
          aria-label="Main navigation"
          className="relative hidden sm:flex items-center gap-1"
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
              onClick={handleHashClick}
              onMouseEnter={handleMouseEnter}
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

        {/* Mobile hamburger — visible below sm breakpoint */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex sm:hidden"
          style={{
            position: "relative",
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            ...bubbleGlass,
          }}
        >
          <span style={{ position: "relative", width: 18, height: 12 }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 1.5,
                background: "var(--text-primary)",
                borderRadius: 999,
                top: mobileOpen ? "50%" : 0,
                transform: mobileOpen ? "translateY(-50%) rotate(45deg)" : "none",
                transition: "all 0.25s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 1.5,
                background: "var(--text-primary)",
                borderRadius: 999,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: mobileOpen ? 0 : 1,
                transition: "opacity 0.2s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 1.5,
                background: "var(--text-primary)",
                borderRadius: 999,
                bottom: mobileOpen ? "50%" : 0,
                transform: mobileOpen ? "translateY(50%) rotate(-45deg)" : "none",
                transition: "all 0.25s ease",
              }}
            />
          </span>
        </button>
      </div>
    </header>

    {/* Mobile overlay menu — rendered outside <header> so its "fixed" isn't
        trapped by the header's own GSAP transform (which creates a new
        containing block for fixed descendants). */}
    <nav
      ref={overlayRef}
      aria-label="Mobile navigation"
      style={{
        display: "none",
        position: "fixed",
        inset: 0,
        zIndex: 60,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={handleHashClick}
          className="mobile-nav-link"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.5rem",
            fontWeight: 500,
            letterSpacing: "0.03em",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
    </>
  );
}
