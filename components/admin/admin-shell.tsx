"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Tags,
  MessageSquareQuote,
  FileEdit,
  Briefcase,
  Image as ImageIcon,
  Inbox,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { invalidateAdminCache } from "@/lib/admin/client-cache";

interface AdminShellProps {
  user: {
    name: string;
    email: string;
    twoFactorEnabled: boolean;
  };
  badges: {
    unreadEnquiries: number;
    pendingReviews: number;
  };
  children: React.ReactNode;
}

type ThemePref = "light" | "dark" | "system";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badgeKey?: "unreadEnquiries" | "pendingReviews";
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/admin/enquiries", label: "Customer Enquiries", icon: Inbox, badgeKey: "unreadEnquiries" as const },
      { href: "/admin/clients", label: "Clients & Projects", icon: Users },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/reviews", label: "Customer Reviews", icon: MessageSquareQuote, badgeKey: "pendingReviews" as const },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/content", label: "Website Content", icon: FileEdit },
      { href: "/admin/services", label: "Services", icon: Briefcase },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminShell({ user, badges, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [theme, setTheme] = useState<ThemePref>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("janidu_admin_theme") as ThemePref) || "light";
    setTheme(saved);
  }, []);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  function cycleTheme() {
    const next: ThemePref =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("janidu_admin_theme", next);
  }

  async function handleSignOut() {
    setSigningOut(true);
    invalidateAdminCache();
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-200/80 dark:border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-sm dark:bg-white dark:text-neutral-900">
            JD
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">JaniduDev</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Website Manager
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {badgeCount > 0 && (
                        <span
                          className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                            active
                              ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-200/80 dark:border-neutral-800 p-3 space-y-1.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
        >
          <span>View Website</span>
          <ExternalLink className="h-4 w-4 text-neutral-400" />
        </a>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{signingOut ? "Signing out..." : "Log Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="admin-dashboard min-h-dvh bg-[#FAF9F6] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 z-30">
          {sidebarContent}
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-neutral-900 h-full shadow-xl z-10">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Main Column */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-4 border-b border-neutral-200/80 bg-white/90 px-5 sm:px-8 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hidden sm:inline">
                Signed in as{" "}
                <strong className="text-neutral-900 dark:text-white">{user.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cycleTheme}
                title={`Appearance: ${theme}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {theme === "light" && <Sun className="h-3.5 w-3.5" />}
                {theme === "dark" && <Moon className="h-3.5 w-3.5" />}
                {theme === "system" && <Monitor className="h-3.5 w-3.5" />}
                <span className="capitalize hidden sm:inline">{theme}</span>
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                View Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
