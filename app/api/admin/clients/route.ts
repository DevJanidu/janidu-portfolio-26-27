import crypto from "crypto";
import { NextResponse } from "next/server";
import { desc, isNull } from "drizzle-orm";
import { z } from "zod";
import { requireAdminApi, logActivity } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { cachedQuery, invalidateCacheTags } from "@/lib/cache/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createClientSchema = z.object({
  name: z.string().min(2, "Please enter the client's name.").max(120),
  businessName: z.string().max(140).optional().nullable(),
  email: z.string().max(160).optional().nullable(),
  phone: z.string().max(60).optional().nullable(),
  country: z.string().max(80).optional().default("USA"),
  status: z.enum(["lead", "active", "completed", "paused", "archived"]).optional().default("active"),
  privateNotes: z.string().max(4000).optional().default(""),
});

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const items = await cachedQuery(
      "adm:clients:list",
      async () => {
        const db = getDb();
        const [clients, projects] = await Promise.all([
          db
            .select()
            .from(schema.clients)
            .where(isNull(schema.clients.deletedAt))
            .orderBy(desc(schema.clients.createdAt)),
          db
            .select()
            .from(schema.clientProjects)
            .where(isNull(schema.clientProjects.deletedAt))
            .orderBy(desc(schema.clientProjects.createdAt)),
        ]);

        const projectsByClient = new Map<string, typeof projects>();
        for (const p of projects) {
          const list = projectsByClient.get(p.clientId) || [];
          list.push(p);
          projectsByClient.set(p.clientId, list);
        }

        return clients.map((c) => ({
          ...c,
          projects: projectsByClient.get(c.id) || [],
        }));
      },
      { ttlSeconds: 120, l1TtlSeconds: 15, tags: ["clients"] }
    );

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load your clients." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const raw = await request.json();
    const parsed = createClientSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check the client details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const [created] = await getDb()
      .insert(schema.clients)
      .values({
        id: crypto.randomUUID(),
        name: d.name.trim(),
        businessName: d.businessName?.trim() || null,
        email: d.email?.trim() || null,
        phone: d.phone?.trim() || null,
        country: d.country.trim() || "USA",
        status: d.status,
        privateNotes: d.privateNotes.trim(),
      })
      .returning();

    await invalidateCacheTags(["clients", "overview"]);
    await logActivity({
      actorUserId: auth.session.user.id,
      action: `Added new client "${created.name}"`,
      entityType: "client",
      entityId: created.id,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not add this client." },
      { status: 500 }
    );
  }
}
