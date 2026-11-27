# JaniduDev — Security Architecture (`SECURITY_ARCHITECTURE.md`)

**Threat Model:** Single-administrator freelance CMS + private client/lead repository exposed on the public internet (`https://www.janidudev.com`). Primary assets to protect: admin account takeover, unauthorized modification of public portfolio content, leakage of private client/enquiry/review email addresses, spam/abuse of public forms and email quota, and malicious file uploads.

---

## 1. Authentication & Authorization (Better Auth)

### Framework & Plugins
- **Library:** `better-auth` (v1.x) using `drizzleAdapter(db, { provider: "pg" })` on Neon PostgreSQL.
- **Subpath Plugin Imports (tree-shaken):**
  - `twoFactor` (`better-auth/plugins/two-factor`) — Authenticator-app TOTP + encrypted single-use recovery codes.
  - `emailOTP` (`better-auth/plugins/email-otp`) — 6-digit email verification & password recovery codes delivered via Resend.
  - `nextCookies` (`better-auth/next-js`, placed **last** in `plugins`) — ensures cookies are set properly from Next.js Server Actions.

### Single-Admin Provisioning (Zero Public Sign-Up, Zero Hardcoded Passwords)
- Public registration is **disabled** (`emailAndPassword.disableSignUp: true` or blocked via Better Auth `databaseHooks.user.create.before` rejecting any email not authorized by the one-time CLI bootstrap).
- **Controlled First-Admin Setup:** A server-only CLI script (`scripts/create-admin.ts`) run once locally against Neon (interactive password prompt, never committed to git) creates the single `role: "admin"` account with email verification required.
- **Mandatory 2FA Before Production Use:** Admin layout checks `session.user.twoFactorEnabled`; if `false`, the administrator is routed to `/admin/setup-2fa` to scan the TOTP QR code and save recovery codes before accessing dashboard data.

### Defense-in-Depth Route Protection (Next.js 16)
1. **Layer 1 — `proxy.ts` (Fast Edge Cookie Check):**
   - Uses synchronous `getSessionCookie(request)` from `better-auth/cookies` (no DB call in proxy).
   - Redirects unauthenticated requests to `/admin/:path*` → `/login`.
2. **Layer 2 — Server Component & API Authorization (`requireAdmin()`):**
   - Every `/admin/**` page, Server Action, and `/api/admin/**` route calls a centralized `requireAdmin()` helper that invokes `auth.api.getSession({ headers: await headers() })`, verifies `session.user.role === "admin"`, verifies `session.user.emailVerified === true`, and verifies 2FA completion.
   - Direct HTTP requests to `/api/admin/**` without a valid signed admin session return `401 Unauthorized` (never rely on hiding UI buttons).

---

## 2. OTP, Password Recovery & Session Hardening

| Control | Configuration |
|---|---|
| OTP Format & Lifetime | 6-digit cryptographically random code, **5-minute expiration**, single-use |
| OTP Brute-Force Protection | Max **5 attempts** per code; previous codes invalidated immediately when a new code is requested |
| Resend Cooldown | **60-second cooldown** enforced server-side per email & IP |
| Account Enumeration Prevention | Forgot-password & OTP endpoints always return the same generic message (*"If an account exists for that email, we sent a verification code."*) |
| Session Cookies | `HttpOnly`, `Secure` (production), `SameSite=Lax`, signed cookie cache (`maxAge: 5 * 60` seconds), sliding expiry |
| Sensitive Action Re-Auth | Changing password, changing email, or disabling 2FA requires current password confirmation and invalidates all other active sessions |
| Rate Limiting | Better Auth built-in rate limiting stored in PostgreSQL (`rateLimit.storage: "database"` — safe across Vercel serverless instances), plus dedicated IP/email rate limiting on `/api/contact`, `/api/reviews`, `/api/translate`, and `/api/auth/*` |
| Secret Hygiene | Passwords, OTPs, TOTP secrets, recovery codes, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, and Neon S3 credentials (`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`) are **never** logged, returned in responses, or prefixed with `NEXT_PUBLIC_` |

---

## 3. Data Privacy & Public/Private Isolation

1. **Private Data Never Leaves Admin Boundaries:**
   - `clients`, `client_projects`, `client_project_milestones`, `inquiries`, `activity_logs`, `email_logs`, and `reviews.private_contact_email` are **only** queryable through `requireAdmin()` server helpers.
2. **Draft & Deleted Content Isolation:**
   - Every public data query (`getPublicCategories`, `getPublicProjects`, `getPublishedReviews`, `getPublicSections`, `getPublicServices`) explicitly filters `status = 'published' AND is_visible = TRUE AND deleted_at IS NULL`.
   - Public `sitemap.ts` only includes `status = 'published' AND is_visible = TRUE AND deleted_at IS NULL` URLs.
   - Draft Preview uses signed Next.js `draftMode()` cookies that can only be enabled by an authenticated admin session.
3. **Spam & Review Integrity:**
   - Public `/api/reviews` submissions revert to `status = 'pending'` (`approved = FALSE`) once the dashboard moderation inbox is live, protected by honeypot + Zod validation + rate limiting.

---

## 4. Input Validation, XSS, SQLi, CSRF & Safe URLs

- **SQL Injection Prevention:** 100% parameterized queries via Drizzle ORM / tagged Neon SQL — zero string concatenation in SQL.
- **XSS Prevention:**
  - The structured Website Content section builder stores strictly typed JSON fields validated by Zod schemas — **no arbitrary HTML, `<script>` tags, or custom JavaScript injection** is allowed anywhere in the CMS.
  - All external URLs (`live_url`, `demo_url`, `private_preview_url`, custom button links, social links) are validated server-side to allow only `https://`, `http://`, `mailto:`, or safe relative `/` paths (blocking `javascript:` and `data:` URIs).
- **CSRF Protection:** Better Auth validates `Origin` / `Referer` against trusted origins; Next.js Server Actions enforce built-in `Origin` checks.
- **Open Redirect Protection:** Post-login redirects only allow relative `/admin...` paths.

---

## 5. Secure Media Uploads (Neon Object Storage — S3-Compatible)

- Every upload goes through an admin-authenticated endpoint (`requireAdmin()`).
- **Server-side verification:**
  - Strict MIME type allowlist (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `video/webm`) — **SVG uploads disallowed** for untrusted content to prevent embedded script XSS.
  - Magic-byte header check on uploaded image buffers before uploading via `@aws-sdk/client-s3` (`PutObjectCommand`).
  - Hard file size caps (`10 MB` images, `50 MB` videos).
  - Randomized, sanitized object keys (`media/YYYY-MM/<uuid>.<ext>`).
  - Short-lived presigned URLs (`@aws-sdk/s3-request-presigner`, e.g., 5-minute expiry) for any large direct upload or private client file download, keeping S3 credentials strictly server-side.

---

## 6. HTTP Security Headers & SEO Separation

Retain and strengthen `next.config.mjs` headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` (production HTTPS)
- `X-Robots-Tag: noindex, nofollow` on `/admin/:path*`, `/login`, and `/api/:path*` (combined with `app/robots.ts` disallow rules — for search-engine hygiene only, never as a substitute for auth).

---

## 7. Audit Trail & Error Handling

- Every admin write operation logs a clean entry to `activity_logs` (who, what action, timestamp, IP).
- API routes catch internal errors server-side (logging sanitized error codes only) and return friendly, non-technical messages to the dashboard UI (*"Could not save your changes. Please try again."*).
