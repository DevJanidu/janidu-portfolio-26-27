import crypto from "crypto";
import { NextResponse } from "next/server";
import { asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite, slugify } from "@/lib/cms/revalidate";
import { cachedQuery } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const projectPayloadSchema = z.object({
  title: z.string().min(2, "Please enter a project name.").max(120),
  slug: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  classification: z
    .enum(["client_work", "demo", "design_concept", "personal"])
    .default("demo"),
  projectType: z.string().max(120).optional().default(""),
  shortDescription: z.string().max(500).optional().default(""),
  fullDescription: z.string().max(5000).optional().default(""),
  briefText: z.string().max(2000).optional().default(""),
  whatIBuiltJson: z.array(z.string()).optional().default([]),
  verifiedOutcomesJson: z.array(z.string()).optional().default([]),
  palette: z.string().max(80).optional().nullable(),
  clientName: z.string().max(120).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  completedAt: z.string().optional().nullable(),
  liveUrl: z.string().max(500).optional().nullable(),
  demoUrl: z.string().max(500).optional().nullable(),
  customLinksJson: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .optional()
    .default([]),
  coverMediaId: z.string().optional().nullable(),
  videoMediaId: z.string().optional().nullable(),
  showInLiveShowcase: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  showOnHomepage: z.boolean().optional().default(false),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  isVisible: z.boolean().optional().default(true),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  galleryMediaIds: z
    .array(
      z.object({
        mediaId: z.string(),
        deviceType: z.enum(["desktop", "mobile", "gallery"]).default("desktop"),
        title: z.string().optional().default(""),
        caption: z.string().optional().default(""),
        altText: z.string().optional().default(""),
      })
    )
    .optional(),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const url = new URL(request.url);
    const trashed = url.searchParams.get("trashed") === "true";

    const items = await cachedQuery(
      `adm:projects:${trashed ? "trashed" : "active"}`,
      async () => {
        const db = getDb();
        const [rows, cats, media] = await Promise.all([
          db
            .select()
            .from(schema.projects)
            .where(trashed ? isNotNull(schema.projects.deletedAt) : isNull(schema.projects.deletedAt))
            .orderBy(asc(schema.projects.displayOrder), desc(schema.projects.createdAt)),
          db.select({ id: schema.projectCategories.id, name: schema.projectCategories.name }).from(schema.projectCategories),
          db.select({ id: schema.mediaAssets.id, url: schema.mediaAssets.url }).from(schema.mediaAssets),
        ]);

        const catMap = new Map(cats.map((c) => [c.id, c.name]));
        const mediaMap = new Map(media.map((m) => [m.id, m.url]));

        return rows.map((p) => ({
          ...p,
          categoryName: p.categoryId ? catMap.get(p.categoryId) ?? "Uncategorized" : "Uncategorized",
          coverUrl: p.coverMediaId ? mediaMap.get(p.coverMediaId) ?? null : null,
        }));
      },
      { ttlSeconds: 180, l1TtlSeconds: 20, tags: ["projects", "categories", "media"] }
    );

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load projects." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const raw = await request.json();

    // Handle reorder
    if (Array.isArray(raw.reorderIds)) {
      const db = getDb();
      for (let i = 0; i < raw.reorderIds.length; i++) {
        await db
          .update(schema.projects)
          .set({ displayOrder: i + 1, updatedAt: new Date() })
          .where(eq(schema.projects.id, String(raw.reorderIds[i])));
      }
      revalidatePublicSite();
      return NextResponse.json({ reordered: true });
    }

    const parsed = projectPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check your project details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const db = getDb();
    const baseSlug = slugify(d.slug || d.title) || `project-${Date.now()}`;
    const existingSlug = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.slug, baseSlug))
      .limit(1);

    const finalSlug =
      existingSlug.length > 0 ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const maxOrderRes = await db
      .select({ max: sql<number>`coalesce(max(${schema.projects.displayOrder}), 0)::int` })
      .from(schema.projects);

    const projectId = crypto.randomUUID();
    const [created] = await db
      .insert(schema.projects)
      .values({
        id: projectId,
        categoryId: d.categoryId || null,
        title: d.title.trim(),
        slug: finalSlug,
        classification: d.classification,
        projectType: d.projectType.trim(),
        shortDescription: d.shortDescription.trim(),
        fullDescription: d.fullDescription.trim(),
        briefText: d.briefText.trim(),
        whatIBuiltJson: d.whatIBuiltJson.filter(Boolean),
        verifiedOutcomesJson: d.verifiedOutcomesJson.filter(Boolean),
        palette: d.palette?.trim() || null,
        clientName: d.clientName?.trim() || null,
        country: d.country?.trim() || null,
        completedAt: d.completedAt || null,
        liveUrl: d.liveUrl?.trim() || null,
        demoUrl: d.demoUrl?.trim() || null,
        customLinksJson: d.customLinksJson.filter((l) => l.label && l.url),
        coverMediaId: d.coverMediaId || null,
        videoMediaId: d.videoMediaId || null,
        showInLiveShowcase: d.showInLiveShowcase,
        isFeatured: d.isFeatured,
        showOnHomepage: d.showOnHomepage,
        displayOrder: (maxOrderRes[0]?.max ?? 0) + 1,
        status: d.status,
        isVisible: d.isVisible,
        seoTitle: d.seoTitle?.trim() || null,
        seoDescription: d.seoDescription?.trim() || null,
      })
      .returning();

    if (d.galleryMediaIds && d.galleryMediaIds.length > 0) {
      for (let i = 0; i < d.galleryMediaIds.length; i++) {
        const g = d.galleryMediaIds[i];
        await db.insert(schema.projectMedia).values({
          id: crypto.randomUUID(),
          projectId,
          mediaId: g.mediaId,
          deviceType: g.deviceType,
          title: g.title || "",
          caption: g.caption || "",
          altText: g.altText || d.title,
          displayOrder: i + 1,
        });
      }
    }

    revalidatePublicSite([`/projects/${created.slug}`]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Created project "${created.title}" (${created.status})`,
      entityType: "project",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("[projects POST]", err);
    return NextResponse.json(
      { error: "Could not create that project. Please try again." },
      { status: 500 }
    );
  }
}
