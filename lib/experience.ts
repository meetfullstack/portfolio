// ─────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT — replace every entry with real roles before launch.
//
// Nothing below is a real employer, title, date, or achievement. The text is
// deliberately lorem-ipsum / clearly-labelled filler, with varied lengths so
// the Experience layout can be tested against long titles, long company
// names, many bullets, and many tags. Keep the shape; swap the values.
// ─────────────────────────────────────────────────────────────────────────

export type ExperienceEntry = {
  role: string;
  company: string;
  location?: string;
  /** Display string, e.g. "Jan 2024 — Present". */
  period: string;
  /** One-line framing of the role. Keep to ~2 sentences. */
  summary: string;
  /** What you did / shipped. 2–5 bullets scans best. */
  highlights: string[];
  tech: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "[Placeholder] Senior Full-Stack Software Engineer, Platform Team",
    company: "[Placeholder] Long Company Name Technologies Incorporated",
    location: "Toronto, ON · Hybrid",
    period: "Jan 2025 — Present",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    highlights: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ],
    tech: ["Placeholder A", "Placeholder B", "Placeholder C", "Placeholder D", "Placeholder E", "Placeholder F"],
  },
  {
    role: "[Placeholder] Frontend Developer",
    company: "[Placeholder] Studio",
    location: "Remote",
    period: "Jun 2023 — Dec 2024",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    highlights: [
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    ],
    tech: ["Placeholder A", "Placeholder B", "Placeholder C"],
  },
  {
    role: "[Placeholder] Software Developer Intern",
    company: "[Placeholder] Company",
    period: "May 2022 — Aug 2022",
    summary:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.",
    highlights: [
      "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
      "Et harum quidem rerum facilis est et expedita distinctio.",
      "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.",
    ],
    tech: ["Placeholder A", "Placeholder B"],
  },
];
