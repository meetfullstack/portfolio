import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm accent-text font-bold">
          meet.upadhyay
        </Link>
        <ul
          className="flex items-center gap-6 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <li>
            <a
              href="#about"
              className="hover:text-purple-400 transition-colors"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#projects"
              className="hover:text-purple-400 transition-colors"
            >
              Projects
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="hover:text-purple-400 transition-colors"
            >
              Contact
            </a>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
