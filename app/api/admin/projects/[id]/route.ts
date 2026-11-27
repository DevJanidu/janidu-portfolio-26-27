import crypto from "crypto";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite, slugify } from "@/lib/cms/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const db = getDb();

  try {
    const rows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id))
      .limit(1);

    const project = rows[0];
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const gallery = await db
      .select()
      .from(schema.projectMedia)
      .where(eq(schema.projectMedia.projectId, id))
      .orderBy(asc(schema.projectMedia.displayOrder));

    const media = await db.select().from(schema.mediaAssets);
    const mediaMap = new Map(media.map((m) => [m.id, m.url]));

    return NextResponse.json({
      item: {
        ...project,
        coverUrl: project.coverMediaId ? mediaMap.get(project.coverMediaId) ?? null : null,
        gallery: gallery.map((g) => ({
          ...g,
          url: mediaMap.get(g.mediaId) ?? null,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load project details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const db = getDb();

  try {
    const body = await request.json();

    // Handle restore from trash
    if (body.action === "restore") {
      const [restored] = await db
        .update(schema.projects)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(schema.projects.id, id))
        .returning();
      if (!restored) return NextResponse.json({ error: "Project not found." }, { status: 404 });
      revalidatePublicSite([`/projects/${restored.slug}`]);
      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Restored project "${restored.title}" from Trash`,
        entityType: "project",
        entityId: id,
      });
      return NextResponse.json({ item: restored });
    }

    // Handle duplicate
    if (body.action === "duplicate") {
      const rows = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, id))
        .limit(1);
      const src = rows[0];
      if (!src) return NextResponse.json({ error: "Project not found." }, { status: 404 });

      const newId = crypto.randomUUID();
      const [copy] = await db
        .insert(schema.projects)
        .values({
          ...src,
          id: newId,
          title: `${src.title} (Copy)`,
          slug: `${src.slug}-copy-${Date.now().toString().slice(-4)}`,
          status: "draft",
          isFeatured: false,
          showOnHomepage: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        })
        .returning();

      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Duplicated project "${src.title}"`,
        entityType: "project",
        entityId: copy.id,
      });

      return NextResponse.json({ item: copy }, { status: 201 });
    }

    // Standard update
    const updates: Partial<typeof schema.projects.$inferInsert> = {
      updatedAt: new Date(),
    };
    const fields = [
      "title",
      "categoryId",
      "classification",
      "projectType",
      "shortDescription",
      "fullDescription",
      "briefText",
      "whatIBuiltJson",
      "verifiedOutcomesJson",
      "palette",
      "clientName",
      "country",
      "completedAt",
      "liveUrl",
      "demoUrl",
      "customLinksJson",
      "coverMediaId",
      "videoMediaId",
      "showInLiveShowcase",
      "isFeatured",
      "showOnHomepage",
      "status",
      "isVisible",
      "seoTitle",
      "seoDescription",
    ] as const;

    for (const f of fields) {
      if (body[f] !== undefined) {
        (updates as Record<string, unknown>)[f] = body[f] === "" ? null : body[f];
      }
    }
    if (typeof body.slug === "string" && body.slug.trim()) {
      updates.slug = slugify(body.slug);
    }

    const [updated] = await db
      .update(schema.projects)
      .set(updates)
      .where(eq(schema.projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (Array.isArray(body.galleryMediaIds)) {
      await db.delete(schema.projectMedia).where(eq(schema.projectMedia.projectId, id));
      for (let i = 0; i < body.galleryMediaIds.length; i++) {
        const g = body.galleryMediaIds[i];
        if (!g?.mediaId) continue;
        await db.insert(schema.projectMedia).values({
          id: crypto.randomUUID(),
          projectId: id,
          mediaId: g.mediaId,
          deviceType: g.deviceType || "desktop",
          title: g.title || "",
          caption: g.caption || "",
          altText: g.altText || updated.title,
          displayOrder: i + 1,
        });
      }
    }

    revalidatePublicSite([`/projects/${updated.slug}`]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Updated project "${updated.title}"`,
      entityType: "project",
      entityId: updated.id,
    });

    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[projects PATCH]", err);
    return NextResponse.json(
      { error: "Could not save your project changes." },
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
  const url = new URL(request.url);
  const permanent = url.searchParams.get("permanent") === "true";

  try {
    const existingRows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id))
      .limit(1);
    const existing = existingRows[0];
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (permanent) {
      await db.delete(schema.projects).where(eq(schema.projects.id, id));
      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Permanently deleted project "${existing.title}"`,
        entityType: "project",
        entityId: id,
      });
    } else {
      await db
        .update(schema.projects)
        .set({ deletedAt: new Date(), isVisible: false, status: "draft" })
        .where(eq(schema.projects.id, id));
      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Moved project "${existing.title}" to Trash`,
        entityType: "project",
        entityId: id,
      });
    }

    revalidatePublicSite([`/projects/${existing.slug}`]);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete this project." },
      { status: 500 }
    );
  }
}
