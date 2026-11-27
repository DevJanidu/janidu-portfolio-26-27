"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Star,
  Copy,
  Trash2,
  RotateCcw,
  Pencil,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/admin/client-cache";

interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  classification: string;
  coverUrl: string | null;
  status: "draft" | "published";
  isVisible: boolean;
  isFeatured: boolean;
  deletedAt: string | null;
}

const CLASS_LABELS: Record<string, string> = {
  client_work: "Client Project",
  demo: "Demo Website",
  design_concept: "Design Concept",
  personal: "Personal",
};

export default function AdminProjectsPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [tab, setTab] = useState<"active" | "trashed">("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function load(showTrashed = tab === "trashed", background = false) {
    const cacheKey = `projects:${showTrashed ? "trashed" : "active"}`;
    const cached = getAdminCache<ProjectItem[]>(cacheKey);
    if (cached && !background) {
      setItems(cached);
      setLoading(false);
    } else if (!background) {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/admin/projects?trashed=${showTrashed}`);
      const data = await res.json();
      const fresh: ProjectItem[] = data.items || [];
      setItems(fresh);
      setAdminCache(cacheKey, fresh);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab === "trashed");
  }, [tab]);

  async function toggleFeatured(p: ProjectItem) {
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !p.isFeatured }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isFeatured: !x.isFeatured } : x))
      );
    }
  }

  async function duplicateProject(p: ProjectItem) {
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    if (res.ok) {
      setNotice(`Created a draft copy of "${p.title}".`);
      load(false);
    }
  }

  async function trashProject(p: ProjectItem) {
    if (!confirm(`Move "${p.title}" to Trash? You can restore it later.`)) return;
    const res = await fetch(`/api/admin/projects/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      setNotice(`Moved "${p.title}" to Trash.`);
    }
  }

  async function restoreProject(p: ProjectItem) {
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      setNotice(`Restored "${p.title}" back to your projects.`);
    }
  }

  const filtered = items.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio Projects</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Add, edit, feature, or organize every project displayed on your website.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
              tab === "active"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600"
            }`}
          >
            All Projects
          </button>
          <button
            type="button"
            onClick={() => setTab("trashed")}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
              tab === "trashed"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600"
            }`}
          >
            Trash
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or categories..."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <p className="text-sm font-medium">
            {tab === "trashed" ? "Trash is empty" : "No projects found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/10] bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden flex items-center justify-center">
                {p.coverUrl ? (
                  <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-neutral-400" />
                )}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${
                      p.status === "published"
                        ? "bg-emerald-600/90 text-white"
                        : "bg-neutral-900/80 text-white"
                    }`}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span className="rounded-full bg-white/90 text-neutral-900 px-2.5 py-0.5 text-[11px] font-medium">
                    {CLASS_LABELS[p.classification] || p.classification}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-base truncate">{p.title}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">{p.categoryName}</p>
                </div>

                {tab === "active" ? (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        title={p.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                        className={`rounded-lg p-1.5 transition-colors ${
                          p.isFeatured
                            ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                            : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${p.isFeatured ? "fill-amber-500" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateProject(p)}
                        title="Duplicate project"
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={`/projects/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on website"
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => trashProject(p)}
                        title="Move to Trash"
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => restoreProject(p)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore Project
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
