import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cachedSql: NeonQueryFunction<false, false> | null = null;
let cachedDb: NeonHttpDatabase<typeof schema> | null = null;

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
 * Lazy Drizzle ORM client over Neon HTTP (build-time safe; no Proxy wrapper).
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!cachedDb) {
    cachedDb = drizzle(getSql(), { schema });
  }
  return cachedDb;
}

// Backwards-compatible no-op schema check for legacy routes (schema is now managed via Drizzle migrations)
export async function ensureDatabaseSchema(): Promise<void> {
  return;
}

export { schema };
