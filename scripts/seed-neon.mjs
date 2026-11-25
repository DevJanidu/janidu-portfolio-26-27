import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const rawVal = trimmed.slice(eq + 1).trim();
    const val = rawVal.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL in environment or .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      project_name TEXT NOT NULL,
      comment TEXT NOT NULL,
      translation TEXT,
      client_name TEXT NOT NULL,
      business_name TEXT,
      country TEXT NOT NULL DEFAULT 'USA',
      private_contact_email TEXT,
      display_permission BOOLEAN NOT NULL DEFAULT TRUE,
      approved BOOLEAN NOT NULL DEFAULT FALSE,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      published_at DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reviews_approved_published
    ON reviews (approved, display_permission, published_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      business_name TEXT,
      country TEXT NOT NULL DEFAULT 'USA',
      selected_design TEXT,
      package_name TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
    ON inquiries (created_at DESC)
  `;

  const seedPath = path.join(process.cwd(), "data", "published-reviews.json");
  const reviews = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  let inserted = 0;
  for (const r of reviews) {
    const res = await sql`
      INSERT INTO reviews (
        id, rating, project_name, comment, translation, client_name,
        business_name, country, display_permission, approved, featured, published_at
      )
      VALUES (
        ${r.id},
        ${r.rating},
        ${r.projectName},
        ${r.comment},
        ${r.translation ?? null},
        ${r.clientName},
        ${r.businessName ?? null},
        ${r.location ?? "USA"},
        ${r.displayPermission !== false},
        ${r.approved !== false},
        ${Boolean(r.featured)},
        ${r.publishedAt ?? "2026-01-01"}
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    if (res.length > 0) inserted += 1;
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM reviews WHERE approved = TRUE`;
  console.log(`Neon schema ready. Newly inserted: ${inserted}. Total approved reviews in Neon: ${count}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
