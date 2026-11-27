"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Search,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Check,
  Film,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/admin/client-cache";

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  folder: string;
  createdAt: string;
}

const FOLDERS = ["all", "projects", "salon-concepts", "categories", "general"];

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folderFilter, setFolderFilter] = useState("all");
  const [uploadFolder, setUploadFolder] = useState("projects");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadMedia() {
    const cached = getAdminCache<MediaItem[]>("media");
    if (cached) {
      setItems(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      const fresh: MediaItem[] = data.items || [];
      setItems(fresh);
      setAdminCache("media", fresh);
    } catch {
      setMessage({ type: "err", text: "Could not load your media library." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setMessage(null);
    let uploadedCount = 0;
    let lastError: string | null = null;

    for (const file of Array.from(fileList)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", uploadFolder);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.item) {
          setItems((prev) => [data.item, ...prev]);
          uploadedCount++;
        } else {
          lastError = data.error || "Could not upload one of the files.";
        }
      } catch {
        lastError = "Upload failed. Please try again.";
      }
    }

    setUploading(false);
    if (lastError) {
      setMessage({ type: "err", text: lastError });
    } else if (uploadedCount > 0) {
      setMessage({
        type: "ok",
        text: `Uploaded ${uploadedCount} ${uploadedCount === 1 ? "file" : "files"} successfully.`,
      });
    }
  }

  async function handleSaveAlt() {
    if (!selected) return;
    setSavingAlt(true);
    try {
      const res = await fetch(`/api/admin/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: altDraft }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setItems((prev) => prev.map((it) => (it.id === selected.id ? data.item : it)));
        setSelected(data.item);
        setMessage({ type: "ok", text: "Saved image description." });
      }
    } finally {
      setSavingAlt(false);
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.fileName}"? This cannot be undone.`)) return;
    setMessage(null);
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "err", text: data.error || "Could not delete this file." });
    } else {
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      setMessage({ type: "ok", text: `Deleted "${item.fileName}".` });
    }
  }

  const filtered = items.filter((item) => {
    if (folderFilter !== "all" && item.folder !== folderFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.fileName.toLowerCase().includes(q) ||
      item.altText.toLowerCase().includes(q)
    );
  });

  function formatSize(bytes: number) {
    if (!bytes) return "Local asset";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Upload and manage all images and videos used across your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            aria-label="Upload folder"
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="projects">Folder: Projects</option>
            <option value="categories">Folder: Categories</option>
            <option value="general">Folder: General</option>
          </select>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FOLDERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFolderFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                folderFilter === f
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selected ? "lg:col-span-2" : "lg:col-span-3"}>
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
              <ImageIcon className="h-9 w-9 mx-auto text-neutral-400 mb-3" />
              <p className="text-sm font-medium">No files in this folder yet</p>
              <p className="text-xs text-neutral-500 mt-1">
                Upload JPG, PNG, WebP, AVIF images (up to 10 MB) or MP4/WebM videos (up to 50 MB).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isVideo = item.mimeType.startsWith("video/");
                const isSel = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setAltDraft(item.altText || "");
                    }}
                    className={`group rounded-2xl border overflow-hidden text-left transition-all bg-white dark:bg-neutral-900 ${
                      isSel
                        ? "border-neutral-900 ring-2 ring-neutral-900/15 dark:border-white"
                        : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center overflow-hidden">
                      {isVideo ? (
                        <Film className="h-8 w-8 text-neutral-400" />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.altText || item.fileName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{item.fileName}</p>
                      <p className="text-[11px] text-neutral-500">{formatSize(item.sizeBytes)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 h-fit space-y-4">
            <h2 className="text-sm font-semibold">File Details</h2>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950">
              {selected.mimeType.startsWith("video/") ? (
                <video src={selected.url} controls className="h-full w-full object-contain" />
              ) : (
                <img
                  src={selected.url}
                  alt={selected.altText || selected.fileName}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
              <p className="font-medium text-neutral-900 dark:text-white break-all">
                {selected.fileName}
              </p>
              <p>Size: {formatSize(selected.sizeBytes)}</p>
              <p className="capitalize">Folder: {selected.folder}</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Image description (helps Google &amp; screen readers)
              </label>
              <input
                type="text"
                value={altDraft}
                onChange={(e) => setAltDraft(e.target.value)}
                placeholder="Describe what's in this image..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAlt}
                disabled={savingAlt}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                <Check className="h-3.5 w-3.5" />
                {savingAlt ? "Saving..." : "Save Description"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selected)}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
