import crypto from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { slugify } from "@/lib/cms/revalidate";
import { invalidateCacheTags } from "@/lib/cache/redis";

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

    // Toggle a milestone checkbox
    if (body.action === "toggle_milestone" && body.milestoneId) {
      await db
        .update(schema.clientProjectMilestones)
        .set({
          isCompleted: Boolean(body.isCompleted),
          completedAt: body.isCompleted ? new Date() : null,
        })
        .where(eq(schema.clientProjectMilestones.id, String(body.milestoneId)));
      return NextResponse.json({ updated: true });
    }

    // Add a custom milestone
    if (body.action === "add_milestone" && typeof body.title === "string" && body.title.trim()) {
      const [m] = await db
        .insert(schema.clientProjectMilestones)
        .values({
          id: crypto.randomUUID(),
          clientProjectId: id,
          title: body.title.trim(),
          isCompleted: false,
          displayOrder: 99,
        })
        .returning();
      return NextResponse.json({ milestone: m }, { status: 201 });
    }

    // One-click Copy Launched Client Project to Portfolio Showcase (Draft)
    if (body.action === "copy_to_portfolio") {
      const cpRows = await db
        .select()
        .from(schema.clientProjects)
        .where(eq(schema.clientProjects.id, id))
        .limit(1);
      const cp = cpRows[0];
      if (!cp) return NextResponse.json({ error: "Project not found." }, { status: 404 });

      if (cp.portfolioProjectId) {
        return NextResponse.json({ portfolioProjectId: cp.portfolioProjectId });
      }

      const clientRows = await db
        .select()
        .from(schema.clients)
        .where(eq(schema.clients.id, cp.clientId))
        .limit(1);
      const client = clientRows[0];

      const portfolioId = crypto.randomUUID();
      const baseSlug = slugify(cp.title) || `client-project-${Date.now()}`;

      await db.insert(schema.projects).values({
        id: portfolioId,
        categoryId: cp.categoryId || null,
        title: cp.title,
        slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
        classification: "client_work",
        projectType: "Client Website",
        shortDescription: `Custom website built for ${client?.businessName || client?.name || cp.title}.`,
        clientName: client?.businessName || client?.name || null,
        country: client?.country || null,
        liveUrl: cp.liveSiteUrl || null,
        demoUrl: cp.privatePreviewUrl || null,
        status: "draft",
        isVisible: false,
      });

      await db
        .update(schema.clientProjects)
        .set({ portfolioProjectId: portfolioId, updatedAt: new Date() })
        .where(eq(schema.clientProjects.id, id));

      await invalidateCacheTags(["clients", "projects", "overview"]);
      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Copied "${cp.title}" to Portfolio as a Draft`,
        entityType: "project",
        entityId: portfolioId,
      });

      return NextResponse.json({ portfolioProjectId: portfolioId }, { status: 201 });
    }

    const updates: Partial<typeof schema.clientProjects.$inferInsert> = {
      updatedAt: new Date(),
    };
    const fields = [
      "title",
      "stage",
      "agreedAmount",
      "currency",
      "depositPaid",
      "finalPaid",
      "targetLaunchDate",
      "privatePreviewUrl",
      "liveSiteUrl",
      "privateNotes",
    ] as const;

    for (const f of fields) {
      if (body[f] !== undefined) {
        (updates as Record<string, unknown>)[f] = body[f] === "" ? null : body[f];
      }
    }

    const [updated] = await db
      .update(schema.clientProjects)
      .set(updates)
      .where(eq(schema.clientProjects.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    await invalidateCacheTags(["clients", "overview"]);
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[client-projects PATCH]", err);
    return NextResponse.json(
      { error: "Could not save client project changes." },
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
      .update(schema.clientProjects)
      .set({ deletedAt: new Date() })
      .where(eq(schema.clientProjects.id, id));
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not remove this project." },
      { status: 500 }
    );
  }
}
