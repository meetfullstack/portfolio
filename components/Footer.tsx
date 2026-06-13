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
          <Link href="/" className="font-mono text-sm font-bold accent-text">
            meet.dev
          </Link>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Built with Next.js 16, Tailwind CSS, and Framer Motion.
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Meet Upadhyay
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="section-tag mb-1">links</p>

          {/* Added missing '<a' */}
          <a
            href="https://github.com/meetfullstack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-purple-400"
            style={{ color: "var(--text-secondary)" }}
          >
            GitHub
          </a>

          {/* Added missing '<a' */}
          <a
            href="https://linkedin.com/in/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-purple-400"
            style={{ color: "var(--text-secondary)" }}
          >
            LinkedIn
          </a>

          {/* Added missing '<a' */}
          <a
            href="mailto:you@example.com"
            className="text-sm transition-colors hover:text-purple-400"
            style={{ color: "var(--text-secondary)" }}
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
