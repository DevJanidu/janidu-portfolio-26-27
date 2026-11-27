"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";

interface CategoryOption {
  id: string;
  name: string;
}

interface GalleryItem {
  mediaId: string;
  url: string;
  deviceType: "desktop" | "mobile" | "gallery";
  title: string;
  caption: string;
  altText: string;
}

interface ProjectWizardProps {
  projectId?: string;
}

const STEPS = [
  { id: 1, label: "1. Details" },
  { id: 2, label: "2. Images" },
  { id: 3, label: "3. Links" },
  { id: 4, label: "4. Preview & Publish" },
];

export function ProjectWizard({ projectId }: ProjectWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery" | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [classification, setClassification] = useState<
    "client_work" | "demo" | "design_concept" | "personal"
  >("client_work");
  const [projectType, setProjectType] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [country, setCountry] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [whatIBuiltText, setWhatIBuiltText] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [customLinks, setCustomLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [showInLiveShowcase, setShowInLiveShowcase] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});

    if (projectId) {
      fetch(`/api/admin/projects/${projectId}`)
        .then((r) => r.json())
        .then((d) => {
          const p = d.item;
          if (!p) return;
          setTitle(p.title || "");
          setSlug(p.slug || "");
          setCategoryId(p.categoryId || "");
          setClassification(p.classification || "demo");
          setProjectType(p.projectType || "");
          setShortDescription(p.shortDescription || "");
          setFullDescription(p.fullDescription || "");
          setClientName(p.clientName || "");
          setCountry(p.country || "");
          setCompletedAt(p.completedAt || "");
          setWhatIBuiltText(Array.isArray(p.whatIBuiltJson) ? p.whatIBuiltJson.join("\n") : "");
          setLiveUrl(p.liveUrl || "");
          setDemoUrl(p.demoUrl || "");
          setCustomLinks(Array.isArray(p.customLinksJson) ? p.customLinksJson : []);
          setCoverMediaId(p.coverMediaId || null);
          setCoverUrl(p.coverUrl || null);
          setGallery(
            Array.isArray(p.gallery)
              ? p.gallery.map((g: GalleryItem) => ({
                  mediaId: g.mediaId,
                  url: g.url,
                  deviceType: g.deviceType || "desktop",
                  title: g.title || "",
                  caption: g.caption || "",
                  altText: g.altText || "",
                }))
              : []
          );
          setIsFeatured(Boolean(p.isFeatured));
          setShowOnHomepage(Boolean(p.showOnHomepage));
          setShowInLiveShowcase(Boolean(p.showInLiveShowcase));
          setIsVisible(Boolean(p.isVisible));
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  async function saveProject(status: "draft" | "published") {
    if (!title.trim()) {
      setError("Please enter a project name first.");
      setStep(1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        categoryId: categoryId || null,
        classification,
        projectType: projectType.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        whatIBuiltJson: whatIBuiltText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        clientName: clientName.trim() || null,
        country: country.trim() || null,
        completedAt: completedAt || null,
        liveUrl: liveUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        customLinksJson: customLinks.filter((l) => l.label.trim() && l.url.trim()),
        coverMediaId,
        galleryMediaIds: gallery.map((g) => ({
          mediaId: g.mediaId,
          deviceType: g.deviceType,
          title: g.title,
          caption: g.caption,
          altText: g.altText || title,
        })),
        isFeatured,
        showOnHomepage,
        showInLiveShowcase,
        isVisible,
        status,
      };

      const url = projectId ? `/api/admin/projects/${projectId}` : "/api/admin/projects";
      const method = projectId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save your project.");
        setSaving(false);
        return;
      }
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Could not save your project right now. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {projectId ? `Edit "${title || "Project"}"` : "Add a New Project"}
          </h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`rounded-xl px-3 py-2.5 text-xs font-semibold text-left border transition-colors ${
              step === s.id
                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                : step > s.id
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                  : "bg-white text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5">
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bella Bistro Website"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                What kind of project is this? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "client_work", label: "Real Client Project" },
                  { id: "demo", label: "Demo Website" },
                  { id: "design_concept", label: "Design Concept" },
                  { id: "personal", label: "Personal Project" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setClassification(opt.id as typeof classification)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-medium text-center transition-colors ${
                      classification === opt.id
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Demo websites and concepts are clearly labelled on your public site so visitors always know what is real client work.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Industry / Project Type</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g. Restaurant Website"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client / Business Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Summary</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One or two friendly sentences describing this website..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Story (optional)</label>
              <textarea
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Explain what the business needed and how this website helps them..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Key Features Built (one per line)
              </label>
              <textarea
                rows={3}
                value={whatIBuiltText}
                onChange={(e) => setWhatIBuiltText(e.target.value)}
                placeholder={"Custom online booking flow\nMobile-friendly menu\nGoogle Maps integration"}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold mb-2">Main Cover Image</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-36 w-56 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
                  {coverUrl ? (
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-neutral-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPickerMode("cover")}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                  >
                    {coverUrl ? "Change Cover Image" : "Upload or Choose Cover Image"}
                  </button>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverMediaId(null);
                        setCoverUrl(null);
                      }}
                      className="block text-xs text-red-600 hover:underline"
                    >
                      Remove cover image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">Project Screenshots &amp; Gallery</h2>
                  <p className="text-xs text-neutral-500">
                    Add desktop and mobile screenshots to show on the project page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerMode("gallery")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Screenshot
                </button>
              </div>

              {gallery.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-xs text-neutral-500">
                  No gallery screenshots added yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gallery.map((g, i) => (
                    <div
                      key={`${g.mediaId}-${i}`}
                      className="flex gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3"
                    >
                      <img
                        src={g.url}
                        alt={g.altText}
                        className="h-16 w-24 rounded-lg object-cover bg-neutral-100 shrink-0"
                      />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <input
                          type="text"
                          value={g.title}
                          onChange={(e) =>
                            setGallery((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? { ...item, title: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Screenshot title (e.g. Homepage)"
                          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-2.5 py-1 text-xs"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={g.deviceType}
                            onChange={(e) =>
                              setGallery((prev) =>
                                prev.map((item, idx) =>
                                  idx === i
                                    ? {
                                        ...item,
                                        deviceType: e.target.value as "desktop" | "mobile" | "gallery",
                                      }
                                    : item
                                )
                              )
                            }
                            className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-2 py-1 text-[11px]"
                          >
                            <option value="desktop">Desktop view</option>
                            <option value="mobile">Mobile view</option>
                            <option value="gallery">Gallery photo</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Live Website Link</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Demo Website Link</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://demo.vercel.app"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Completion Date (optional)</label>
                <input
                  type="date"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Page Link (optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Auto-generated from project name"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Extra Custom Links (optional)</label>
                <button
                  type="button"
                  onClick={() => setCustomLinks((prev) => [...prev, { label: "", url: "" }])}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Link
                </button>
              </div>
              {customLinks.map((lnk, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={lnk.label}
                    onChange={(e) =>
                      setCustomLinks((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, label: e.target.value } : item))
                      )
                    }
                    placeholder="Button text (e.g. Booking Page)"
                    className="w-1/3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs"
                  />
                  <input
                    type="url"
                    value={lnk.url}
                    onChange={(e) =>
                      setCustomLinks((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, url: e.target.value } : item))
                      )
                    }
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomLinks((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col sm:flex-row gap-4 bg-neutral-50/70 dark:bg-neutral-950">
              <div className="h-32 w-48 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 flex items-center justify-center">
                {coverUrl ? (
                  <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-neutral-400" />
                )}
              </div>
              <div className="space-y-1.5">
                <span className="inline-block rounded-full bg-neutral-200 dark:bg-neutral-800 px-2.5 py-0.5 text-[11px] font-medium">
                  {classification === "client_work"
                    ? "Real Client Project"
                    : classification === "demo"
                      ? "Demo Website"
                      : classification === "design_concept"
                        ? "Design Concept"
                        : "Personal Project"}
                </span>
                <h3 className="text-lg font-semibold">{title || "Untitled Project"}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {shortDescription || "No short summary added yet."}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Where should this project appear?</h3>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>
                  <strong>Featured Work</strong> — highlight near the top of the homepage
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnHomepage}
                  onChange={(e) => setShowOnHomepage(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>
                  <strong>Show on Homepage</strong>
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInLiveShowcase}
                  onChange={(e) => setShowInLiveShowcase(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>
                  <strong>Interactive Live Preview</strong> — include in the scrollable live website showcase (requires Live or Demo link)
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>
                  <strong>Visible to website visitors</strong>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => saveProject("draft")}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveProject("published")}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Publish to Website
              </button>
            </div>
          )}
        </div>
      </div>

      <MediaPickerModal
        open={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        folder="projects"
        title={pickerMode === "cover" ? "Choose Project Cover Image" : "Add Screenshot"}
        onSelect={(asset) => {
          if (pickerMode === "cover") {
            setCoverMediaId(asset.id);
            setCoverUrl(asset.url);
          } else {
            setGallery((prev) => [
              ...prev,
              {
                mediaId: asset.id,
                url: asset.url,
                deviceType: "desktop",
                title: "",
                caption: "",
                altText: asset.altText || title,
              },
            ]);
          }
        }}
      />
    </div>
  );
}
