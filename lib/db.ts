import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cachedSql: NeonQueryFunction<false, false> | null = null;
let schemaReadyPromise: Promise<void> | null = null;

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && url.startsWith("postgres"));
}

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!cachedSql) {
    cachedSql = neon(url);
  }
  return cachedSql;
}

/**
 * Ensures the `reviews` and `inquiries` tables exist in Neon Postgres.
 * Memoized per server instance so it runs at most once after cold start.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSql();

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
    })().catch((err) => {
      schemaReadyPromise = null;
      throw err;
    });
  }

  return schemaReadyPromise;
}
