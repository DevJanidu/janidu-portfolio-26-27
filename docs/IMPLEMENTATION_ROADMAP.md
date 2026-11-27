# JaniduDev — Phased Implementation Roadmap (`IMPLEMENTATION_ROADMAP.md`)

**Rollback & Safety First:** Before Phase 1 starts, we will create a dedicated development branch (`feat/admin-cms`) from `main` and take a Neon database branch/snapshot backup so your live production site and existing 46 reviews stay 100% protected.

---

## Phase 0 — Environment & Manual Configuration Prerequisites
*Can be completed by you in ~15 minutes before or during Phase 1:*

1. **Resend Account & Domain Verification:**
   - Create a free Resend account, add a dedicated sending subdomain (e.g., `mail.janidudev.com`), and add the SPF/DKIM DNS records at your domain registrar (leaving your existing `hello@janidudev.com` MX records untouched).
   - Generate a server-side `RESEND_API_KEY`.
2. **Neon Object Storage (S3-Compatible):**
   - Create a bucket in Neon Object Storage and generate server-side S3 credentials (`S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_PUBLIC_BASE_URL` if using a public bucket/CDN).
3. **Better Auth Secret:**
   - Generate a 32-byte random `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) and set `BETTER_AUTH_URL=https://www.janidudev.com` in Vercel Production env vars (leave `BETTER_AUTH_URL` unset for Preview deployments).
4. **Sanitize `.env.example`:** Replace the real Google/Bing/GA values currently in `.env.example` with placeholders.

---

## Phase 1 — Database Schema, Drizzle Migrations & Content Seed
**Goal:** Establish the normalized Neon PostgreSQL schema without breaking or resetting existing data.
- Install `drizzle-orm`, `drizzle-kit`, `zod`.
- Define all tables in `lib/db/schema.ts` (Auth, Categories, Projects, Project Media, Reviews extensions, Clients, Client Projects, Milestones, Inquiries extensions, Website Sections, Services, Media Assets, Site Settings, Revisions, Activity Logs, Email Logs, Analytics Events).
- Generate and run additive Drizzle migrations against Neon.
- Run `scripts/migrate-existing-content.ts` to populate existing Categories (`Salons`, `Professional Services`), all 6 Projects + 11 Salon Design Concepts, existing `/public` media assets, Site Settings, and Homepage Sections — preserving all 46 existing Neon reviews.
- Fix `app/manifest.ts` stale metadata copy.

**Exit Check:** Existing public site still builds and runs identically; Neon holds all migrated data.

---

## Phase 2 — Better Auth, 2FA, Resend Emails & Admin Shell
**Goal:** Rock-solid, private administrator authentication and responsive dashboard frame.
- Install `better-auth` and `resend`.
- Configure `lib/auth.ts` (Drizzle adapter, `twoFactor`, `emailOTP`, `nextCookies`, database rate limiting, public sign-up disabled) and `lib/auth-client.ts`.
- Mount `app/api/auth/[...all]/route.ts` and Next.js 16 `proxy.ts` (cookie-only check for `/admin/:path*`).
- Build branded Resend email templates (`lib/email/templates.ts`): Email Verification, 6-Digit OTP, Password Reset, Password Changed Alert, New Enquiry Notification, Customer Acknowledgement.
- Build `/login`, `/forgot-password`, `/reset-password`, and `/admin/setup-2fa` (TOTP QR + recovery codes).
- Run `scripts/create-admin.ts` to provision your single administrator account securely.
- Build the clean, responsive `/admin` shell (Sidebar, Mobile Drawer, `View Website`, `Log Out`, Light/Dark/System theme toggle) and `/admin` Overview page.

**Exit Check:** Unauthenticated requests to `/admin` and `/api/admin/*` are blocked; login + TOTP 2FA + password recovery + signed-in devices all pass live testing.

---

## Phase 3 — Media Library, Dynamic Categories & Portfolio Projects CMS
**Goal:** Manage any industry category and showcase project with zero code edits.
- Install `@dnd-kit/core` + `@dnd-kit/sortable` (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, and `dotenv` already installed).
- Build **Media Library** (`/admin/media`) backed by Neon Object Storage (`lib/storage.ts`): drag-and-drop upload with server-side MIME/magic-byte/size validation, presigned URLs where needed, alt-text editor, folder filter, and in-use warning before deletion.
- Build **Dynamic Categories** (`/admin/categories`): create/edit/reorder/show-hide/draft-publish/safe-delete categories.
- Build **Portfolio Projects** (`/admin/projects`): 4-step wizard (`Details → Images → Links → Preview & Publish`), Real/Demo/Concept classification, duplicate, Trash & restore, live-showcase toggle, featured toggle.
- Connect public routes (`/`, `/projects/[slug]`, `/categories/[slug]`, `/salon-concepts`, `sitemap.ts`) to Neon via cached `lib/cms/*` queries with automatic `revalidateTag` / `revalidatePath` on publish.

**Exit Check:** Creating a brand-new `Restaurants` category + restaurant project in `/admin` immediately publishes it on the public website with zero code edits or redeploys.

---

## Phase 4 — Enquiries Inbox, Clients & Active Projects, and Review Moderation
**Goal:** Run your freelance business workflow end-to-end inside the dashboard.
- Build **Customer Enquiries** (`/admin/enquiries`): inbox view, unread counts, status pipeline (`New` → `Contacted` → `Discussing` → `Confirmed` → `Closed` → `Archived`), private notes, Reply by Email / WhatsApp, and one-click **Convert to Client**.
- Upgrade `POST /api/contact` to notify via Resend (with `Reply-To` set to the client) while keeping Neon storage + optional customer acknowledgement.
- Build **Clients & Client Projects** (`/admin/clients` & `/admin/clients/[id]`):
  - Manage client directory (name, business, email, WhatsApp, country flag, status, notes).
  - Track active client projects across your real workflow stages (`Proposal Sent` → `50% Deposit Paid` → `In Development` → `Private Preview Ready` → `Revisions` → `Final 50% Paid` → `Launched` → `Maintenance`), quote amount & currency, deposit/final payment flags, preview & live links, milestone checklist, and one-click **Copy to Portfolio Showcase**.
- Build **Customer Reviews** (`/admin/reviews`): `Awaiting Approval` / `Published` / `Hidden` / `Trash` tabs, Approve/Hide/Feature/Delete/Restore, manual testimonial entry, and revert public `POST /api/reviews` default to `Awaiting Approval` (`approved = FALSE`).

**Exit Check:** Submitting an enquiry on `/` sends a Resend alert, appears in `/admin/enquiries`, converts cleanly into a Client + Client Project, and new public reviews wait in `Awaiting Approval` until you click **Approve & Publish**.

---

## Phase 5 — Website Content Builder, Services, Settings & Analytics
**Goal:** Full no-code control over site copy, optional services, account security, and real metrics.
- Build **Website Content** (`/admin/content`): edit Hero, Live Showcase, Process, About, Contact, Footer, Announcement banner, and add/reorder structured custom sections (`Text & Image`, `FAQ`, `Gallery`, `Highlights`, `CTA`) with Draft Preview & Version History (Undo).
- Build **Services** (`/admin/services`): manage services with optional pricing (`USD`/`LKR`), delivery estimates, features, and public section show/hide toggle.
- Build **Settings** (`/admin/settings`): My Account, Website (logo, favicon, contact info, socials, SEO), Security (2FA, Signed-in Devices, Sign Out Others), Notifications, Appearance.
- Build **Analytics** (`/admin/analytics`): lightweight cookie-free first-party event tracking (`page_view`, `project_view`, `category_view`, `whatsapp_click`, `email_click`, `demo_click`, `enquiry_submit`) with real counts and clean empty states.

---

## Phase 6 — Comprehensive QA, Security Verification & Final Documentation
**Goal:** Production-ready quality and non-technical handoff.
- Execute the full 25-point QA & security test plan (auth, 2FA, OTP expiry/reuse, unauthorized API probes, category/project publish & draft isolation, client management, review moderation, invalid file upload rejection, mobile responsiveness, WCAG 2.2 AA contrast & keyboard navigation, production build).
- Deliver the post-implementation documentation:
  - `docs/DEVELOPER_SETUP.md` (env vars, migrations, Resend DNS, Vercel Blob, admin bootstrap)
  - `docs/ADMIN_USER_GUIDE.md` (simple, non-technical step-by-step guide)
  - `docs/TESTING_REPORT.md` (verified results of every tested workflow)

---

## Approval Gate
**No implementation code has been written yet.** Once you review these six documents and confirm (or request any adjustments to the navigation, client fields, or phases), we will create the `feat/admin-cms` branch and begin Phase 1 cleanly.
