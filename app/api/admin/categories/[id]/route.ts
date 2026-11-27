import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite, slugify } from "@/lib/cms/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateCategorySchema = z.object({
  name: z.string().min(2).max(80).optional(),
  slug: z.string().min(2).max(80).optional(),
  sectionTitle: z.string().min(2).max(120).optional(),
  sectionSubtitle: z.string().max(180).optional().nullable(),
  description: z.string().max(1000).optional(),
  coverMediaId: z.string().optional().nullable(),
  iconName: z.string().max(40).optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
  isVisible: z.boolean().optional(),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  try {
    const raw = await request.json();
    const parsed = updateCategorySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check your category details." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updates: Partial<typeof schema.projectCategories.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.slug !== undefined) updates.slug = slugify(data.slug);
    if (data.sectionTitle !== undefined) updates.sectionTitle = data.sectionTitle.trim();
    if (data.sectionSubtitle !== undefined)
      updates.sectionSubtitle = data.sectionSubtitle?.trim() || null;
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.coverMediaId !== undefined) updates.coverMediaId = data.coverMediaId || null;
    if (data.iconName !== undefined) updates.iconName = data.iconName?.trim() || null;
    if (data.status !== undefined) updates.status = data.status;
    if (data.isVisible !== undefined) updates.isVisible = data.isVisible;
    if (data.seoTitle !== undefined) updates.seoTitle = data.seoTitle?.trim() || null;
    if (data.seoDescription !== undefined)
      updates.seoDescription = data.seoDescription?.trim() || null;

    const [updated] = await getDb()
      .update(schema.projectCategories)
      .set(updates)
      .where(eq(schema.projectCategories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    revalidatePublicSite([`/categories/${updated.slug}`]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Updated category "${updated.name}"`,
      entityType: "category",
      entityId: updated.id,
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not save your changes." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const db = getDb();

  try {
    const url = new URL(request.url);
    const moveToCategoryId = url.searchParams.get("moveToCategoryId") || null;

    const existingRows = await db
      .select()
      .from(schema.projectCategories)
      .where(eq(schema.projectCategories.id, id))
      .limit(1);

    const existing = existingRows[0];
    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Never silently delete projects! Either move them to a chosen category or keep them uncategorized.
    await db
      .update(schema.projects)
      .set({
        categoryId: moveToCategoryId && moveToCategoryId !== id ? moveToCategoryId : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.categoryId, id));

    await db
      .update(schema.projectCategories)
      .set({ deletedAt: new Date(), isVisible: false, status: "draft" })
      .where(eq(schema.projectCategories.id, id));

    revalidatePublicSite([`/categories/${existing.slug}`]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Deleted category "${existing.name}" (projects kept safe)`,
      entityType: "category",
      entityId: id,
    });

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete this category." },
      { status: 500 }
    );
  }
}
