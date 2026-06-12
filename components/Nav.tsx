import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">
          Meet Upadhyay
        </Link>
        <ul className="flex gap-6 text-sm text-gray-600">
          <li>
            <a href="#about" className="hover:text-black">
              About
            </a>
          </li>
          <li>
            <a href="#projects" className="hover:text-black">
              Projects
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-black">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
