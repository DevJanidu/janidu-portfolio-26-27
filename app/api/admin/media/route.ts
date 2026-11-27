import crypto from "crypto";
import { NextResponse } from "next/server";
import { desc, isNull } from "drizzle-orm";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { cachedQuery, invalidateCacheTags } from "@/lib/cache/redis";
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  buildObjectKey,
  detectAllowedMimeFromBytes,
  isNeonStorageConfigured,
  uploadToNeonStorage,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const items = await cachedQuery(
      "adm:media:list",
      () =>
        getDb()
          .select()
          .from(schema.mediaAssets)
          .where(isNull(schema.mediaAssets.deletedAt))
          .orderBy(desc(schema.mediaAssets.createdAt)),
      { ttlSeconds: 180, l1TtlSeconds: 20, tags: ["media"] }
    );

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load your media library." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  if (!isNeonStorageConfigured()) {
    return NextResponse.json(
      { error: "Cloud file storage is not ready yet. Please check your setup." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "general").trim() || "general";
    const altText = String(formData.get("altText") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please choose an image or video file to upload." },
        { status: 400 }
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const detectedMime = detectAllowedMimeFromBytes(buffer, file.type);

    if (!detectedMime) {
      return NextResponse.json(
        {
          error:
            "That file type is not supported. Please upload a JPG, PNG, WebP, AVIF image or an MP4/WebM video.",
        },
        { status: 400 }
      );
    }

    const isImage = ALLOWED_IMAGE_MIMES.has(detectedMime);
    const isVideo = ALLOWED_VIDEO_MIMES.has(detectedMime);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "That file type is not supported." },
        { status: 400 }
      );
    }

    if (isImage && buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "That image is too large. Please keep images under 10 MB." },
        { status: 400 }
      );
    }
    if (isVideo && buffer.length > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "That video is too large. Please keep videos under 50 MB." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const objectKey = buildObjectKey(folder, file.name);

    await uploadToNeonStorage({
      buffer,
      objectKey,
      contentType: detectedMime,
    });

    const assetUrl = `/api/media/${id}`;

    const [created] = await getDb()
      .insert(schema.mediaAssets)
      .values({
        id,
        storageProvider: "neon_s3",
        url: assetUrl,
        objectKey,
        fileName: file.name.slice(0, 120),
        mimeType: detectedMime,
        sizeBytes: buffer.length,
        altText: altText || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
        folder,
      })
      .returning();

    await invalidateCacheTags(["media"]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Uploaded "${created.fileName}" to Media Library`,
      entityType: "media",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("[media upload]", err);
    return NextResponse.json(
      { error: "Could not upload that file. Please try again." },
      { status: 500 }
    );
  }
}
