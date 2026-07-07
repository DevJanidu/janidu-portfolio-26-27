# Janidu Yapa — Developer Portfolio

A production-ready developer portfolio built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **shadcn-style components**, and **Framer Motion**. Dark terminal aesthetic with an ember accent.

Palette: `#EB5E28` ember · `#252422` ink · `#403D39` charcoal · `#CCC5B9` sand · `#FFFCF2` cream.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Requires Node.js 18.18+ (Node 20+ recommended).

## Customize

Everything readable is in **`lib/data.ts`** — one file drives the whole site:
profile, socials, skills, projects + case studies, experience, education, open-source, and posts. Edit the arrays and the UI updates. No component edits needed for content.

Then:

1. Replace the placeholder URLs (`github.com/janidudev`, demo links, `siteUrl` in `app/layout.tsx`, `sitemap.ts`, `robots.ts`).
2. Drop `resume.pdf` into `/public` (the hero button links to `/resume.pdf`).
3. Add project screenshots and switch the card/case-study preview blocks to `next/image` (see below).

## Project structure

```
app/
  layout.tsx              Fonts, SEO metadata, skip link, navbar/footer
  page.tsx                Home — composes all sections
  globals.css             Theme tokens, terminal helpers, reduced-motion
  not-found.tsx           Terminal-styled 404
  sitemap.ts / robots.ts  SEO
  projects/[slug]/page.tsx  Case-study route (statically generated)
components/
  ui/                     shadcn-style Button, Card, Badge
  navbar / hero / about / skills / projects / project-card /
  open-source / experience / writing / contact / footer
  reveal.tsx              Scroll-reveal wrapper (Framer Motion)
  typing-effect.tsx       Hero typewriter
  section-heading.tsx     Command-line eyebrow + title
lib/
  data.ts                 ← all content
  utils.ts                cn() helper
```

## Component boundaries

Reusable, prop-driven pieces you can lift into other pages:

- **`Hero`** — animated terminal + typing roles.
- **`ProjectCard`** — takes a `Project`; used by the grid. Image-top / content-bottom, hover lift.
- **`Projects` (ProjectGrid)** — responsive grid over `featuredProjects`.
- **`SkillsCloud` (`Skills`)** — categorized icon/label grid, no progress bars.
- **`ExperienceTimeline` (`Experience`)** — vertical timeline; order = recency.
- **`ContactCTA` (`Contact`)** — email + accessible form.
- **`SectionHeading`** — shared eyebrow/title used across sections.

Server Components by default; only `navbar`, `hero`, `contact`, `reveal`, and `typing-effect` are client (`"use client"`) because they use state/effects/motion.

## Case-study routing

`app/projects/[slug]/page.tsx` reads from `projects` in `lib/data.ts`.
`generateStaticParams()` pre-renders one static page per project; `generateMetadata()` sets per-page titles. Add a project to the array → its case-study page exists automatically. (Next 15: `params` is a Promise and is `await`ed.)

## Image optimization

The card and case-study previews currently use a CSS mock so the site runs with zero image assets. To use real screenshots:

```tsx
import Image from "next/image";

<Image
  src={project.image}            // add `image` to the Project type + data
  alt={`${project.title} screenshot`}
  fill
  sizes="(max-width: 768px) 100vw, 33vw"
  className="object-cover"
/>
```

`next/image` handles AVIF/WebP, lazy loading, and sizing. Remote hosts are allowed in `next.config.mjs` (`remotePatterns`).

## SEO / metadata

Set in `app/layout.tsx` (title template, description, keywords incl. "developer portfolio", "full-stack developer portfolio", "Claude Code portfolio", OpenGraph, Twitter). Per-page metadata is set in each case study. `sitemap.ts` and `robots.ts` are generated automatically — update the base URL.

## Accessibility

Semantic landmarks (`header`/`main`/`nav`/`section`/`article`), a skip link, labeled form controls, `aria-expanded`/`aria-controls` on the menu, visible `:focus-visible` rings, and `prefers-reduced-motion` handling (CSS + Framer). Mobile-first with a keyboard-friendly hamburger menu.

## Contact form

`components/contact.tsx` confirms locally by default. Wire `handleSubmit` to a Next.js server action, Resend, or Formspree to actually deliver mail.

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel — framework preset **Next.js**, no extra config.
3. Set your production domain, then update `siteUrl` in `layout.tsx`, `sitemap.ts`, and `robots.ts`.

Also works on Netlify, Railway, or any Node host via `npm run build && npm start`.
