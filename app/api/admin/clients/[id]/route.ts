import { NextResponse } from "next/server";
import { asc, desc, eq, isNull, and } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { invalidateCacheTags } from "@/lib/cache/redis";

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
      .from(schema.clients)
      .where(eq(schema.clients.id, id))
      .limit(1);
    const client = rows[0];
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

    const projects = await db
      .select()
      .from(schema.clientProjects)
      .where(
        and(eq(schema.clientProjects.clientId, id), isNull(schema.clientProjects.deletedAt))
      )
      .orderBy(desc(schema.clientProjects.createdAt));

    const milestones = await db
      .select()
      .from(schema.clientProjectMilestones)
      .orderBy(asc(schema.clientProjectMilestones.displayOrder));

    const milestoneMap = new Map<string, typeof milestones>();
    for (const m of milestones) {
      const list = milestoneMap.get(m.clientProjectId) || [];
      list.push(m);
      milestoneMap.set(m.clientProjectId, list);
    }

    return NextResponse.json({
      item: {
        ...client,
        projects: projects.map((p) => ({
          ...p,
          milestones: milestoneMap.get(p.id) || [],
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load client profile." },
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
  try {
    const body = await request.json();
    const updates: Partial<typeof schema.clients.$inferInsert> = {
      updatedAt: new Date(),
    };
    for (const key of ["name", "businessName", "email", "phone", "country", "status", "privateNotes"] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const [updated] = await getDb()
      .update(schema.clients)
      .set(updates)
      .where(eq(schema.clients.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Client not found." }, { status: 404 });
    await invalidateCacheTags(["clients", "overview"]);
    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not save client details." },
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
      .update(schema.clients)
      .set({ deletedAt: new Date(), status: "archived" })
      .where(eq(schema.clients.id, id));
    await invalidateCacheTags(["clients", "overview"]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: "Archived a client profile",
      entityType: "client",
      entityId: id,
    });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not archive this client." },
      { status: 500 }
    );
  }
}
