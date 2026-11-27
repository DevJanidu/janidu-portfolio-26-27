import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { normalizeCountry } from "@/lib/countries";
import { ensureDatabaseSchema, getSql, isDatabaseConfigured } from "@/lib/db";
import { computeReviewSummary, getPublishedReviews } from "@/lib/reviews";
import { invalidateCacheTags } from "@/lib/cache/redis";
import { profile } from "@/lib/data";
import {
  appendPrivateSubmission,
  escapeHtml,
  isSmtpConfigured,
  postJsonWebhook,
  sendSmtpMail,
} from "@/lib/submission-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const reviews = await getPublishedReviews();
  const summary = computeReviewSummary(reviews);
  return NextResponse.json({ reviews, summary });
}

type ReviewSubmissionBody = {
  rating?: number | string;
  clientName?: string;
  businessName?: string;
  country?: string;
  email?: string;
  projectName?: string;
  comment?: string;
  displayPermission?: boolean;
  website?: string; // honeypot
};

export async function POST(request: Request) {
  let body: ReviewSubmissionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  if (body.website) {
    revalidatePath("/reviews");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }

  const parsedRating =
    typeof body.rating === "string" ? Number(body.rating) : body.rating;
  if (
    typeof parsedRating !== "number" ||
    !Number.isInteger(parsedRating) ||
    parsedRating < 1 ||
    parsedRating > 5
  ) {
    return NextResponse.json(
      { error: "Please select a rating between 1 and 5." },
      { status: 400 }
    );
  }

  const rating = parsedRating as 1 | 2 | 3 | 4 | 5;
  const clientName = body.clientName?.trim() ?? "";
  const businessName = body.businessName?.trim() ?? "";
  const country = normalizeCountry(body.country);
  const email = body.email?.trim() ?? "";
  const projectName = body.projectName?.trim() ?? "";
  const comment = body.comment?.trim() ?? "";
  const displayPermission = body.displayPermission === true;

  if (!clientName || clientName.length < 2) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      {
        error:
          "Please enter a valid email address so we can verify your project. Your email stays private.",
      },
      { status: 400 }
    );
  }
  if (!projectName || projectName.length < 2) {
    return NextResponse.json(
      { error: "Please enter the name of the project." },
      { status: 400 }
    );
  }
  if (!comment || comment.length < 12) {
    return NextResponse.json(
      { error: "Please write a short comment (at least a sentence)." },
      { status: 400 }
    );
  }
  if (!displayPermission) {
    return NextResponse.json(
      {
        error:
          "Please confirm permission to display your name or business alongside your review.",
      },
      { status: 400 }
    );
  }
  if (
    clientName.length > 100 ||
    businessName.length > 140 ||
    email.length > 200 ||
    projectName.length > 140 ||
    comment.length > 1500
  ) {
    return NextResponse.json(
      { error: "One or more fields exceed the maximum allowed length." },
      { status: 400 }
    );
  }

  const id = `rev_${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString();
  const publishedDate = submittedAt.slice(0, 10);

  const publicModerationCandidate = {
    id,
    rating,
    projectName,
    comment,
    clientName,
    ...(businessName ? { businessName } : {}),
    location: country,
    publishedAt: publishedDate,
    approved: true,
    displayPermission: true,
    featured: false,
  };

  const moderationRecord = {
    id,
    status: "pending_moderation" as const,
    submittedAt,
    privateContactEmail: email,
    displayPermission: true,
    publicCandidate: publicModerationCandidate,
  };

  let savedInDb = false;
  let emailed = false;
  let webhooked = false;
  let storedOnDisk = false;

  try {
    if (isDatabaseConfigured()) {
      await ensureDatabaseSchema();
      const sql = getSql();
      // Save review to Neon Postgres as pending moderation; private_contact_email stays strictly server-side.
      const rows = await sql`
        INSERT INTO reviews (
          id,
          rating,
          project_name,
          comment,
          client_name,
          business_name,
          country,
          private_contact_email,
          display_permission,
          approved,
          status,
          source,
          featured,
          published_at
        )
        VALUES (
          ${id},
          ${rating},
          ${projectName},
          ${comment},
          ${clientName},
          ${businessName || null},
          ${country},
          ${email},
          ${displayPermission},
          FALSE,
          'pending',
          'website_form',
          FALSE,
          ${publishedDate}
        )
        RETURNING id
      `;
      savedInDb = rows.length > 0;
    }

    if (!savedInDb) {
      storedOnDisk = await appendPrivateSubmission(
        "review-submissions.private.json",
        moderationRecord
      );
    }

    if (process.env.REVIEWS_WEBHOOK_URL) {
      webhooked = await postJsonWebhook(
        process.env.REVIEWS_WEBHOOK_URL,
        moderationRecord
      );
    }

    if (isSmtpConfigured()) {
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const text = [
        `New client review submitted for moderation`,
        `Rating: ${rating}/5 (${stars})`,
        `Client name: ${clientName}`,
        businessName ? `Business: ${businessName}` : null,
        `Country: ${country}`,
        `Project: ${projectName}`,
        `Private verification email (DO NOT PUBLISH): ${email}`,
        `Display permission granted: Yes`,
        savedInDb
          ? `Stored in Neon Postgres (id: ${id}, approved: false). To publish: UPDATE reviews SET approved = TRUE WHERE id = '${id}';`
          : null,
        "",
        "Comment:",
        comment,
      ]
        .filter((line): line is string => line !== null)
        .join("\n");

      const html = `
        <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 12px; font-size: 18px;">New client review awaiting moderation</h2>
          <p style="margin: 4px 0;"><strong>Rating:</strong> ${rating} / 5</p>
          <p style="margin: 4px 0;"><strong>Client:</strong> ${escapeHtml(clientName)}${
            businessName ? ` (${escapeHtml(businessName)})` : ""
          }</p>
          <p style="margin: 4px 0;"><strong>Country:</strong> ${escapeHtml(country)}</p>
          <p style="margin: 4px 0;"><strong>Project:</strong> ${escapeHtml(projectName)}</p>
          <p style="margin: 4px 0;"><strong>Private email (never shown publicly):</strong> ${escapeHtml(email)}</p>
          <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <p style="margin: 0 0 8px;"><strong>Review comment:</strong></p>
          <p style="margin: 0 0 16px; white-space: pre-wrap;">${escapeHtml(comment)}</p>
          ${
            savedInDb
              ? `<p style="font-size: 13px; color: #4b5563;">Approve in Neon Postgres: <code>UPDATE reviews SET approved = TRUE WHERE id = '${escapeHtml(id)}';</code></p>`
              : ""
          }
        </div>
      `;

      emailed = await sendSmtpMail({
        fromLabel: "JaniduDev Review Moderation",
        replyToName: clientName,
        replyToEmail: email,
        subject: `Review awaiting moderation (${country}): ${projectName} (${rating}/5)`,
        text,
        html,
      });
    }
  } catch (error) {
    console.error("Review submission persistence failed:", error);
    return NextResponse.json(
      {
        error: `Could not save your review right now. Please try again shortly or email ${profile.email}.`,
      },
      { status: 502 }
    );
  }

  if (!savedInDb && !storedOnDisk && !emailed && !webhooked) {
    console.error(
      "Review submission: no durable moderation channel (Neon DB, SMTP, webhook, or persistent volume) is configured."
    );
    return NextResponse.json(
      {
        error: `Review moderation storage is not configured on this server yet. Please email your feedback to ${profile.email}.`,
      },
      { status: 503 }
    );
  }

  if (savedInDb) {
    await invalidateCacheTags(["reviews", "badges", "overview"]);
  }
  revalidatePath("/reviews");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
