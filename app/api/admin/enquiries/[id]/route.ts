import crypto from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
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

    // One-click Convert Enquiry to Client (+ optional initial Client Project)
    if (body.action === "convert_to_client") {
      const rows = await db
        .select()
        .from(schema.inquiries)
        .where(eq(schema.inquiries.id, id))
        .limit(1);
      const enq = rows[0];
      if (!enq) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });

      if (enq.convertedClientId) {
        return NextResponse.json({ clientId: enq.convertedClientId, alreadyConverted: true });
      }

      const clientId = crypto.randomUUID();
      await db.insert(schema.clients).values({
        id: clientId,
        name: enq.name,
        businessName: enq.businessName || null,
        email: enq.email,
        phone: enq.phone || null,
        country: enq.country || "USA",
        status: "active",
        sourceInquiryId: enq.id,
        privateNotes: enq.privateNotes || `Converted from website enquiry: ${enq.message.slice(0, 240)}`,
      });

      const projectTitle =
        enq.businessName
          ? `${enq.businessName} Website`
          : `${enq.name} Website Project`;

      await db.insert(schema.clientProjects).values({
        id: crypto.randomUUID(),
        clientId,
        title: projectTitle,
        stage: "proposal_sent",
        currency: "USD",
        privateNotes: enq.selectedDesign
          ? `Interested in style: ${enq.selectedDesign}`
          : "",
      });

      await db
        .update(schema.inquiries)
        .set({
          convertedClientId: clientId,
          status: "confirmed",
          isRead: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.inquiries.id, id));

      await logActivity({
        actorUserId: auth.session.user.id,
        action: `Converted enquiry from "${enq.name}" into a Client`,
        entityType: "client",
        entityId: clientId,
      });

      await invalidateCacheTags(["enquiries", "clients", "badges", "overview"]);
      return NextResponse.json({ clientId }, { status: 201 });
    }

    const updates: Partial<typeof schema.inquiries.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (typeof body.isRead === "boolean") updates.isRead = body.isRead;
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.privateNotes === "string") updates.privateNotes = body.privateNotes;

    const [updated] = await db
      .update(schema.inquiries)
      .set(updates)
      .where(eq(schema.inquiries.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }

    await invalidateCacheTags(["enquiries", "badges", "overview"]);
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[enquiries PATCH]", err);
    return NextResponse.json(
      { error: "Could not update this enquiry." },
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
      .update(schema.inquiries)
      .set({ deletedAt: new Date(), status: "archived" })
      .where(eq(schema.inquiries.id, id));
    await invalidateCacheTags(["enquiries", "badges", "overview"]);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete this enquiry." },
      { status: 500 }
    );
  }
}
