const projects = [
  {
    title: "QA Automation Suite",
    description:
      "End-to-end test suite built with Cypress, Selenium, JMeter, and GitHub Actions CI. Covers UI, API, and load testing with automated reporting.",
    tech: ["Cypress", "Selenium", "Python", "JMeter", "GitHub Actions"],
    github: "https://github.com/meetfullstack",
    live: "",
  },
  {
    title: "Portfolio Website",
    description:
      "This site — built with Next.js 16, TypeScript, and Tailwind CSS. Features a contact form, MDX blog, and an AI assistant. Deployed on Vercel.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    github: "https://github.com/meetfullstack/portfolio",
    live: "",
  },
  {
    title: "Your Third Project",
    description:
      "Describe the problem you solved, your approach, and the outcome. Keep it specific — vague descriptions get skipped.",
    tech: ["React", "NestJS", "PostgreSQL"],
    github: "",
    live: "",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="text-3xl font-bold">Projects</h2>
      <p className="mt-2 text-gray-600">
        A selection of things I&apos;ve built.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.title}
            className="flex flex-col rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
          >
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="mt-2 flex-1 text-sm text-gray-600">
              {project.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-4 text-sm font-medium">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub →
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Live →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
