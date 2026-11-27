import crypto from "crypto";
import { NextResponse } from "next/server";
import { desc, eq, isNotNull, isNull, and } from "drizzle-orm";
import { z } from "zod";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/cms/revalidate";
import { cachedQuery } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createReviewSchema = z.object({
  clientName: z.string().min(2, "Please enter the customer's name.").max(100),
  businessName: z.string().max(120).optional().nullable(),
  country: z.string().max(80).optional().default("USA"),
  projectName: z.string().min(2, "Please enter the project name.").max(120),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z.string().min(5, "Please enter the review message.").max(2000),
  status: z.enum(["published", "pending", "hidden"]).optional().default("published"),
  featured: z.boolean().optional().default(false),
  publishedAt: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";

    const rows = await cachedQuery(
      `adm:reviews:${status}`,
      async () => {
        const db = getDb();
        if (status === "trashed") {
          return db
            .select()
            .from(schema.reviews)
            .where(isNotNull(schema.reviews.deletedAt))
            .orderBy(desc(schema.reviews.createdAt));
        }
        if (status === "all") {
          return db
            .select()
            .from(schema.reviews)
            .where(isNull(schema.reviews.deletedAt))
            .orderBy(desc(schema.reviews.publishedAt), desc(schema.reviews.createdAt));
        }
        return db
          .select()
          .from(schema.reviews)
          .where(and(eq(schema.reviews.status, status), isNull(schema.reviews.deletedAt)))
          .orderBy(desc(schema.reviews.publishedAt), desc(schema.reviews.createdAt));
      },
      { ttlSeconds: 120, l1TtlSeconds: 15, tags: ["reviews"] }
    );

    return NextResponse.json(
      { items: rows },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load customer reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const raw = await request.json();
    const parsed = createReviewSchema.safeParse({
      ...raw,
      rating: Number(raw.rating ?? 5),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check the review details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const isPub = d.status === "published";
    const [created] = await getDb()
      .insert(schema.reviews)
      .values({
        id: crypto.randomUUID(),
        clientName: d.clientName.trim(),
        businessName: d.businessName?.trim() || null,
        country: d.country.trim() || "USA",
        projectName: d.projectName.trim(),
        rating: d.rating,
        comment: d.comment.trim(),
        status: d.status,
        approved: isPub,
        featured: d.featured,
        source: "manual_admin",
        publishedAt: d.publishedAt || new Date().toISOString().slice(0, 10),
        moderatedAt: new Date(),
      })
      .returning();

    revalidatePublicSite(["/reviews"]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Added customer review from "${created.clientName}"`,
      entityType: "review",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save this review." },
      { status: 500 }
    );
  }
}
