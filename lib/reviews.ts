import { promises as fs } from "fs";
import path from "path";

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
  // Guard against anyone accidentally copying private moderation fields into published-reviews.json
  email?: never;
};

export type ReviewSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const PUBLISHED_REVIEWS_PATH = path.join(process.cwd(), "data", "published-reviews.json");

function isValidRating(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function getPublishedReviews(): Promise<PublishedReview[]> {
  try {
    const raw = await fs.readFile(PUBLISHED_REVIEWS_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const sanitized: PublishedReview[] = [];
    for (const item of parsed as StoredPublishedReview[]) {
      if (!item || typeof item !== "object") continue;
      // Only include reviews explicitly approved (default true if placed in published-reviews.json unless approved === false)
      // and with display permission (unless explicitly false).
      if (item.approved === false || item.displayPermission === false) continue;
      if (!isValidRating(item.rating)) continue;
      if (typeof item.comment !== "string" || !item.comment.trim()) continue;
      if (typeof item.projectName !== "string" || !item.projectName.trim()) continue;
      if (typeof item.clientName !== "string" || !item.clientName.trim()) continue;

      // Explicitly pick ONLY public fields so private contact details can never leak.
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

export async function getFeaturedReviews(limit = 3): Promise<PublishedReview[]> {
  const all = await getPublishedReviews();
  if (all.length === 0) return [];
  const featured = all.filter((r) => r.featured);
  const rest = all.filter((r) => !r.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function computeReviewSummary(reviews: PublishedReview[]): ReviewSummary | null {
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
