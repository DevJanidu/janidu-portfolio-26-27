import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { deleteFromNeonStorage, isNeonStorageConfigured } from "@/lib/storage";
import { invalidateCacheKeys, invalidateCacheTags } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  try {
    const body = await request.json();
    const altText = typeof body.altText === "string" ? body.altText.trim() : undefined;
    const folder = typeof body.folder === "string" ? body.folder.trim() : undefined;

    const updates: Partial<typeof schema.mediaAssets.$inferInsert> = {};
    if (altText !== undefined) updates.altText = altText;
    if (folder !== undefined && folder.length > 0) updates.folder = folder;

    const [updated] = await getDb()
      .update(schema.mediaAssets)
      .set(updates)
      .where(eq(schema.mediaAssets.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    await invalidateCacheTags(["media"]);
    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not save your changes." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const db = getDb();

  try {
    const existingRows = await db
      .select()
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.id, id))
      .limit(1);

    const existing = existingRows[0];
    if (!existing) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    // Check whether any gallery screenshot references this asset
    const usedInGallery = await db
      .select({ id: schema.projectMedia.id })
      .from(schema.projectMedia)
      .where(eq(schema.projectMedia.mediaId, id))
      .limit(1);

    const usedAsProjectCover = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(or(eq(schema.projects.coverMediaId, id), eq(schema.projects.videoMediaId, id)))
      .limit(1);

    if (usedInGallery.length > 0 || usedAsProjectCover.length > 0) {
      return NextResponse.json(
        {
          error:
            "This file is currently used by a project. Remove it from that project first before deleting it.",
        },
        { status: 409 }
      );
    }

    if (existing.storageProvider === "neon_s3" && existing.objectKey && isNeonStorageConfigured()) {
      await deleteFromNeonStorage(existing.objectKey).catch(() => {});
    }

    await db.delete(schema.mediaAssets).where(eq(schema.mediaAssets.id, id));
    await Promise.all([
      invalidateCacheTags(["media"]),
      invalidateCacheKeys([`media:signed:${id}`]),
    ]);

    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Deleted "${existing.fileName}" from Media Library`,
      entityType: "media",
      entityId: id,
    });

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete this file right now." },
      { status: 500 }
    );
  }
}
