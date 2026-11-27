import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/lib/db";
import { cachedQuery } from "@/lib/cache/redis";

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  sectionTitle: string;
  sectionSubtitle: string | null;
  description: string;
  coverUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  projectCount: number;
}

export interface PublicProject {
  id: string;
  slug: string;
  title: string;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  classification: string;
  projectType: string;
  shortDescription: string;
  fullDescription: string;
  briefText: string;
  whatIBuilt: string[];
  verifiedOutcomes: string[];
  palette: string | null;
  clientName: string | null;
  country: string | null;
  completedAt: string | null;
  liveUrl: string | null;
  demoUrl: string | null;
  customLinks: Array<{ label: string; url: string }>;
  coverUrl: string | null;
  isFeatured: boolean;
  showOnHomepage: boolean;
  showInLiveShowcase: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  gallery: Array<{
    id: string;
    url: string;
    deviceType: string;
    title: string;
    caption: string;
    altText: string;
  }>;
}

export interface PublicService {
  id: string;
  name: string;
  description: string;
  features: string[];
  startingPrice: string | null;
  currency: string;
  deliveryEstimate: string | null;
  ctaLabel: string;
  ctaHref: string;
}

export async function getPublicSiteSettings() {
  if (!isDatabaseConfigured()) return null;
  try {
    return await cachedQuery(
      "pub:settings",
      async () => {
        const rows = await getDb()
          .select()
          .from(schema.siteSettings)
          .where(eq(schema.siteSettings.id, "default"))
          .limit(1);
        return rows[0] ?? null;
      },
      { ttlSeconds: 300, l1TtlSeconds: 30, tags: ["settings"] }
    );
  } catch {
    return null;
  }
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await cachedQuery(
      "pub:categories",
      async () => {
        const db = getDb();
        const [cats, projects, media] = await Promise.all([
          db
            .select()
            .from(schema.projectCategories)
            .where(
              and(
                eq(schema.projectCategories.status, "published"),
                eq(schema.projectCategories.isVisible, true),
                isNull(schema.projectCategories.deletedAt)
              )
            )
            .orderBy(asc(schema.projectCategories.displayOrder)),
          db
            .select({ id: schema.projects.id, categoryId: schema.projects.categoryId })
            .from(schema.projects)
            .where(
              and(
                eq(schema.projects.status, "published"),
                eq(schema.projects.isVisible, true),
                isNull(schema.projects.deletedAt)
              )
            ),
          db.select({ id: schema.mediaAssets.id, url: schema.mediaAssets.url }).from(schema.mediaAssets),
        ]);

        const mediaMap = new Map(media.map((m) => [m.id, m.url]));
        const countMap = new Map<string, number>();
        for (const p of projects) {
          if (p.categoryId) {
            countMap.set(p.categoryId, (countMap.get(p.categoryId) ?? 0) + 1);
          }
        }

        return cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          sectionTitle: c.sectionTitle,
          sectionSubtitle: c.sectionSubtitle,
          description: c.description,
          coverUrl: c.coverMediaId ? mediaMap.get(c.coverMediaId) ?? null : null,
          seoTitle: c.seoTitle,
          seoDescription: c.seoDescription,
          projectCount: countMap.get(c.id) ?? 0,
        }));
      },
      { ttlSeconds: 300, l1TtlSeconds: 30, tags: ["categories", "projects", "media"] }
    );
  } catch {
    return [];
  }
}

export async function getPublicCategoryBySlug(slug: string): Promise<{
  category: PublicCategory;
  projects: PublicProject[];
} | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const db = getDb();
    const catRows = await db
      .select()
      .from(schema.projectCategories)
      .where(
        and(
          eq(schema.projectCategories.slug, slug),
          eq(schema.projectCategories.status, "published"),
          eq(schema.projectCategories.isVisible, true),
          isNull(schema.projectCategories.deletedAt)
        )
      )
      .limit(1);

    const cat = catRows[0];
    if (!cat) return null;

    const [projRows, media] = await Promise.all([
      db
        .select()
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.categoryId, cat.id),
            eq(schema.projects.status, "published"),
            eq(schema.projects.isVisible, true),
            isNull(schema.projects.deletedAt)
          )
        )
        .orderBy(asc(schema.projects.displayOrder), desc(schema.projects.createdAt)),
      db.select({ id: schema.mediaAssets.id, url: schema.mediaAssets.url }).from(schema.mediaAssets),
    ]);

    const mediaMap = new Map(media.map((m) => [m.id, m.url]));

    const mappedProjects: PublicProject[] = projRows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      categoryId: p.categoryId,
      categorySlug: cat.slug,
      categoryName: cat.name,
      classification: p.classification,
      projectType: p.projectType,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      briefText: p.briefText,
      whatIBuilt: Array.isArray(p.whatIBuiltJson) ? p.whatIBuiltJson : [],
      verifiedOutcomes: Array.isArray(p.verifiedOutcomesJson) ? p.verifiedOutcomesJson : [],
      palette: p.palette,
      clientName: p.clientName,
      country: p.country,
      completedAt: p.completedAt,
      liveUrl: p.liveUrl,
      demoUrl: p.demoUrl,
      customLinks: Array.isArray(p.customLinksJson) ? p.customLinksJson : [],
      coverUrl: p.coverMediaId ? mediaMap.get(p.coverMediaId) ?? null : null,
      isFeatured: p.isFeatured,
      showOnHomepage: p.showOnHomepage,
      showInLiveShowcase: p.showInLiveShowcase,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      gallery: [],
    }));

    return {
      category: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        sectionTitle: cat.sectionTitle,
        sectionSubtitle: cat.sectionSubtitle,
        description: cat.description,
        coverUrl: cat.coverMediaId ? mediaMap.get(cat.coverMediaId) ?? null : null,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
        projectCount: mappedProjects.length,
      },
      projects: mappedProjects,
    };
  } catch {
    return null;
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<PublicProject | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.projects)
      .where(
        and(
          eq(schema.projects.slug, slug),
          eq(schema.projects.status, "published"),
          eq(schema.projects.isVisible, true),
          isNull(schema.projects.deletedAt)
        )
      )
      .limit(1);

    const p = rows[0];
    if (!p) return null;

    const [catRows, galleryRows, mediaRows] = await Promise.all([
      p.categoryId
        ? db
            .select()
            .from(schema.projectCategories)
            .where(eq(schema.projectCategories.id, p.categoryId))
            .limit(1)
        : Promise.resolve([]),
      db
        .select()
        .from(schema.projectMedia)
        .where(eq(schema.projectMedia.projectId, p.id))
        .orderBy(asc(schema.projectMedia.displayOrder)),
      db.select({ id: schema.mediaAssets.id, url: schema.mediaAssets.url }).from(schema.mediaAssets),
    ]);

    const mediaMap = new Map(mediaRows.map((m) => [m.id, m.url]));
    const cat = catRows[0];

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      categoryId: p.categoryId,
      categorySlug: cat?.slug ?? null,
      categoryName: cat?.name ?? null,
      classification: p.classification,
      projectType: p.projectType,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      briefText: p.briefText,
      whatIBuilt: Array.isArray(p.whatIBuiltJson) ? p.whatIBuiltJson : [],
      verifiedOutcomes: Array.isArray(p.verifiedOutcomesJson) ? p.verifiedOutcomesJson : [],
      palette: p.palette,
      clientName: p.clientName,
      country: p.country,
      completedAt: p.completedAt,
      liveUrl: p.liveUrl,
      demoUrl: p.demoUrl,
      customLinks: Array.isArray(p.customLinksJson) ? p.customLinksJson : [],
      coverUrl: p.coverMediaId ? mediaMap.get(p.coverMediaId) ?? null : null,
      isFeatured: p.isFeatured,
      showOnHomepage: p.showOnHomepage,
      showInLiveShowcase: p.showInLiveShowcase,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      gallery: galleryRows
        .map((g) => ({
          id: g.id,
          url: mediaMap.get(g.mediaId) ?? "",
          deviceType: g.deviceType,
          title: g.title,
          caption: g.caption,
          altText: g.altText || p.title,
        }))
        .filter((g) => Boolean(g.url)),
    };
  } catch {
    return null;
  }
}

export async function getPublicServices(): Promise<PublicService[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await cachedQuery(
      "pub:services",
      async () => {
        const rows = await getDb()
          .select()
          .from(schema.services)
          .where(and(eq(schema.services.isVisible, true), isNull(schema.services.deletedAt)))
          .orderBy(asc(schema.services.displayOrder));

        return rows.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          features: Array.isArray(s.featuresJson) ? s.featuresJson : [],
          startingPrice: s.startingPrice,
          currency: s.currency,
          deliveryEstimate: s.deliveryEstimate,
          ctaLabel: s.ctaLabel,
          ctaHref: s.ctaHref,
        }));
      },
      { ttlSeconds: 300, l1TtlSeconds: 30, tags: ["services"] }
    );
  } catch {
    return [];
  }
}

export async function getPublicCustomSections() {
  if (!isDatabaseConfigured()) return [];
  try {
    return await cachedQuery(
      "pub:sections:home",
      () =>
        getDb()
          .select()
          .from(schema.websiteSections)
          .where(
            and(
              eq(schema.websiteSections.pageKey, "home"),
              eq(schema.websiteSections.status, "published"),
              eq(schema.websiteSections.isVisible, true)
            )
          )
          .orderBy(asc(schema.websiteSections.displayOrder)),
      { ttlSeconds: 300, l1TtlSeconds: 30, tags: ["content"] }
    );
  } catch {
    return [];
  }
}
