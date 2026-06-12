export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-600 sm:flex-row">
        <p>© {new Date().getFullYear()} Meet Upadhyay</p>
        <ul className="flex gap-6">
          <li>
            <a
              href="https://github.com/meetfullstack"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/meetupadhy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="mailto:meetupadhyay158@gmail.com"
              className="hover:text-black"
            >
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
