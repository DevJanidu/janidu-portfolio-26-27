import crypto from "crypto";
import { NextResponse } from "next/server";
import { asc, eq, isNull } from "drizzle-orm";
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
    const payload = await cachedQuery(
      "adm:services:list",
      async () => {
        const db = getDb();
        const [items, settings] = await Promise.all([
          db
            .select()
            .from(schema.services)
            .where(isNull(schema.services.deletedAt))
            .orderBy(asc(schema.services.displayOrder)),
          db
            .select({ showServicesSection: schema.siteSettings.showServicesSection })
            .from(schema.siteSettings)
            .where(eq(schema.siteSettings.id, "default"))
            .limit(1),
        ]);
        return {
          items,
          showServicesSection: Boolean(settings[0]?.showServicesSection),
        };
      },
      { ttlSeconds: 180, l1TtlSeconds: 20, tags: ["services", "settings"] }
    );

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load services." },
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

    if (typeof body.toggleShowServicesSection === "boolean") {
      await db
        .update(schema.siteSettings)
        .set({
          showServicesSection: body.toggleShowServicesSection,
          updatedAt: new Date(),
        })
        .where(eq(schema.siteSettings.id, "default"));
      revalidatePublicSite();
      await logActivity({
        actorUserId: auth.session.user.id,
        action: body.toggleShowServicesSection
          ? "Showed Services section on public website"
          : "Hid Services section on public website",
        entityType: "settings",
      });
      return NextResponse.json({ showServicesSection: body.toggleShowServicesSection });
    }

    const name = String(body.name || "").trim();
    if (name.length < 2) {
      return NextResponse.json(
        { error: "Please enter a service name." },
        { status: 400 }
      );
    }

    const payload = {
      name,
      description: String(body.description || "").trim(),
      featuresJson: Array.isArray(body.featuresJson)
        ? body.featuresJson.map(String).filter(Boolean)
        : [],
      startingPrice: body.startingPrice ? String(body.startingPrice) : null,
      currency: String(body.currency || "USD"),
      deliveryEstimate: body.deliveryEstimate ? String(body.deliveryEstimate).trim() : null,
      ctaLabel: String(body.ctaLabel || "Start a project").trim(),
      ctaHref: String(body.ctaHref || "/#contact").trim(),
      isVisible: body.isVisible !== false,
      updatedAt: new Date(),
    };

    if (body.id) {
      const [updated] = await db
        .update(schema.services)
        .set(payload)
        .where(eq(schema.services.id, String(body.id)))
        .returning();
      revalidatePublicSite();
      return NextResponse.json({ item: updated });
    }

    const [created] = await db
      .insert(schema.services)
      .values({
        id: crypto.randomUUID(),
        ...payload,
      })
      .returning();

    revalidatePublicSite();
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Added service "${created.name}"`,
      entityType: "service",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save this service." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing service." }, { status: 400 });

  try {
    await getDb()
      .update(schema.services)
      .set({ deletedAt: new Date(), isVisible: false })
      .where(eq(schema.services.id, id));
    revalidatePublicSite();
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete this service." },
      { status: 500 }
    );
  }
}
