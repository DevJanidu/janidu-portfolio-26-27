# JaniduDev Admin CMS — Developer Setup & Deployment Guide

## 1. Prerequisites
- Node.js 20+
- Neon PostgreSQL database (`DATABASE_URL`)
- Neon Object Storage S3-compatible bucket (`AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `STORAGE_BUCKET_NAME`)
- Resend API key (`RESEND_API_KEY`) for transactional emails (OTP, password reset, enquiry notifications)

## 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random 32+ byte secret for signing sessions (auto-generated locally by `migrate-cms.ts`) |
| `BETTER_AUTH_URL` | Base URL (`http://localhost:3000` locally, `https://www.janidudev.com` in production) |
| `AWS_ENDPOINT_URL_S3` | Neon Object Storage S3 endpoint URL |
| `AWS_ACCESS_KEY_ID` | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key |
| `AWS_REGION` | Bucket region (e.g. `auto` or `us-east-1`) |
| `STORAGE_BUCKET_NAME` | Target S3 bucket name |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `RESEND_FROM_EMAIL` | Verified sender address (e.g. `JaniduDev <noreply@janidudev.com>`) |
| `ADMIN_NOTIFICATION_EMAIL` | Where new enquiry/review alerts are sent (defaults to `hello@janidudev.com`) |

## 3. Database Migration & Initial Content Import
Run the strictly additive migration and idempotent content seed:
```bash
npx tsx scripts/migrate-cms.ts
```
This preserves all existing `reviews` and `inquiries` rows while creating the CMS, auth, media, and client-management tables.

## 4. Creating Your Private Admin Account
Public self-registration is disabled. Create your single admin account from the terminal:
```bash
npx tsx scripts/create-admin.ts
```
Follow the prompts to enter your email, display name, and a strong password (minimum 10 characters). Then sign in at `/login` and turn on **Two-Step Verification** in **Settings → Account Security**.

## 5. Local Development & Verification
```bash
npm run dev
```
- Public portfolio: `http://localhost:3000`
- Admin sign-in: `http://localhost:3000/login`
- Admin dashboard: `http://localhost:3000/admin`

## 6. Production Deployment (Vercel)
1. Add all production environment variables in Vercel Project Settings (`Production` and `Preview`).
2. Set `BETTER_AUTH_URL=https://www.janidudev.com` and `NEXT_PUBLIC_SITE_URL=https://www.janidudev.com`.
3. Verify your sending domain in Resend so `RESEND_FROM_EMAIL` sends from `@janidudev.com`.
4. Merge `feat/admin-cms` into `main` and deploy.
