import crypto from "crypto";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, isDatabaseConfigured, schema } from "@/lib/db";
import { invalidateCacheTags } from "@/lib/cache/redis";

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  twoFactorEnabled: boolean;
}

export interface AdminSessionResult {
  user: AdminSessionUser;
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Reads the current verified session from Better Auth.
 * Deduplicated per-request via React cache() so layout + page never verify twice.
 * Returns null if unauthenticated or if the user does not have role === 'admin'.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionResult | null> => {
  if (!isDatabaseConfigured()) return null;
  try {
    const hdrs = await headers();
    const res = await getAuth().api.getSession({ headers: hdrs });
    if (!res?.user || !res?.session) return null;

    const u = res.user as unknown as Partial<AdminSessionUser>;
    if (u.role && u.role !== "admin") return null;

    return {
      user: {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        emailVerified: Boolean(res.user.emailVerified),
        role: u.role || "admin",
        twoFactorEnabled: Boolean(u.twoFactorEnabled),
      },
      session: {
        id: res.session.id,
        token: res.session.token,
        expiresAt: new Date(res.session.expiresAt),
        ipAddress: res.session.ipAddress ?? null,
        userAgent: res.session.userAgent ?? null,
      },
    };
  } catch {
    return null;
  }
});

/**
 * Use inside Server Components and Server Actions under /admin.
 * Redirects to /login when unauthenticated.
 */
export async function requireAdmin(): Promise<AdminSessionResult> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Use inside /api/admin/* Route Handlers.
 * Returns either { session } or { errorResponse } with HTTP 401.
 */
export async function requireAdminApi(): Promise<
  | { session: AdminSessionResult; errorResponse?: never }
  | { session?: never; errorResponse: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Records a human-readable admin action in activity_logs.
 */
export async function logActivity(params: {
  actorUserId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await getDb().insert(schema.activityLogs).values({
      id: crypto.randomUUID(),
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      ipAddress: params.ipAddress ?? null,
    });
    await invalidateCacheTags(["overview"]);
  } catch {
    // Never block primary admin actions if audit logging fails
  }
}
