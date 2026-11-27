import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { emailOTP } from "better-auth/plugins/email-otp";
import { getDb, schema } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/email/resend";
import {
  buildEmailVerificationEmail,
  buildOtpEmail,
  buildPasswordResetEmail,
} from "@/lib/email/templates";

function resolveBaseUrl(): string {
  if (process.env.BETTER_AUTH_URL?.trim()) {
    return process.env.BETTER_AUTH_URL.trim();
  }
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim();
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return "http://localhost:3000";
}

function createAuthInstance() {
  return betterAuth({
    appName: "JaniduDev",
    baseURL: resolveBaseUrl(),
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        twoFactor: schema.twoFactor,
        rateLimit: schema.rateLimit,
      },
    }),
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "admin",
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      // Public self-registration is strictly disabled; admin accounts are created via CLI only.
      disableSignUp: true,
      requireEmailVerification: false,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 1800, // 30 minutes
      async sendResetPassword({ user, url }) {
        const email = buildPasswordResetEmail(url);
        await sendTransactionalEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
          templateName: "password_reset",
        });
      },
    },
    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      async sendVerificationEmail({ user, url }) {
        const email = buildEmailVerificationEmail(url);
        await sendTransactionalEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
          templateName: "email_verification",
        });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      storage: "database",
      customRules: {
        "/sign-in/email": { window: 60 * 15, max: 10 },
        "/forget-password": { window: 60 * 15, max: 5 },
        "/email-otp/send-verification-otp": { window: 60 * 15, max: 5 },
        "/two-factor/verify-totp": { window: 60 * 10, max: 10 },
      },
    },
    trustedOrigins: [
      "http://localhost:3000",
      "https://www.janidudev.com",
      "https://janidudev.com",
    ],
    plugins: [
      twoFactor({
        issuer: "JaniduDev Admin",
        totpOptions: {
          digits: 6,
          period: 30,
        },
        backupCodeOptions: {
          amount: 8,
          length: 10,
        },
        otpOptions: {
          period: 5,
          async sendOTP({ user, otp }) {
            const email = buildOtpEmail(otp, "verify your sign-in");
            await sendTransactionalEmail({
              to: user.email,
              subject: email.subject,
              html: email.html,
              text: email.text,
              templateName: "two_factor_otp",
            });
          },
        },
      }),
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        disableSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          const purpose =
            type === "forget-password"
              ? "reset your admin password"
              : type === "sign-in"
                ? "sign in to your admin dashboard"
                : "confirm your email address";
          const tmpl = buildOtpEmail(otp, purpose);
          await sendTransactionalEmail({
            to: email,
            subject: tmpl.subject,
            html: tmpl.html,
            text: tmpl.text,
            templateName: `email_otp_${type}`,
          });
        },
      }),
      nextCookies(), // MUST be last plugin for Next.js App Router cookie writes
    ],
  });
}

type AuthInstance = ReturnType<typeof createAuthInstance>;
let cachedAuth: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!cachedAuth) {
    cachedAuth = createAuthInstance();
  }
  return cachedAuth;
}
