import { revalidatePath } from "next/cache";
import { invalidateCacheTags, type CacheTag } from "@/lib/cache/redis";

/**
 * Refreshes Redis + L1 caches AND Next.js ISR public website pages immediately
 * after an admin change.
 */
export async function revalidatePublicSite(
  extraPaths: string[] = [],
  tags: CacheTag[] = [
    "projects",
    "categories",
    "reviews",
    "content",
    "services",
    "settings",
    "overview",
    "badges",
  ]
): Promise<void> {
  await invalidateCacheTags(tags);
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/salon-concepts");
    revalidatePath("/reviews");
    revalidatePath("/sitemap.xml");
    for (const p of extraPaths) {
      if (p) revalidatePath(p);
    }
  } catch {
    // Safe no-op outside Next.js request lifecycle (e.g., CLI scripts)
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}
