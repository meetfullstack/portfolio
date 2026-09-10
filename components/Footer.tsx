import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "3rem",
        paddingBottom: "3rem",
      }}
    >
      <div className="container flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/"
            className="font-mono text-sm font-bold"
            style={{ color: "var(--accent-text)" }}
          >
            Meet.dev
          </Link>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            Built with Next.js 16, Tailwind CSS, and GSAP.
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            © {new Date().getFullYear()} Meet Upadhyay
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="section-tag mb-1">links</p>

          <a
            href="https://github.com/meetfullstack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/meetupadhy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            LinkedIn
          </a>
          <a href="mailto:meetupadhyay158@gmail.com" className="text-link">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
