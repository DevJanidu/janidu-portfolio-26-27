import crypto from "crypto";
import { NextResponse } from "next/server";
import { profile } from "@/lib/data";
import { normalizeCountry } from "@/lib/countries";
import { ensureDatabaseSchema, getSql, isDatabaseConfigured } from "@/lib/db";
import { getSalonConceptBySlug } from "@/lib/salon-concepts";
import {
  appendPrivateSubmission,
  escapeHtml,
  isSmtpConfigured,
  postJsonWebhook,
  sendSmtpMail,
} from "@/lib/submission-delivery";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InquiryPayload = {
  name?: string;
  email?: string;
  businessName?: string;
  country?: string;
  message?: string;
  selectedDesign?: string;
  packageName?: string;
  subject?: string;
  company?: string; // honeypot
};

export async function POST(request: Request) {
  let body: InquiryPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const businessName = body.businessName?.trim() ?? "";
  const country = normalizeCountry(body.country);
  const message = body.message?.trim() ?? "";
  const rawDesign = body.selectedDesign?.trim() ?? "";
  const packageName = body.packageName?.trim() ?? "";

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Please share a few details about what you want built." },
      { status: 400 }
    );
  }
  if (
    name.length > 140 ||
    email.length > 200 ||
    businessName.length > 160 ||
    message.length > 5000
  ) {
    return NextResponse.json(
      { error: "One or more fields exceed the maximum length." },
      { status: 400 }
    );
  }

  const matchedConcept = getSalonConceptBySlug(rawDesign);
  const designLabel = matchedConcept
    ? `${matchedConcept.title} (${matchedConcept.demoUrl})`
    : rawDesign;

  const submissionId = `inq_${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString();

  const subjectLine =
    body.subject?.trim() ||
    (businessName
      ? `New project inquiry (${country}): ${businessName} (${name})`
      : `New project inquiry (${country}) from ${name}`);

  const textLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Country: ${country}`,
    businessName ? `Business name: ${businessName}` : null,
    designLabel ? `Selected design concept: ${designLabel}` : null,
    packageName ? `Selected package: ${packageName}` : null,
    `Submitted at: ${submittedAt}`,
    "",
    "Project details:",
    message,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 16px; font-size: 18px;">New website inquiry</h2>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin: 4px 0;"><strong>Country:</strong> ${escapeHtml(country)}</p>
      ${
        businessName
          ? `<p style="margin: 4px 0;"><strong>Business name:</strong> ${escapeHtml(businessName)}</p>`
          : ""
      }
      ${
        designLabel
          ? `<p style="margin: 4px 0;"><strong>Selected design concept:</strong> ${escapeHtml(designLabel)}</p>`
          : ""
      }
      ${
        packageName
          ? `<p style="margin: 4px 0;"><strong>Package:</strong> ${escapeHtml(packageName)}</p>`
          : ""
      }
      <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />
      <p style="margin: 0 0 8px;"><strong>What they want built:</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  let savedInDb = false;
  let delivered = false;
  let storedOnDisk = false;

  try {
    if (isDatabaseConfigured()) {
      await ensureDatabaseSchema();
      const sql = getSql();
      const rows = await sql`
        INSERT INTO inquiries (
          id, name, email, business_name, country, selected_design, package_name, message
        )
        VALUES (
          ${submissionId},
          ${name},
          ${email},
          ${businessName || null},
          ${country},
          ${designLabel || null},
          ${packageName || null},
          ${message}
        )
        RETURNING id
      `;
      savedInDb = rows.length > 0;
    }

    if (isSmtpConfigured()) {
      delivered = await sendSmtpMail({
        fromLabel: "JaniduDev Project Inquiry",
        replyToName: name,
        replyToEmail: email,
        subject: subjectLine,
        text: textLines,
        html,
      });
    }

    if (process.env.CONTACT_WEBHOOK_URL) {
      const webhookOk = await postJsonWebhook(process.env.CONTACT_WEBHOOK_URL, {
        id: submissionId,
        type: "project_inquiry",
        submittedAt,
        name,
        email,
        businessName: businessName || undefined,
        country,
        selectedDesign: designLabel || undefined,
        packageName: packageName || undefined,
        message,
      });
      delivered = delivered || webhookOk;
    }

    if (!savedInDb) {
      storedOnDisk = await appendPrivateSubmission(
        "inquiry-submissions.private.json",
        {
          id: submissionId,
          submittedAt,
          name,
          email,
          businessName: businessName || undefined,
          country,
          selectedDesign: designLabel || undefined,
          packageName: packageName || undefined,
          message,
        }
      );
    }
  } catch (error) {
    console.error("Inquiry submission persistence/delivery failed:", error);
    return NextResponse.json(
      {
        error: `Could not save your inquiry right now. Please email ${profile.email} directly or message ${profile.whatsapp} on WhatsApp.`,
      },
      { status: 502 }
    );
  }

  if (!savedInDb && !delivered && !storedOnDisk) {
    console.error(
      "Inquiry form: neither Neon DB, SMTP/webhook, nor persistent storage is configured."
    );
    return NextResponse.json(
      {
        error: `Form delivery is not configured on this server yet. Please email ${profile.email} directly or message ${profile.whatsapp} on WhatsApp.`,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
