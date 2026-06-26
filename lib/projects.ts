export type ProjectDetail = {
  slug: string;
  title: string;
  year: string;
  role: string;
  category: string;
  subtitle: string;
  image?: string;
  features: string[];
  tech: string[];
  github?: string;
  live?: string;
  content: { heading: string; body: string }[];
};

export const projects: ProjectDetail[] = [
  {
    slug: "qa-automation-suite",
    title: "QA Automation Suite",
    year: "2024",
    role: "Creator & Developer",
    category: "Testing",
    subtitle: "End-to-end test coverage across UI, API, and load — fully automated in CI.",
    features: [
      "Cypress UI test suite",
      "Selenium cross-browser testing",
      "JMeter load & performance tests",
      "GitHub Actions CI pipeline",
      "Automated HTML reporting",
    ],
    tech: ["Cypress", "Selenium", "Python", "JMeter", "GitHub Actions"],
    image: "/screenshots/qa-automation-suite.png",
    github: "https://github.com/meetfullstack",
    content: [
      {
        heading: "The Problem",
        body: "Manual testing was a bottleneck. Every release required hours of repetitive regression checks, bugs slipped through, and there was no visibility into performance under load.",
      },
      {
        heading: "What I Built",
        body: "A layered test suite that covers the full stack — Cypress for UI flows, Selenium for cross-browser coverage, Python scripts for API validation, and JMeter for load testing. Everything runs automatically on every pull request via GitHub Actions.",
      },
      {
        heading: "The Outcome",
        body: "Release confidence went up significantly. Regressions are caught before they ship, and the team has clear HTML reports after every run showing exactly what passed, failed, and how the system performed under stress.",
      },
    ],
  },
  {
    slug: "portfolio",
    title: "Portfolio Website",
    year: "2025",
    role: "Designer & Developer",
    category: "Web",
    subtitle: "A fast, animated portfolio built to stand out — not just another template.",
    features: [
      "GSAP scroll & entrance animations",
      "ASCII photo reveal effect",
      "ScrambleText hover interaction",
      "Dark / light theme toggle",
      "Contact form with validation",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Vercel"],
    image: "/screenshots/portfolio.png",
    live: "/",
    content: [
      {
        heading: "Why I Built It",
        body: "Most portfolios look the same. I wanted something that felt alive — where animations serve a purpose, interactions are deliberate, and the design reflects the quality of the work inside.",
      },
      {
        heading: "Technical Choices",
        body: "Built on Next.js 16 with TypeScript for type safety, Tailwind CSS v4 for styling, and GSAP for all animations. The photo reveal uses canvas-based ASCII art that transitions to the real image on load. ScrambleText animates between strings using a requestAnimationFrame loop — no library needed.",
      },
      {
        heading: "What I Learned",
        body: "Syncing GSAP timelines with React's render cycle takes care — especially with StrictMode double-invocation. Using window flags and CustomEvents turned out to be the cleanest way to coordinate the loader with hero animations across components.",
      },
    ],
  },
];

export function getProject(slug: string): ProjectDetail | undefined {
  return projects.find((p) => p.slug === slug);
}
