# Meet Upadhyay — Portfolio

Personal portfolio site for Meet Upadhyay, a full-stack developer. Built as a
single-page scrolling site (Hero, About, Experience, Projects, Contact) with
GSAP-driven scroll animations, plus separate case-study pages per project.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [GSAP](https://gsap.com) + [@gsap/react](https://gsap.com/resources/React) for scroll-triggered animation
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [next-view-transitions](https://github.com/shuding/next-view-transitions) for page transitions
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode
- [Resend](https://resend.com) + [Zod](https://zod.dev) for the contact form

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

### Environment variables

The contact form (`app/actions/contact.ts`) requires a [Resend](https://resend.com)
API key to send email. Copy `.env.example` to `.env.local` and fill in real
values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | API key from your Resend dashboard |
| `RESEND_FROM_EMAIL` | No | Verified sender address; falls back to Resend's shared `onboarding@resend.dev` if unset |

Without `RESEND_API_KEY`, the site still runs — only the contact form's send
action will fail.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # run ESLint
```

## Project structure

- `app/page.tsx` — the single-page home route; stacks Hero + all sections
- `components/` — section components (`About`, `Experience`, `Projects`, `Contact`, `Nav`, `Footer`, …)
- `app/projects/[slug]/` — individual project case-study pages
- `lib/projects.ts` — project case-study content/data
- `app/actions/contact.ts` — server action handling the contact form (validation, honeypot, rate limiting, email send)
