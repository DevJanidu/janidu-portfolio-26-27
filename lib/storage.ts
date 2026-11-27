import crypto from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cachedS3: S3Client | null = null;

export function isNeonStorageConfigured(): boolean {
  return Boolean(
    process.env.AWS_ENDPOINT_URL_S3?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim() &&
      process.env.STORAGE_BUCKET_NAME?.trim()
  );
}

function getS3Client(): S3Client {
  if (!cachedS3) {
    cachedS3 = new S3Client({
      region: process.env.AWS_REGION?.trim() || "auto",
      endpoint: process.env.AWS_ENDPOINT_URL_S3?.trim(),
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() || "",
      },
    });
  }
  return cachedS3;
}

function getBucketName(): string {
  const bucket = process.env.STORAGE_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error("Storage bucket is not configured.");
  }
  return bucket;
}

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/webm"]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Inspects file magic bytes to confirm the file really is an allowed image or video.
 * Explicitly blocks SVG, HTML, scripts, and disguised files.
 */
export function detectAllowedMimeFromBytes(
  buf: Buffer,
  declaredMime: string
): string | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: RIFF....WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  // ISO BMFF (AVIF / MP4): ....ftyp
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis" || declaredMime === "image/avif") {
      return "image/avif";
    }
    if (ALLOWED_VIDEO_MIMES.has(declaredMime) || brand.startsWith("mp4") || brand === "isom" || brand === "M4V ") {
      return "video/mp4";
    }
  }
  // WebM: 1A 45 DF A3
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return "video/webm";
  }

  return null;
}

export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "upload";
}

export function buildObjectKey(folder: string, fileName: string): string {
  const safeFolder = folder.replace(/[^a-z0-9\-_]/gi, "").toLowerCase() || "general";
  const safeName = sanitizeFileName(fileName);
  const unique = crypto.randomBytes(6).toString("hex");
  return `janidudev/${safeFolder}/${Date.now()}-${unique}-${safeName}`;
}

export async function uploadToNeonStorage(params: {
  buffer: Buffer;
  objectKey: string;
  contentType: string;
}): Promise<void> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: params.objectKey,
      Body: params.buffer,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

export async function deleteFromNeonStorage(objectKey: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: objectKey,
    })
  );
}

export async function getSignedReadUrl(
  objectKey: string,
  expiresInSeconds = 900
): Promise<string> {
  const client = getS3Client();
  const cmd = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: objectKey,
  });
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds });
}
