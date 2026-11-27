import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/lib/db";
import { getSignedReadUrl, isNeonStorageConfigured } from "@/lib/storage";
import { cachedQuery } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Cache resolved redirect target (local path or signed S3 URL) for 10 min in Redis
    // (S3 URL itself is valid for 15 min, leaving a safe 5-min buffer).
    const resolved = await cachedQuery<{ kind: "local" | "signed"; target: string } | null>(
      `media:signed:${id}`,
      async () => {
        const rows = await getDb()
          .select()
          .from(schema.mediaAssets)
          .where(and(eq(schema.mediaAssets.id, id), isNull(schema.mediaAssets.deletedAt)))
          .limit(1);

        const asset = rows[0];
        if (!asset) return null;

        if (asset.storageProvider === "local_static") {
          return { kind: "local", target: asset.url };
        }

        if (asset.objectKey && isNeonStorageConfigured()) {
          const signed = await getSignedReadUrl(asset.objectKey, 900);
          return { kind: "signed", target: signed };
        }

        return null;
      },
      { ttlSeconds: 600, l1TtlSeconds: 60, tags: ["media"] }
    );

    if (!resolved) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const destination =
      resolved.kind === "local"
        ? new URL(resolved.target, request.url)
        : resolved.target;

    const res = NextResponse.redirect(destination, 302);
    res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    return res;
  } catch {
    return NextResponse.json({ error: "Could not load file" }, { status: 500 });
  }
}
