import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import { getSql } from "@/lib/db";
import { cachedQuery } from "@/lib/cache/redis";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard — JaniduDev",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  const badges = await cachedQuery(
    "adm:badges",
    async () => {
      const sql = getSql();
      const rows = (await sql`
        SELECT
          (SELECT count(*)::int FROM inquiries WHERE is_read = FALSE AND deleted_at IS NULL) AS unread_enquiries,
          (SELECT count(*)::int FROM reviews WHERE status = 'pending' AND deleted_at IS NULL) AS pending_reviews
      `) as Array<{ unread_enquiries: number; pending_reviews: number }>;
      return {
        unreadEnquiries: rows[0]?.unread_enquiries ?? 0,
        pendingReviews: rows[0]?.pending_reviews ?? 0,
      };
    },
    { ttlSeconds: 60, l1TtlSeconds: 15, tags: ["badges", "enquiries", "reviews"] }
  );

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
      }}
      badges={badges}
    >
      {children}
    </AdminShell>
  );
}
