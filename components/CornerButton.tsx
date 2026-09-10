"use client";

type CornerButtonProps = {
  href: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
  external?: boolean;
  /** Serve the target as a download; pass a string to set the saved filename. */
  download?: boolean | string;
  ariaLabel?: string;
};

export default function CornerButton({
  href,
  variant,
  children,
  external = false,
  download,
  ariaLabel,
}: CornerButtonProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const lenis = (window as Window & { __lenis?: { scrollTo: (el: Element, opts?: object) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(target, { offset: -84 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  return (
    <a
      href={href}
      className="btn-frame"
      onClick={handleClick}
      download={download}
      aria-label={ariaLabel}
      {...externalProps}
    >
      <span className={`btn btn--${variant}`}>{children}</span>
      <span className="btn-corner btn-corner--tl" aria-hidden="true" />
      <span className="btn-corner btn-corner--tr" aria-hidden="true" />
      <span className="btn-corner btn-corner--bl" aria-hidden="true" />
      <span className="btn-corner btn-corner--br" aria-hidden="true" />
    </a>
  );
}
