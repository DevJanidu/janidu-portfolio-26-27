/**
 * Interactive CLI script to create or update the single JaniduDev Admin user.
 * Never hardcodes credentials — reads from CLI prompt or one-time environment args.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import crypto from "crypto";
import readline from "readline";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { getDb, schema } from "../lib/db";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const db = getDb();

  const email =
    process.env.ADMIN_BOOTSTRAP_EMAIL?.trim() ||
    (await prompt("Admin email (e.g. hello@janidudev.com): "));
  const name =
    process.env.ADMIN_BOOTSTRAP_NAME?.trim() ||
    (await prompt("Admin display name (default: Janidu Yapa): ")) ||
    "Janidu Yapa";
  const password =
    process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() ||
    (await prompt("Admin password (minimum 10 characters): "));

  if (!email || !email.includes("@")) {
    console.error("Invalid email address.");
    process.exit(1);
  }
  if (!password || password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await hashPassword(password);

  const existingUsers = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, normalizedEmail));

  if (existingUsers.length > 0) {
    const existing = existingUsers[0];
    await db
      .update(schema.user)
      .set({
        name,
        emailVerified: true,
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, existing.id));

    const existingAccounts = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, existing.id));

    const credAccount = existingAccounts.find((a) => a.providerId === "credential");
    if (credAccount) {
      await db
        .update(schema.account)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(schema.account.id, credAccount.id));
    } else {
      await db.insert(schema.account).values({
        id: crypto.randomUUID(),
        accountId: existing.id,
        providerId: "credential",
        userId: existing.id,
        password: passwordHash,
      });
    }

    console.log(`Updated existing admin user: ${normalizedEmail}`);
    return;
  }

  const userId = crypto.randomUUID();
  await db.insert(schema.user).values({
    id: userId,
    name,
    email: normalizedEmail,
    emailVerified: true,
    role: "admin",
    twoFactorEnabled: false,
  });

  await db.insert(schema.account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
  });

  console.log(`Created admin user: ${normalizedEmail}`);
  console.log("You can now sign in at /login and enable Two-Factor Verification in Settings.");
}

main().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
