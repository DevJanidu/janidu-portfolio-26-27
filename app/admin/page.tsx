import Link from "next/link";
import { desc } from "drizzle-orm";
import {
  FolderKanban,
  Tags,
  MessageSquareQuote,
  Inbox,
  Users,
  Plus,
  ExternalLink,
  AlertCircle,
  Clock,
  FileEdit,
  ShieldAlert,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";
import { getDb, getSql, schema } from "@/lib/db";
import { cachedQuery } from "@/lib/cache/redis";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { user } = await requireAdmin();

  const overview = await cachedQuery(
    "adm:overview",
    async () => {
      const sql = getSql();
      const db = getDb();
      const [countsRows, activityRows] = await Promise.all([
        sql`
          SELECT
            (SELECT count(*)::int FROM projects WHERE deleted_at IS NULL) AS total_projects,
            (SELECT count(*)::int FROM projects WHERE status = 'published' AND deleted_at IS NULL) AS published_projects,
            (SELECT count(*)::int FROM projects WHERE status = 'draft' AND deleted_at IS NULL) AS draft_projects,
            (SELECT count(*)::int FROM project_categories WHERE deleted_at IS NULL) AS categories,
            (SELECT count(*)::int FROM reviews WHERE status = 'published' AND deleted_at IS NULL) AS published_reviews,
            (SELECT count(*)::int FROM reviews WHERE status = 'pending' AND deleted_at IS NULL) AS pending_reviews,
            (SELECT count(*)::int FROM inquiries WHERE status = 'new' AND deleted_at IS NULL) AS new_enquiries,
            (SELECT count(*)::int FROM client_projects WHERE deleted_at IS NULL) AS active_client_projects
        `,
        db
          .select()
          .from(schema.activityLogs)
          .orderBy(desc(schema.activityLogs.createdAt))
          .limit(8),
      ]);

      const c = (countsRows[0] ?? {}) as Record<string, number | undefined>;
      return {
        stats: {
          totalProjects: c?.total_projects ?? 0,
          publishedProjects: c?.published_projects ?? 0,
          draftProjects: c?.draft_projects ?? 0,
          categories: c?.categories ?? 0,
          publishedReviews: c?.published_reviews ?? 0,
          pendingReviews: c?.pending_reviews ?? 0,
          newEnquiries: c?.new_enquiries ?? 0,
          activeClientProjects: c?.active_client_projects ?? 0,
        },
        recentActivity: activityRows.map((a) => ({
          id: a.id,
          action: a.action,
          createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
        })),
      };
    },
    {
      ttlSeconds: 60,
      l1TtlSeconds: 15,
      tags: ["overview", "projects", "categories", "reviews", "enquiries", "clients"],
    }
  );

  const { stats, recentActivity } = overview;

  const firstName = user.name.split(" ")[0] || "Janidu";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Here is a live summary of your portfolio, customer reviews, enquiries, and active clients.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            <Plus className="h-4 w-4" />
            Add a Project
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            View Live Website
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Security Nudge if 2FA not enabled */}
      {!user.twoFactorEnabled && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                Protect your admin account with Two-Step Verification
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                Turn on an authenticator app code so only you can sign in to manage your website.
              </p>
            </div>
          </div>
          <Link
            href="/admin/setup-2fa"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800"
          >
            Turn On Two-Step Verification
          </Link>
        </div>
      )}

      {/* Needs Attention */}
      {(stats.newEnquiries > 0 || stats.pendingReviews > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.newEnquiries > 0 && (
            <Link
              href="/admin/enquiries"
              className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 p-4 hover:bg-blue-50 transition-colors dark:border-blue-900/50 dark:bg-blue-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Inbox className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                    {stats.newEnquiries} new customer {stats.newEnquiries === 1 ? "enquiry" : "enquiries"}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Open inbox to read and reply
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Open →
              </span>
            </Link>
          )}
          {stats.pendingReviews > 0 && (
            <Link
              href="/admin/reviews"
              className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 hover:bg-emerald-50 transition-colors dark:border-emerald-900/50 dark:bg-emerald-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                    {stats.pendingReviews} {stats.pendingReviews === 1 ? "review" : "reviews"} waiting for approval
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">
                    Review and publish to your website
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Review →
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          href="/admin/projects"
          icon={FolderKanban}
          label="Portfolio Projects"
          value={stats.totalProjects}
          sub={`${stats.publishedProjects} published · ${stats.draftProjects} drafts`}
        />
        <MetricCard
          href="/admin/categories"
          icon={Tags}
          label="Project Categories"
          value={stats.categories}
          sub="Industry showcases on your site"
        />
        <MetricCard
          href="/admin/reviews"
          icon={MessageSquareQuote}
          label="Customer Reviews"
          value={stats.publishedReviews}
          sub={
            stats.pendingReviews > 0
              ? `${stats.pendingReviews} waiting for approval`
              : "All reviews moderated"
          }
        />
        <MetricCard
          href="/admin/clients"
          icon={Users}
          label="Client Projects"
          value={stats.activeClientProjects}
          sub={`${stats.newEnquiries} new enquiries in inbox`}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/projects/new", label: "Add a new project", icon: Plus },
              { href: "/admin/categories", label: "Create a project category", icon: Tags },
              { href: "/admin/reviews", label: "Manage customer reviews", icon: MessageSquareQuote },
              { href: "/admin/enquiries", label: "View customer enquiries", icon: Inbox },
              { href: "/admin/clients", label: "Manage clients & active builds", icon: Users },
              { href: "/admin/content", label: "Edit website content", icon: FileEdit },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Icon className="h-4 w-4 text-neutral-500" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Website Activity</h2>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          {recentActivity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                No recent changes yet
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Whenever you add a project, approve a review, or update website content, it will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentActivity.map((log) => (
                <li key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-neutral-800 dark:text-neutral-200">
                    {log.action}
                  </span>
                  <span className="text-xs text-neutral-500 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  href,
  icon: Icon,
  label,
  value,
  sub,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-neutral-200/80 bg-white p-5 hover:border-neutral-300 hover:shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <Icon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{sub}</div>
    </Link>
  );
}
