import { promises as fs } from "fs";
import path from "path";
import { ensureDatabaseSchema, getSql, isDatabaseConfigured } from "@/lib/db";

export type PublishedReview = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  projectName: string;
  comment: string;
  translation?: string;
  clientName: string;
  businessName?: string;
  location?: string;
  publishedAt: string; // ISO date YYYY-MM-DD
  featured?: boolean;
};

type StoredPublishedReview = PublishedReview & {
  approved?: boolean;
  displayPermission?: boolean;
  email?: never;
};

type DbReviewRow = {
  id: string;
  rating: number;
  project_name: string;
  comment: string;
  translation: string | null;
  client_name: string;
  business_name: string | null;
  country: string | null;
  published_at: string | Date;
  featured: boolean;
};

export type ReviewSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const PUBLISHED_REVIEWS_PATH = path.join(
  process.cwd(),
  "data",
  "published-reviews.json"
);

function isValidRating(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function formatIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : "2026-01-01";
}

async function getPublishedReviewsFromJson(): Promise<PublishedReview[]> {
  try {
    const raw = await fs.readFile(PUBLISHED_REVIEWS_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const sanitized: PublishedReview[] = [];
    for (const item of parsed as StoredPublishedReview[]) {
      if (!item || typeof item !== "object") continue;
      if (item.approved === false || item.displayPermission === false) continue;
      if (!isValidRating(item.rating)) continue;
      if (typeof item.comment !== "string" || !item.comment.trim()) continue;
      if (typeof item.projectName !== "string" || !item.projectName.trim())
        continue;
      if (typeof item.clientName !== "string" || !item.clientName.trim())
        continue;

      sanitized.push({
        id: String(item.id || `${item.clientName}-${item.publishedAt}`),
        rating: item.rating,
        projectName: item.projectName.trim(),
        comment: item.comment.trim(),
        ...(typeof item.translation === "string" && item.translation.trim()
          ? { translation: item.translation.trim() }
          : {}),
        clientName: item.clientName.trim(),
        ...(typeof item.businessName === "string" && item.businessName.trim()
          ? { businessName: item.businessName.trim() }
          : {}),
        ...(typeof item.location === "string" && item.location.trim()
          ? { location: item.location.trim() }
          : {}),
        publishedAt:
          typeof item.publishedAt === "string" && item.publishedAt.trim()
            ? item.publishedAt.trim()
            : "2026-01-01",
        featured: Boolean(item.featured),
      });
    }

    return sanitized.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } catch {
    return [];
  }
}

export async function getPublishedReviews(): Promise<PublishedReview[]> {
  if (isDatabaseConfigured()) {
    try {
      await ensureDatabaseSchema();
      const sql = getSql();
      // Strictly select only public columns; private_contact_email is never queried here.
      const rows = (await sql`
        SELECT
          id,
          rating,
          project_name,
          comment,
          translation,
          client_name,
          business_name,
          country,
          published_at,
          featured
        FROM reviews
        WHERE approved = TRUE AND display_permission = TRUE
        ORDER BY published_at DESC, created_at DESC
      `) as DbReviewRow[];

      const sanitized: PublishedReview[] = [];
      for (const row of rows) {
        const ratingNum = Number(row.rating);
        if (!isValidRating(ratingNum)) continue;
        sanitized.push({
          id: row.id,
          rating: ratingNum,
          projectName: row.project_name,
          comment: row.comment,
          ...(row.translation ? { translation: row.translation } : {}),
          clientName: row.client_name,
          ...(row.business_name ? { businessName: row.business_name } : {}),
          ...(row.country ? { location: row.country } : {}),
          publishedAt: formatIsoDate(row.published_at),
          featured: Boolean(row.featured),
        });
      }

      return sanitized;
    } catch (err) {
      console.error("Failed to load reviews from Neon, falling back to JSON:", err);
    }
  }

  return getPublishedReviewsFromJson();
}

export async function getFeaturedReviews(limit = 3): Promise<PublishedReview[]> {
  const all = await getPublishedReviews();
  if (all.length === 0) return [];
  const featured = all.filter((r) => r.featured);
  const rest = all.filter((r) => !r.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function computeReviewSummary(
  reviews: PublishedReview[]
): ReviewSummary | null {
  if (reviews.length === 0) return null;

  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    distribution[r.rating] += 1;
  }

  const average = Math.round((sum / reviews.length) * 10) / 10;
  return {
    count: reviews.length,
    average,
    distribution,
  };
}
