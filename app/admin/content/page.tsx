"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

interface SectionItem {
  id: string;
  sectionKey: string | null;
  templateType: string;
  title: string;
  contentJson: Record<string, unknown>;
  status: string;
  isVisible: boolean;
}

export default function WebsiteContentPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("/#contact");
  const [isVisible, setIsVisible] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      const list: SectionItem[] = data.items || [];
      setSections(list);
      if (list.length > 0 && !selectedId) {
        selectSection(list[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function selectSection(sec: SectionItem) {
    setSelectedId(sec.id);
    setTitle(sec.title);
    const c = sec.contentJson || {};
    setHeading(String(c.heading || c.headline || sec.title || ""));
    setBody(String(c.body || c.subheadline || c.story || ""));
    setCtaLabel(String(c.ctaLabel || c.primaryCta || ""));
    setCtaHref(String(c.ctaHref || "/#contact"));
    setIsVisible(sec.isVisible);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          title,
          isVisible,
          status: "published",
          contentJson: { heading, body, ctaLabel, ctaHref },
        }),
      });
      if (res.ok) {
        setNotice("Saved and updated your website!");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function addNewSection(templateType: "announcement" | "cta") {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType,
          title: templateType === "announcement" ? "Announcement Banner" : "Call to Action Section",
          isVisible: true,
          status: "published",
          contentJson: {
            heading:
              templateType === "announcement"
                ? "Now booking new client websites for next month"
                : "Ready to upgrade your business website?",
            body: "Send a quick message and I'll reply within 24 hours.",
            ctaLabel: "Get in Touch",
            ctaHref: "/#contact",
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setNotice("Added new section to your homepage!");
        await load();
        selectSection(data.item);
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeSection(sec: SectionItem) {
    if (!confirm(`Delete "${sec.title}" from your website?`)) return;
    const res = await fetch(`/api/admin/content?id=${encodeURIComponent(sec.id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSelectedId(null);
      setNotice(`Removed "${sec.title}".`);
      await load();
    }
  }

  const selected = sections.find((s) => s.id === selectedId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Website Content</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Update text on your homepage or add new announcement banners and call-to-action sections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addNewSection("announcement")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-semibold hover:bg-neutral-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Announcement Banner
          </button>
          <button
            type="button"
            onClick={() => addNewSection("cta")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Custom Section
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => selectSection(sec)}
                className={`w-full text-left rounded-2xl border p-4 flex items-center justify-between transition-all ${
                  selectedId === sec.id
                    ? "border-neutral-900 bg-white dark:border-white dark:bg-neutral-900"
                    : "border-neutral-200/80 bg-white/70 dark:border-neutral-800 dark:bg-neutral-900/60"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{sec.title}</p>
                  <p className="text-xs text-neutral-500 capitalize">
                    {sec.templateType.replace("_", " ")}
                  </p>
                </div>
                {sec.isVisible ? (
                  <Eye className="h-4 w-4 text-emerald-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-neutral-400" />
                )}
              </button>
            ))}
          </div>

          {selected && (
            <form
              onSubmit={handleSave}
              className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 h-fit"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h2 className="text-base font-semibold">Edit Section</h2>
                {!selected.sectionKey && (
                  <button
                    type="button"
                    onClick={() => removeSection(selected)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Section
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Section Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Main Heading</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description / Text</label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text (optional)</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="e.g. Start a Project"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <input
                    type="text"
                    value={ctaHref}
                    onChange={(e) => setCtaHref(e.target.value)}
                    placeholder="/#contact"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Show this section on the public website
              </label>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save &amp; Update Website
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
