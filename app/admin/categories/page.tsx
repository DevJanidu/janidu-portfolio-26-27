"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  X,
} from "lucide-react";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import { getAdminCache, setAdminCache } from "@/lib/admin/client-cache";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  sectionTitle: string;
  sectionSubtitle: string | null;
  description: string;
  coverMediaId: string | null;
  coverUrl: string | null;
  displayOrder: number;
  status: "draft" | "published";
  isVisible: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  projectCount: number;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  sectionTitle: "",
  sectionSubtitle: "",
  description: "",
  coverMediaId: "" as string | null,
  coverUrl: "" as string | null,
  status: "published" as "draft" | "published",
  isVisible: true,
  seoTitle: "",
  seoDescription: "",
};

function makeSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string>("");
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function loadCategories() {
    const cached = getAdminCache<CategoryItem[]>("categories");
    if (cached) {
      setItems(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      const fresh: CategoryItem[] = data.items || [];
      setItems(fresh);
      setAdminCache("categories", fresh);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(cat: CategoryItem) {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      sectionTitle: cat.sectionTitle,
      sectionSubtitle: cat.sectionSubtitle || "",
      description: cat.description || "",
      coverMediaId: cat.coverMediaId,
      coverUrl: cat.coverUrl,
      status: cat.status,
      isVisible: cat.isVisible,
      seoTitle: cat.seoTitle || "",
      seoDescription: cat.seoDescription || "",
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : "/api/admin/categories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || makeSlug(form.name),
          sectionTitle: form.sectionTitle || form.name,
          sectionSubtitle: form.sectionSubtitle || null,
          description: form.description,
          coverMediaId: form.coverMediaId || null,
          status: form.status,
          isVisible: form.isVisible,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ type: "err", text: data.error || "Could not save your changes." });
      } else {
        setModalOpen(false);
        setNotice({
          type: "ok",
          text: editing
            ? `Updated "${form.name}" and refreshed your website.`
            : `Created "${form.name}"! It is now ready on your website.`,
        });
        await loadCategories();
      }
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setItems(copy);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reorderIds: copy.map((c) => c.id) }),
    });
  }

  async function toggleVisibility(cat: CategoryItem) {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !cat.isVisible }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isVisible: !c.isVisible } : c))
      );
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const qs = moveTargetId ? `?moveToCategoryId=${encodeURIComponent(moveTargetId)}` : "";
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}${qs}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setDeleteTarget(null);
      setMoveTargetId("");
      setNotice({
        type: "ok",
        text: `Removed "${deleteTarget.name}". All projects were kept safe.`,
      });
      await loadCategories();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Project Categories</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Create new industry showcases (like Restaurants, Hotels, Salons, or Law Firms) anytime — no coding needed.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Create Category
        </button>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-xs text-neutral-500 mt-1">
            Click &ldquo;Create Category&rdquo; to add your first industry showcase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((cat, idx) => (
            <div
              key={cat.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveOrder(idx, -1)}
                    aria-label="Move up"
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 dark:hover:bg-neutral-800"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveOrder(idx, 1)}
                    aria-label="Move down"
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 dark:hover:bg-neutral-800"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="h-14 w-20 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {cat.coverUrl ? (
                    <img
                      src={cat.coverUrl}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-neutral-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold truncate">{cat.name}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        cat.status === "published" && cat.isVisible
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {cat.status === "published"
                        ? cat.isVisible
                          ? "Live on website"
                          : "Hidden"
                        : "Draft"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {cat.projectCount} {cat.projectCount === 1 ? "project" : "projects"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {cat.sectionTitle} · /categories/{cat.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/categories/${cat.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  title="View category page"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => toggleVisibility(cat)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  title={cat.isVisible ? "Hide from website" : "Show on website"}
                >
                  {cat.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="rounded-xl border border-red-200 dark:border-red-900/60 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-base font-semibold">
                {editing ? `Edit "${editing.name}"` : "Create a New Category"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name: val,
                        slug: editing ? f.slug : makeSlug(val),
                        sectionTitle: editing ? f.sectionTitle : f.sectionTitle || `Modern ${val} Websites`,
                      }));
                    }}
                    placeholder="e.g. Restaurants"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Page link</label>
                  <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm">
                    <span className="text-neutral-400 text-xs mr-1">/categories/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: makeSlug(e.target.value) }))}
                      placeholder="restaurants"
                      className="w-full bg-transparent focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Section Title *</label>
                <input
                  type="text"
                  required
                  value={form.sectionTitle}
                  onChange={(e) => setForm((f) => ({ ...f, sectionTitle: e.target.value }))}
                  placeholder="e.g. Modern Restaurant Websites"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Subtitle (optional)</label>
                <input
                  type="text"
                  value={form.sectionSubtitle}
                  onChange={(e) => setForm((f) => ({ ...f, sectionSubtitle: e.target.value }))}
                  placeholder="e.g. Designed to showcase menus and generate table bookings"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell visitors what makes your websites in this industry effective..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
                    {form.coverUrl ? (
                      <img src={form.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3.5 py-2 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      {form.coverUrl ? "Change Cover Image" : "Choose or Upload Image"}
                    </button>
                    {form.coverUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, coverMediaId: null, coverUrl: null }))}
                        className="text-xs text-red-600 text-left hover:underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-sm font-medium mb-1">Publish Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))
                    }
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  >
                    <option value="published">Published (Live on website)</option>
                    <option value="draft">Draft (Only visible to you)</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    Show on public website
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Save Changes" : "Create & Update Website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-semibold">Delete &ldquo;{deleteTarget.name}&rdquo;?</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {deleteTarget.projectCount > 0
                ? `This category currently holds ${deleteTarget.projectCount} ${deleteTarget.projectCount === 1 ? "project" : "projects"}. Your projects will NEVER be deleted. Choose what to do with them:`
                : "No projects are inside this category. You can safely delete it."}
            </p>
            {deleteTarget.projectCount > 0 && (
              <div>
                <label className="block text-xs font-medium mb-1">Move projects to:</label>
                <select
                  value={moveTargetId}
                  onChange={(e) => setMoveTargetId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                >
                  <option value="">Keep them uncategorized</option>
                  {items
                    .filter((c) => c.id !== deleteTarget.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Move to &ldquo;{c.name}&rdquo;
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="categories"
        title="Choose Category Cover Image"
        onSelect={(asset) =>
          setForm((f) => ({ ...f, coverMediaId: asset.id, coverUrl: asset.url }))
        }
      />
    </div>
  );
}
