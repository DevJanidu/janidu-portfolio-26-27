import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { getDb, isDatabaseConfigured, schema } from "@/lib/db";

let cachedResend: Resend | null = null;

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!cachedResend) {
    cachedResend = new Resend(key);
  }
  return cachedResend;
}

function isSmtpReady(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass && pass !== "your_smtp_password_here");
}

export function getEmailFromAddress(): string {
  if (process.env.RESEND_FROM_EMAIL?.trim()) {
    return process.env.RESEND_FROM_EMAIL.trim();
  }
  if (process.env.SMTP_USER?.trim()) {
    return `JaniduDev <${process.env.SMTP_USER.trim()}>`;
  }
  return "JaniduDev <onboarding@resend.dev>";
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  templateName: string;
  replyTo?: string;
}

async function logEmailDelivery(params: {
  templateName: string;
  recipientDomain: string;
  status: "sent" | "failed";
  providerMessageId: string | null;
}) {
  if (!isDatabaseConfigured()) return;
  await getDb()
    .insert(schema.emailLogs)
    .values({
      id: crypto.randomUUID(),
      templateName: params.templateName,
      recipientDomain: params.recipientDomain,
      status: params.status,
      providerMessageId: params.providerMessageId,
    })
    .catch(() => {});
}

async function sendViaSmtp(input: SendEmailInput): Promise<{ sent: boolean; id?: string; error?: string }> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const fromEmail = process.env.SMTP_FROM?.trim() || user;

  if (!host || !user || !pass) {
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL on 465, STARTTLS on 587
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `JaniduDev Security <${fromEmail}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    const accepted = Array.isArray(info.accepted) && info.accepted.length > 0;
    return { sent: accepted, id: info.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SMTP error";
    console.error(`[email:smtp] Failed to send ${input.templateName}:`, msg);
    return { sent: false, error: msg };
  }
}

const SECURITY_TEMPLATES = new Set([
  "email_otp_forget-password",
  "email_otp_sign-in",
  "email_otp_email-verification",
  "two_factor_otp",
  "password_reset",
  "email_verification",
]);

/**
 * Sends transactional email using Namecheap/PrivateEmail SMTP (when configured)
 * or Resend API, with automatic fallback between providers so OTP & password
 * reset emails reliably reach private mailboxes.
 */
export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<{ sent: boolean; id?: string }> {
  // Route security/OTP emails to ADMIN_RECOVERY_EMAIL (or ADMIN_NOTIFICATION_EMAIL) if set,
  // so sender (hello@janidudev.com) and receiver are never the same Private Email mailbox.
  const recoveryEmail =
    process.env.ADMIN_RECOVERY_EMAIL?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  const effectiveTo =
    recoveryEmail && SECURITY_TEMPLATES.has(input.templateName)
      ? recoveryEmail
      : input.to;
  const effectiveInput: SendEmailInput = { ...input, to: effectiveTo };

  const smtpUser = process.env.SMTP_USER?.trim().toLowerCase();
  const isSelfSend = Boolean(smtpUser && smtpUser === effectiveTo.toLowerCase());
  const hasVerifiedResendFrom = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_FROM_EMAIL?.trim() &&
      !process.env.RESEND_FROM_EMAIL.includes("resend.dev")
  );

  const recipientDomain = effectiveTo.includes("@")
    ? effectiveTo.split("@")[1].toLowerCase()
    : "unknown";

  // 1. Prefer verified Resend domain sender (e.g. JaniduDev <noreply@janidudev.com>)
  //    for all transactional emails (fast external relay, zero Private Email self-send loops).
  if (hasVerifiedResendFrom) {
    const client = getResendClient();
    if (client) {
      try {
        const { data, error } = await client.emails.send({
          from: getEmailFromAddress(),
          to: effectiveInput.to,
          subject: effectiveInput.subject,
          html: effectiveInput.html,
          text: effectiveInput.text,
          ...(effectiveInput.replyTo ? { replyTo: effectiveInput.replyTo } : {}),
        });
        if (!error) {
          await logEmailDelivery({
            templateName: effectiveInput.templateName,
            recipientDomain,
            status: "sent",
            providerMessageId: data?.id ?? null,
          });
          return { sent: true, id: data?.id };
        }
        console.error(`[email:resend] Failed to send ${effectiveInput.templateName}:`, error.message);
      } catch (err) {
        console.error(`[email:resend] Unexpected error:`, err);
      }
    }
  }

  // 2. Fallback to Private Email / custom SMTP if configured
  if (isSmtpReady()) {
    if (isSelfSend) {
      console.warn(
        `[email:smtp] Self-send detected (${smtpUser} -> ${effectiveTo}). Namecheap Private Email may filter self-addressed mail. Set ADMIN_NOTIFICATION_EMAIL to an external inbox or verify janidudev.com in Resend (RESEND_FROM_EMAIL) for guaranteed Inbox delivery.`
      );
    }
    const smtpRes = await sendViaSmtp(effectiveInput);
    if (smtpRes.sent) {
      await logEmailDelivery({
        templateName: effectiveInput.templateName,
        recipientDomain,
        status: "sent",
        providerMessageId: smtpRes.id ?? "smtp",
      });
      return { sent: true, id: smtpRes.id };
    }
  }

  // 2. Try Resend API
  const client = getResendClient();
  if (client) {
    try {
      const { data, error } = await client.emails.send({
        from: getEmailFromAddress(),
        to: effectiveInput.to,
        subject: effectiveInput.subject,
        html: effectiveInput.html,
        text: effectiveInput.text,
        ...(effectiveInput.replyTo ? { replyTo: effectiveInput.replyTo } : {}),
      });

      if (!error) {
        await logEmailDelivery({
          templateName: input.templateName,
          recipientDomain,
          status: "sent",
          providerMessageId: data?.id ?? null,
        });
        return { sent: true, id: data?.id };
      }

      console.error(`[email:resend] Failed to send ${input.templateName}:`, error.message);
      await logEmailDelivery({
        templateName: input.templateName,
        recipientDomain,
        status: "failed",
        providerMessageId: null,
      });
      return { sent: false };
    } catch (err) {
      console.error(`[email:resend] Unexpected error sending ${input.templateName}:`, err);
      await logEmailDelivery({
        templateName: input.templateName,
        recipientDomain,
        status: "failed",
        providerMessageId: null,
      });
      return { sent: false };
    }
  }

  console.warn(`[email] Neither SMTP nor RESEND_API_KEY is configured; skipped ${input.templateName}`);
  await logEmailDelivery({
    templateName: input.templateName,
    recipientDomain,
    status: "failed",
    providerMessageId: null,
  });
  return { sent: false };
}
