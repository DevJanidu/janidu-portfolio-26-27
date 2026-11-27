import { NextResponse } from "next/server";
import { and, desc, eq, ne } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/cms/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const db = getDb();
    const [settingsRows, sessions] = await Promise.all([
      db
        .select()
        .from(schema.siteSettings)
        .where(eq(schema.siteSettings.id, "default"))
        .limit(1),
      db
        .select({
          id: schema.session.id,
          createdAt: schema.session.createdAt,
          expiresAt: schema.session.expiresAt,
          ipAddress: schema.session.ipAddress,
          userAgent: schema.session.userAgent,
        })
        .from(schema.session)
        .where(eq(schema.session.userId, auth.session.user.id))
        .orderBy(desc(schema.session.createdAt)),
    ]);

    return NextResponse.json({
      settings: settingsRows[0] ?? null,
      user: {
        name: auth.session.user.name,
        email: auth.session.user.email,
        twoFactorEnabled: auth.session.user.twoFactorEnabled,
      },
      currentSessionId: auth.session.session.id,
      devices: sessions,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load your settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const db = getDb();
  try {
    const body = await request.json();

    if (body.action === "sign_out_other_devices") {
      await db
        .delete(schema.session)
        .where(
          and(
            eq(schema.session.userId, auth.session.user.id),
            ne(schema.session.id, auth.session.session.id)
          )
        );
      await logActivity({
        actorUserId: auth.session.user.id,
        action: "Signed out all other devices",
        entityType: "security",
      });
      return NextResponse.json({ signedOutOthers: true });
    }

    const updates: Partial<typeof schema.siteSettings.$inferInsert> = {
      updatedAt: new Date(),
    };
    const fields = [
      "siteName",
      "siteTagline",
      "publicEmail",
      "publicWhatsapp",
      "locationText",
      "clientMarketsText",
      "linkedinUrl",
      "defaultSeoTitle",
      "defaultSeoDescription",
      "showServicesSection",
      "notifyNewEnquiry",
      "notifyNewReview",
      "notifySecurityAlerts",
    ] as const;

    for (const f of fields) {
      if (body[f] !== undefined) {
        (updates as Record<string, unknown>)[f] = body[f];
      }
    }

    const [updated] = await db
      .update(schema.siteSettings)
      .set(updates)
      .where(eq(schema.siteSettings.id, "default"))
      .returning();

    revalidatePublicSite();
    await logActivity({
      actorUserId: auth.session.user.id,
      action: "Updated website settings",
      entityType: "settings",
    });

    return NextResponse.json({ settings: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not save your settings." },
      { status: 500 }
    );
  }
}
