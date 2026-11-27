# JaniduDev — Existing Portfolio Audit (`PORTFOLIO_AUDIT.md`)

**Audit Date:** 2026-11-27  
**Repository:** `janidu-portfolio-26-27` (Production origin: `https://www.janidudev.com`)  
**Purpose:** Independent freelance web development portfolio targeting paying small-business clients (US primary, plus UK, Australia, Canada, New Zealand, Singapore, UAE, Sri Lanka, and English-speaking Europe).

---

## 1. Technology Stack & Dependencies

| Layer | Current Implementation | Notes |
|---|---|---|
| Framework | Next.js `16.2.10` (App Router, Turbopack) | Uses Next.js 16 `proxy.ts` convention (replaces `middleware.ts`) |
| UI Runtime | React `19.2.7`, TypeScript `5.7.3` | Strict mode enabled |
| Styling | Tailwind CSS `3.4.17`, `tailwindcss-animate`, CVA, `clsx`, `tailwind-merge` | Single font (`Inter`), off-white `#FAF9F6`, near-black `#111827`, deep midnight blue `#091C44`, luminous `#CCFF00` accent |
| Motion | `framer-motion` `11.15.0`, `gsap` `3.15.0` | `gsap` is only used on legacy `/salon-details` |
| Icons | `lucide-react` `0.469.0` + custom inline SVG `<CountryFlag />` | Windows-safe colored SVG flags for 19 target countries |
| Database | Neon PostgreSQL via `@neondatabase/serverless` | Raw parameterized SQL in `lib/db.ts`; no ORM or migration tool yet |
| Email | `nodemailer` `9.0.3` (SMTP relay) | Used for `/api/contact` and optional review emails; Resend not yet installed |
| Auth | **None** | No login, sessions, roles, or protected routes exist yet |
| Media Storage | Local static files in `/public/assets/` | No upload pipeline or object storage yet |
| Analytics | Optional GA4 via `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`components/analytics.tsx`) | No first-party page/project click analytics yet |
| Linting | ESLint `9.18.0` + `eslint-config-next` `16.2.10` (`eslint.config.mjs`) | Passing with 0 errors |

---

## 2. Existing Routes & Layouts Audit

### Public Pages
| Route | Rendering | Data Source | Status & Notes |
|---|---|---|---|
| `/` | Dynamic (`force-dynamic`) | Hardcoded `lib/data.ts` + `lib/salon-concepts.ts` + live Neon `reviews` | Full-screen gradient hero, scroll-animated live iframe showcase (`Lucia Atelier` / `Milan Marble` / `Swiss Classic`), Featured Work (3 builds), Salon Concepts (3 items), 4-step Process, Reviews Preview (top 3), About, Contact Form |
| `/projects/[slug]` | SSG (`generateStaticParams`) | Hardcoded `projects` in `lib/data.ts` | Currently 6 slugs (`milan-marble`, `lucia-atelier`, `swiss-classic`, `sf-nail-spa`, `salon-eclat`, `havelock-law-firm`). Must become DB-driven while preserving all 6 public URLs |
| `/salon-concepts` | Static | Hardcoded `lib/salon-concepts.ts` | Displays 11 salon design concepts. Should evolve into dynamic category route `/categories/[slug]` with `/salon-concepts` preserved (or redirected/aliased) so existing links never break |
| `/reviews` | Dynamic (`force-dynamic`) | Live Neon `reviews` (fallback `data/published-reviews.json`) | Displays 46 approved reviews with Sort, Month, Rating, Country Flag filters, Globe Translate, and submission form |
| `/pricing` | Redirect | Redirects to `/#process` | Packages/pricing were intentionally removed; Services module in CMS will keep pricing optional and section visibility toggleable |
| `/salon-details` | Static | Legacy `lib/salon-data.ts` | Legacy ERP page; keep intact unless explicitly retired |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Dynamic/Static | `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` | **Audit finding:** `app/manifest.ts` still contains outdated `"Software Engineer & Full-Stack Developer"` text |

### API Routes
| Route | Methods | Current Behavior |
|---|---|---|
| `/api/contact` | `POST` | Validates inquiry (name, email, businessName, country, message, selectedDesign), inserts into Neon `inquiries`, optionally sends SMTP email / webhook |
| `/api/reviews` | `GET`, `POST` | `GET` returns approved public reviews (omits `private_contact_email`). `POST` validates and inserts into Neon `reviews` (**currently sets `approved = TRUE` immediately — needs to switch back to `approved = FALSE` once the Admin moderation inbox is live**) |
| `/api/translate` | `POST` | Server-side on-demand translation with in-memory cache |

---

## 3. Current Neon PostgreSQL Database Audit

Live inspection confirmed 2 tables in schema `public`:

1. **`reviews`** (`46` total rows, `46` approved)
   - Columns: `id`, `rating`, `project_name`, `comment`, `translation`, `client_name`, `business_name`, `country`, `private_contact_email`, `display_permission`, `approved`, `featured`, `published_at`, `created_at`.
   - Missing for full CMS: `status` enum (`published`, `pending`, `hidden`, `trashed`), `project_id` FK, `client_photo_url`, `source`, `display_order`, `deleted_at`, and moderation audit log.
2. **`inquiries`** (`0` rows)
   - Columns: `id`, `name`, `email`, `business_name`, `country`, `selected_design`, `package_name`, `message`, `status`, `created_at`.
   - Missing for full CMS: `phone`, `requested_service`, `budget`, `is_read`, `private_notes`, `converted_client_id`, `updated_at`, `deleted_at`.

---

## 4. Hardcoded Content That Must Become Dynamic

| Area | Current File(s) | What Must Be Manageable in Admin Dashboard |
|---|---|---|
| Hero & Brand Identity | `lib/data.ts`, `components/hero.tsx`, `components/navbar.tsx` | Site name, logo, favicon, hero headline, subheadline, button labels & destinations |
| Live Interactive Showcase | `components/live-project-showcase.tsx` | Which projects appear in the interactive embedded screen, default project, labels, show/hide toggle |
| Project Categories | Hardcoded only to Salons (`lib/salon-concepts.ts`) | Dynamic creation of any industry category (Salons, Restaurants, Hotels, Cleaning, Law Firms, Photographers, etc.) with cover image, title, subtitle, page link, order, draft/publish |
| Portfolio Projects | `lib/data.ts`, `lib/salon-concepts.ts` | Unified project records covering real client work, demo websites, design concepts, and personal projects — with screenshots, gallery, live/demo links, classification badge, featured toggle, category assignment, draft/publish, Trash |
| Customer Reviews | Neon `reviews` + `data/published-reviews.json` | Full moderation workflow (Approve, Hide, Reject, Trash, Restore, Feature, Reorder, Manual Add) without touching SQL |
| Website Content & Sections | `components/about.tsx`, `components/process-section.tsx`, `components/footer.tsx` | Editable About, Process steps, Payment note, Contact details (email, WhatsApp, location), Social links, Announcement banner, and structured custom sections (Text+Image, FAQ, Services, Stats, Gallery, CTA) |
| Services (Optional Pricing) | Currently hidden/absent | Manage freelance services with optional pricing (`USD`, `LKR`, etc., or custom quote), delivery time, features, and section show/hide |
| Clients & Client Projects | **Does not exist yet** | Private operational workspace to track paying clients, convert enquiries into clients, track project milestones, deposit/final 50% payment status, private preview links, launch dates, and one-click publish to portfolio |
| Media Assets | `/public/assets/project-images/*`, `/public/assets/salon-concepts/*`, `/public/logo-ribbon.png` | Centralized Media Library backed by object storage with upload, alt text, usage tracking, and delete warnings |

---

## 5. Environment Variable Names Audit (No Values Exposed)

Found in `.env.example` and `.env.local`:
- `DATABASE_URL` (Neon Postgres — configured in `.env.local`)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (**Audit issue:** `.env.example` line 6 has a duplicate key prefix typo and a real token)
- `NEXT_PUBLIC_BING_SITE_VERIFICATION` (**Audit issue:** `.env.example` contains a real token instead of a placeholder)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (**Audit issue:** `.env.example` contains a real measurement ID instead of a placeholder)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL`
- `CONTACT_WEBHOOK_URL`, `REVIEWS_WEBHOOK_URL`, `SUBMISSIONS_STORAGE_DIR`

---

## 6. Security & Hygiene Findings to Address

1. **No authentication layer yet:** Must introduce Better Auth (`email + password`, email verification, TOTP 2FA + recovery codes, email OTP via Resend) before exposing any `/admin` routes or admin APIs.
2. **Public review auto-approval:** `POST /api/reviews` currently inserts with `approved = TRUE`. Once the Admin Dashboard Review Moderation screen is live, revert default to `status = 'pending'` (`approved = FALSE`) so manual approval is required.
3. **No distributed rate limiting:** Public endpoints (`/api/contact`, `/api/reviews`, `/api/translate`) and upcoming `/api/auth/*` endpoints need IP + account rate limiting.
4. **Sanitize `.env.example`:** Replace real verification tokens/GA ID with placeholders and add placeholders for `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`, and optional `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
5. **Robots & Noindex:** Add `/admin` and `/login` to `app/robots.ts` disallow list and attach `robots: { index: false, follow: false }` to the admin layout (as SEO hygiene alongside mandatory server-side authentication).
6. **Stale `app/manifest.ts` copy:** Update from `"Software Engineer & Full-Stack Developer"` to the small-business freelance branding (and read dynamically from site settings once migrated).
7. **Image remotePatterns:** `next.config.mjs` currently sets `remotePatterns: []`; allowlist the Vercel Blob public hostname explicitly when Media Library uploads are enabled.
