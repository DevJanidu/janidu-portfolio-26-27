import type { MetadataRoute } from "next";
import { projects, siteUrl } from "@/lib/data";
import { getPublicCategories } from "@/lib/cms/queries";
import { and, eq, isNull } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const seenUrls = new Set<string>();

  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/salon-concepts`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const e of entries) seenUrls.add(e.url);

  for (const p of projects) {
    const u = `${siteUrl}/projects/${p.slug}`;
    if (!seenUrls.has(u)) {
      seenUrls.add(u);
      entries.push({ url: u, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
    }
  }

  try {
    const cats = await getPublicCategories();
    for (const c of cats) {
      const u = `${siteUrl}/categories/${c.slug}`;
      if (!seenUrls.has(u)) {
        seenUrls.add(u);
        entries.push({ url: u, lastModified: now, changeFrequency: "weekly", priority: 0.85 });
      }
    }

    if (isDatabaseConfigured()) {
      const cmsProjects = await getDb()
        .select({ slug: schema.projects.slug })
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.status, "published"),
            eq(schema.projects.isVisible, true),
            isNull(schema.projects.deletedAt)
          )
        );
      for (const p of cmsProjects) {
        const u = `${siteUrl}/projects/${p.slug}`;
        if (!seenUrls.has(u)) {
          seenUrls.add(u);
          entries.push({ url: u, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
        }
      }
    }
  } catch {
    // Fallback gracefully to static routes
  }

  return entries;
}
