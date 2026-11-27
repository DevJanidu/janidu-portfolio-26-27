import { NextResponse } from "next/server";
import { desc, isNull } from "drizzle-orm";
import { requireAdminApi } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { cachedQuery } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const items = await cachedQuery(
      "adm:enquiries:list",
      () =>
        getDb()
          .select()
          .from(schema.inquiries)
          .where(isNull(schema.inquiries.deletedAt))
          .orderBy(desc(schema.inquiries.createdAt)),
      { ttlSeconds: 90, l1TtlSeconds: 15, tags: ["enquiries"] }
    );

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load customer enquiries." },
      { status: 500 }
    );
  }
}
