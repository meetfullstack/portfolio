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
    slug: "rubics",
    title: "Rubics",
    year: "2026",
    role: "Designer & Developer",
    category: "3D / Web",
    subtitle: "Solve your real Rubik's cube step by step, or play one in 3D right in the browser.",
    features: [
      "Paint your cube's colors on an unfolded map",
      "Validation with clear error messages",
      "Kociemba two-phase solver in a Web Worker",
      "Step-by-step 3D solution guide",
      "Free-play cube: drag a sticker to turn its row",
    ],
    tech: ["Next.js", "TypeScript", "three.js", "Tailwind CSS", "GSAP"],
    image: "/screenshots/rubics.png",
    github: "https://github.com/meetfullstack/rubics",
    content: [
      {
        heading: "What It Does",
        body: "Rubics has two modes. Solve: enter the colors of your physical cube on an unfolded map and follow a short (around 20 move) solution one move at a time, with a 3D cube showing every turn. Play: a real-time 3D cube with animated turns, scrambling and a move counter — drag a sticker to turn its row, or drag the background to spin the view.",
      },
      {
        heading: "How the Solver Works",
        body: "Sticker colors are checked first — 9 of each color, every corner and edge a real piece, no twisted or swapped pieces — so mistakes get a clear message instead of a broken solve. Valid cubes are solved with Herbert Kociemba's two-phase algorithm running in a Web Worker, so the page never freezes. The 3D guide starts from your exact cube by applying the solution in reverse to a solved cube.",
      },
      {
        heading: "Design Choices",
        body: "Built with Next.js, TypeScript, Tailwind CSS and three.js in the same purple liquid-glass design as this portfolio. Controls use plain labels like Top, Front and Right instead of cube notation, so anyone can use it without learning U/D/L/R first.",
      },
    ],
  },
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
    image: "/screenshots/qa-automation-suite.webp",
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
      "Scan-line photo reveal effect",
      "ScrambleText hover interaction",
      "Dark / light theme toggle",
      "Contact form with validation",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Vercel"],
    live: "/",
    content: [
      {
        heading: "Why I Built It",
        body: "Most portfolios look the same. I wanted something that felt alive — where animations serve a purpose, interactions are deliberate, and the design reflects the quality of the work inside.",
      },
      {
        heading: "Technical Choices",
        body: "Built on Next.js 16 with TypeScript for type safety, Tailwind CSS v4 for styling, and GSAP for all animations. The photo reveal layers a blurred copy over the sharp image and wipes it away with a clip-path scan line once the image has loaded. ScrambleText animates between strings using a requestAnimationFrame loop — no library needed.",
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
