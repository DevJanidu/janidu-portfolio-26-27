import crypto from "crypto";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "project_view",
  "category_view",
  "whatsapp_click",
  "email_click",
  "demo_click",
  "enquiry_submit",
]);

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await request.json();
    const eventType = String(body.eventType || "");
    const path = String(body.path || "/").slice(0, 200);
    const entitySlug = body.entitySlug ? String(body.entitySlug).slice(0, 120) : null;

    if (!ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const countryCode =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    await getDb().insert(schema.analyticsEvents).values({
      id: crypto.randomUUID(),
      eventType,
      path,
      entitySlug,
      countryCode,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
