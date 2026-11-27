"use client";

import { useState, useEffect } from "react";
import {
  Check,
  EyeOff,
  Star,
  Trash2,
  RotateCcw,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/admin/client-cache";

interface ReviewItem {
  id: string;
  rating: number;
  projectName: string;
  comment: string;
  clientName: string;
  businessName: string | null;
  country: string;
  status: string;
  featured: boolean;
  publishedAt: string;
  source: string;
}

const TABS = [
  { id: "pending", label: "Awaiting Approval" },
  { id: "published", label: "Published" },
  { id: "hidden", label: "Hidden" },
  { id: "trashed", label: "Trash" },
  { id: "all", label: "All Reviews" },
];

export default function AdminReviewsPage() {
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("United States");
  const [projectName, setProjectName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function load(activeTab = tab) {
    const key = `reviews:${activeTab}`;
    const cached = getAdminCache<ReviewItem[]>(key);
    if (cached) {
      setItems(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/admin/reviews?status=${activeTab}`);
      const data = await res.json();
      const fresh: ReviewItem[] = data.items || [];
      setItems(fresh);
      setAdminCache(key, fresh);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  async function updateReview(id: string, body: Record<string, unknown>, msg?: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      if (msg) setNotice(msg);
      await load(tab);
    }
  }

  async function trashReview(id: string) {
    if (!confirm("Move this review to Trash?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotice("Moved review to Trash.");
      await load(tab);
    }
  }

  async function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          businessName: businessName || null,
          country,
          projectName,
          rating,
          comment,
          status: "published",
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setClientName("");
        setBusinessName("");
        setProjectName("");
        setComment("");
        setRating(5);
        setNotice("Published the new customer review to your website.");
        setTab("published");
        await load("published");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer Reviews</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Approve new reviews submitted on your website, highlight favorites, or add genuine testimonials manually.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
              tab === t.id
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <p className="text-sm font-medium">No reviews in this tab</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-amber-500 text-sm">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    <span className="font-semibold text-sm">{r.clientName}</span>
                    {r.businessName && (
                      <span className="text-xs text-neutral-500">({r.businessName})</span>
                    )}
                    <span className="text-xs text-neutral-500">· {r.country}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Project: {r.projectName} · {r.publishedAt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {tab !== "trashed" ? (
                    <>
                      {r.status !== "published" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateReview(r.id, { status: "published" }, `Approved review from ${r.clientName}.`)
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve &amp; Publish
                        </button>
                      )}
                      {r.status === "published" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateReview(r.id, { status: "hidden" }, `Hidden review from ${r.clientName}.`)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          Hide
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          updateReview(r.id, { featured: !r.featured })
                        }
                        title="Feature on homepage"
                        className={`rounded-xl border p-1.5 ${
                          r.featured
                            ? "border-amber-300 bg-amber-50 text-amber-600"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-400"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${r.featured ? "fill-amber-500" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => trashReview(r.id)}
                        className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateReview(r.id, { action: "restore" }, "Restored review from Trash.")
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Add Genuine Customer Testimonial</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddManual} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Star Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Review Message *</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
                >
                  {saving ? "Publishing..." : "Publish Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
