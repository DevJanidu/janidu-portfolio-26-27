import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/cms/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (body.action === "restore") {
      const [restored] = await db
        .update(schema.reviews)
        .set({ deletedAt: null, status: "hidden", approved: false })
        .where(eq(schema.reviews.id, id))
        .returning();
      revalidatePublicSite(["/reviews"]);
      return NextResponse.json({ item: restored });
    }

    const updates: Partial<typeof schema.reviews.$inferInsert> = {
      moderatedAt: new Date(),
    };

    if (typeof body.status === "string") {
      updates.status = body.status;
      updates.approved = body.status === "published";
    }
    if (typeof body.featured === "boolean") updates.featured = body.featured;
    if (typeof body.clientName === "string") updates.clientName = body.clientName.trim();
    if (typeof body.businessName === "string") updates.businessName = body.businessName.trim() || null;
    if (typeof body.country === "string") updates.country = body.country.trim();
    if (typeof body.projectName === "string") updates.projectName = body.projectName.trim();
    if (typeof body.comment === "string") updates.comment = body.comment.trim();
    if (typeof body.rating === "number") updates.rating = body.rating;

    const [updated] = await db
      .update(schema.reviews)
      .set(updates)
      .where(eq(schema.reviews.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Review not found." }, { status: 404 });

    revalidatePublicSite(["/reviews"]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Updated review from "${updated.clientName}" (${updated.status})`,
      entityType: "review",
      entityId: updated.id,
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not update this review." },
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
  try {
    await getDb()
      .update(schema.reviews)
      .set({ deletedAt: new Date(), status: "trashed", approved: false })
      .where(eq(schema.reviews.id, id));
    revalidatePublicSite(["/reviews"]);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not move review to Trash." },
      { status: 500 }
    );
  }
}
