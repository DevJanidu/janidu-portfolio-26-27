import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { invalidateCacheTags } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createClientProjectSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(2, "Please enter a project title.").max(140),
  stage: z
    .enum([
      "proposal_sent",
      "deposit_received",
      "in_development",
      "preview_ready",
      "revisions",
      "final_payment",
      "launched",
      "maintenance",
    ])
    .optional()
    .default("proposal_sent"),
  agreedAmount: z.string().optional().nullable(),
  currency: z.string().max(10).optional().default("USD"),
  targetLaunchDate: z.string().optional().nullable(),
  privatePreviewUrl: z.string().optional().nullable(),
  liveSiteUrl: z.string().optional().nullable(),
  privateNotes: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const raw = await request.json();
    const parsed = createClientProjectSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check project details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const projectId = crypto.randomUUID();
    const db = getDb();

    const [created] = await db
      .insert(schema.clientProjects)
      .values({
        id: projectId,
        clientId: d.clientId,
        title: d.title.trim(),
        stage: d.stage,
        agreedAmount: d.agreedAmount ? String(d.agreedAmount) : null,
        currency: d.currency || "USD",
        targetLaunchDate: d.targetLaunchDate || null,
        privatePreviewUrl: d.privatePreviewUrl?.trim() || null,
        liveSiteUrl: d.liveSiteUrl?.trim() || null,
        privateNotes: d.privateNotes.trim(),
      })
      .returning();

    // Seed default 4-step milestones matching JaniduDev's real client workflow
    const defaults = [
      "Collect branding, photos & service list",
      "50% deposit received",
      "Private preview link shared for review",
      "Revisions approved & final 50% paid",
      "Domain connected & website launched",
    ];
    for (let i = 0; i < defaults.length; i++) {
      await db.insert(schema.clientProjectMilestones).values({
        id: crypto.randomUUID(),
        clientProjectId: projectId,
        title: defaults[i],
        isCompleted: false,
        displayOrder: i + 1,
      });
    }

    await invalidateCacheTags(["clients", "overview"]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Created client project "${created.title}"`,
      entityType: "client_project",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("[client-projects POST]", err);
    return NextResponse.json(
      { error: "Could not create client project." },
      { status: 500 }
    );
  }
}
