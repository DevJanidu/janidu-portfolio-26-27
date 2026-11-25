import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { profile } from "@/lib/data";

export type DeliveryResult = {
  emailed: boolean;
  webhooked: boolean;
  storedOnDisk: boolean;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Serverless platforms (Vercel, Lambda, Netlify Functions) have read-only or
 * ephemeral filesystems. Never count local file writes as durable persistence
 * there unless an explicit external mount path is provided via SUBMISSIONS_STORAGE_DIR.
 */
export function canPersistToLocalDisk(): boolean {
  if (process.env.SUBMISSIONS_STORAGE_DIR) return true;
  const isEphemeralServerless = Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY
  );
  return !isEphemeralServerless;
}

export function isSmtpConfigured(): boolean {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(
    SMTP_HOST &&
      SMTP_PORT &&
      SMTP_USER &&
      SMTP_PASS &&
      SMTP_PASS !== "your_smtp_password_here"
  );
}

export async function sendSmtpMail(options: {
  fromLabel: string;
  replyToName: string;
  replyToEmail: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } =
    process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return false;
  }

  const port = Number(SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: `"${options.fromLabel.replace(/"/g, "")}" <${SMTP_USER}>`,
    to: CONTACT_TO_EMAIL || profile.email,
    replyTo: `"${options.replyToName.replace(/"/g, "")}" <${options.replyToEmail}>`,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return Array.isArray(info.accepted) && info.accepted.length > 0;
}

export async function postJsonWebhook(
  webhookUrl: string | undefined,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!webhookUrl) return false;
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Webhook responded with status ${res.status}`);
  }
  return true;
}

/**
 * Atomically appends a record to a private JSON file outside `public/` and
 * verifies by reading back that the record ID is persisted on disk.
 */
export async function appendPrivateSubmission<
  T extends { id: string }
>(
  filename: "inquiry-submissions.private.json" | "review-submissions.private.json",
  record: T
): Promise<boolean> {
  if (!canPersistToLocalDisk()) return false;

  const customDir = process.env.SUBMISSIONS_STORAGE_DIR;
  const baseDir = customDir
    ? path.resolve(/*turbopackIgnore: true*/ customDir)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
  await fs.mkdir(baseDir, { recursive: true });

  const targetPath = path.join(/*turbopackIgnore: true*/ baseDir, filename);
  const tempPath = path.join(
    /*turbopackIgnore: true*/ baseDir,
    `${filename}.${crypto.randomUUID()}.tmp`
  );

  let existing: T[] = [];
  try {
    const raw = await fs.readFile(targetPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existing = parsed as T[];
    }
  } catch {
    existing = [];
  }

  const updated = [...existing, record];
  await fs.writeFile(tempPath, JSON.stringify(updated, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
  await fs.rename(tempPath, targetPath);

  // Confirm read-back so we never report success on a partial or failed write.
  const verifyRaw = await fs.readFile(targetPath, "utf8");
  const verifyParsed: unknown = JSON.parse(verifyRaw);
  return (
    Array.isArray(verifyParsed) &&
    verifyParsed.some(
      (entry) =>
        Boolean(entry) &&
        typeof entry === "object" &&
        (entry as { id?: string }).id === record.id
    )
  );
}
