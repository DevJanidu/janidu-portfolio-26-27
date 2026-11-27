import { desc, eq, gte, sql } from "drizzle-orm";
import { BarChart3, Eye, FolderKanban, Inbox, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";
import { getDb, schema } from "@/lib/db";
import { cachedQuery } from "@/lib/cache/redis";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const data = await cachedQuery(
    "adm:analytics:30d",
    async () => {
      const db = getDb();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [eventCounts, topPages, totalEnquiriesRes] = await Promise.all([
        db
          .select({
            eventType: schema.analyticsEvents.eventType,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.analyticsEvents)
          .where(gte(schema.analyticsEvents.createdAt, thirtyDaysAgo))
          .groupBy(schema.analyticsEvents.eventType),
        db
          .select({
            path: schema.analyticsEvents.path,
            views: sql<number>`count(*)::int`,
          })
          .from(schema.analyticsEvents)
          .where(eq(schema.analyticsEvents.eventType, "page_view"))
          .groupBy(schema.analyticsEvents.path)
          .orderBy(desc(sql`count(*)`))
          .limit(8),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.inquiries)
          .where(gte(schema.inquiries.createdAt, thirtyDaysAgo)),
      ]);

      const map = new Map(eventCounts.map((e) => [e.eventType, e.count]));
      return {
        pageViews: map.get("page_view") ?? 0,
        projectViews: map.get("project_view") ?? 0,
        contactClicks: (map.get("whatsapp_click") ?? 0) + (map.get("email_click") ?? 0),
        enquiries30d: totalEnquiriesRes[0]?.count ?? 0,
        topPages,
      };
    },
    { ttlSeconds: 120, l1TtlSeconds: 30, tags: ["analytics", "enquiries"] }
  );

  const { pageViews, projectViews, contactClicks, enquiries30d, topPages } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Website Analytics</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Real, privacy-friendly activity from the last 30 days. Only real visitor numbers are shown here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Page Views (30 days)", value: pageViews, icon: Eye },
          { label: "Project Views (30 days)", value: projectViews, icon: FolderKanban },
          { label: "WhatsApp / Email Clicks", value: contactClicks, icon: MessageCircle },
          { label: "Enquiries Received (30d)", value: enquiries30d, icon: Inbox },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
            >
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-medium">{card.label}</span>
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-3xl font-semibold">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Most Visited Pages</h2>
          <BarChart3 className="h-4 w-4 text-neutral-400" />
        </div>
        {topPages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-10 text-center">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              No visitor data recorded yet
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              As real visitors browse your portfolio, your most popular pages and project views will appear here automatically.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {topPages.map((p) => (
              <li key={p.path} className="py-3 flex items-center justify-between text-sm">
                <span className="font-medium">{p.path}</span>
                <span className="text-neutral-500">{p.views} views</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
