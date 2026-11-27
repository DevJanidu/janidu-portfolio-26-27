import crypto from "crypto";
import { NextResponse } from "next/server";
import { asc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite, slugify } from "@/lib/cms/revalidate";
import { cachedQuery } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createCategorySchema = z.object({
  name: z.string().min(2, "Please enter a category name.").max(80),
  slug: z.string().optional(),
  sectionTitle: z.string().min(2, "Please enter a section title.").max(120),
  sectionSubtitle: z.string().max(180).optional().nullable(),
  description: z.string().max(1000).optional().default(""),
  coverMediaId: z.string().optional().nullable(),
  iconName: z.string().max(40).optional().nullable(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  isVisible: z.boolean().optional().default(true),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
});

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const items = await cachedQuery(
      "adm:categories:list",
      async () => {
        const db = getDb();
        const [categories, projectCounts, mediaRows] = await Promise.all([
          db
            .select()
            .from(schema.projectCategories)
            .where(isNull(schema.projectCategories.deletedAt))
            .orderBy(asc(schema.projectCategories.displayOrder), asc(schema.projectCategories.createdAt)),
          db
            .select({
              categoryId: schema.projects.categoryId,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.projects)
            .where(isNull(schema.projects.deletedAt))
            .groupBy(schema.projects.categoryId),
          db.select({ id: schema.mediaAssets.id, url: schema.mediaAssets.url }).from(schema.mediaAssets),
        ]);

        const countMap = new Map(projectCounts.map((r) => [r.categoryId, r.count]));
        const mediaMap = new Map(mediaRows.map((m) => [m.id, m.url]));

        return categories.map((cat) => ({
          ...cat,
          projectCount: countMap.get(cat.id) ?? 0,
          coverUrl: cat.coverMediaId ? mediaMap.get(cat.coverMediaId) ?? null : null,
        }));
      },
      { ttlSeconds: 180, l1TtlSeconds: 20, tags: ["categories", "projects", "media"] }
    );

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load project categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const raw = await request.json();

    // Handle reorder batch request
    if (Array.isArray(raw.reorderIds)) {
      const db = getDb();
      for (let i = 0; i < raw.reorderIds.length; i++) {
        await db
          .update(schema.projectCategories)
          .set({ displayOrder: i + 1, updatedAt: new Date() })
          .where(eq(schema.projectCategories.id, String(raw.reorderIds[i])));
      }
      revalidatePublicSite();
      await logActivity({
        actorUserId: auth.session.user.id,
        action: "Reordered project categories",
        entityType: "category",
      });
      return NextResponse.json({ reordered: true });
    }

    const parsed = createCategorySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check your category details." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = slugify(data.slug || data.name) || `category-${Date.now()}`;

    const db = getDb();
    const existingSlug = await db
      .select({ id: schema.projectCategories.id })
      .from(schema.projectCategories)
      .where(eq(schema.projectCategories.slug, baseSlug))
      .limit(1);

    const finalSlug = existingSlug.length > 0 ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const maxOrderRes = await db
      .select({ max: sql<number>`coalesce(max(${schema.projectCategories.displayOrder}), 0)::int` })
      .from(schema.projectCategories);

    const [created] = await db
      .insert(schema.projectCategories)
      .values({
        id: crypto.randomUUID(),
        name: data.name.trim(),
        slug: finalSlug,
        sectionTitle: data.sectionTitle.trim(),
        sectionSubtitle: data.sectionSubtitle?.trim() || null,
        description: data.description.trim(),
        coverMediaId: data.coverMediaId || null,
        iconName: data.iconName?.trim() || null,
        displayOrder: (maxOrderRes[0]?.max ?? 0) + 1,
        status: data.status,
        isVisible: data.isVisible,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
      })
      .returning();

    revalidatePublicSite([`/categories/${created.slug}`]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Created category "${created.name}"`,
      entityType: "category",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("[categories POST]", err);
    return NextResponse.json(
      { error: "Could not create that category. Please try again." },
      { status: 500 }
    );
  }
}
