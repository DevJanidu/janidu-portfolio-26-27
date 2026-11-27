import crypto from "crypto";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/cms/revalidate";
import { cachedQuery } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const items = await cachedQuery(
      "adm:content:list",
      () =>
        getDb()
          .select()
          .from(schema.websiteSections)
          .orderBy(asc(schema.websiteSections.displayOrder)),
      { ttlSeconds: 180, l1TtlSeconds: 20, tags: ["content"] }
    );
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load website sections." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const db = getDb();

    if (body.id) {
      // Save previous snapshot to content_revisions before updating
      const prevRows = await db
        .select()
        .from(schema.websiteSections)
        .where(eq(schema.websiteSections.id, String(body.id)))
        .limit(1);
      const prev = prevRows[0];
      if (prev) {
        await db.insert(schema.contentRevisions).values({
          id: crypto.randomUUID(),
          entityType: "section",
          entityId: prev.id,
          snapshotJson: prev.contentJson as Record<string, unknown>,
          summary: `Updated "${prev.title}"`,
          createdBy: auth.session.user.id,
        });
      }

      const [updated] = await db
        .update(schema.websiteSections)
        .set({
          title: typeof body.title === "string" ? body.title.trim() : prev?.title || "Section",
          contentJson: body.contentJson ?? prev?.contentJson ?? {},
          isVisible: typeof body.isVisible === "boolean" ? body.isVisible : prev?.isVisible ?? true,
          status: body.status === "draft" ? "draft" : "published",
          updatedAt: new Date(),
        })
        .where(eq(schema.websiteSections.id, String(body.id)))
        .returning();

      revalidatePublicSite();
      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Updated website section "${updated?.title || "Section"}"`,
        entityType: "section",
        entityId: updated?.id,
      });

      return NextResponse.json({ item: updated });
    }

    const [created] = await db
      .insert(schema.websiteSections)
      .values({
        id: crypto.randomUUID(),
        pageKey: "home",
        templateType: String(body.templateType || "cta"),
        title: String(body.title || "New Section").trim(),
        contentJson: body.contentJson || {},
        displayOrder: 50,
        status: body.status === "draft" ? "draft" : "published",
        isVisible: body.isVisible !== false,
      })
      .returning();

    revalidatePublicSite();
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Added website section "${created.title}"`,
      entityType: "section",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save your website content." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing section." }, { status: 400 });

  try {
    await getDb()
      .delete(schema.websiteSections)
      .where(eq(schema.websiteSections.id, id));
    revalidatePublicSite();
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not remove this section." },
      { status: 500 }
    );
  }
}
