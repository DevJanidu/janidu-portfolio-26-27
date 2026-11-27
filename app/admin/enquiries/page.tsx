"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MessageCircle,
  UserPlus,
  Trash2,
  Loader2,
  Inbox,
  Check,
  ExternalLink,
} from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/admin/client-cache";

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  country: string;
  selectedDesign: string | null;
  message: string;
  status: string;
  isRead: boolean;
  privateNotes: string;
  convertedClientId: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "discussing", label: "Discussing" },
  { value: "confirmed", label: "Confirmed Client" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

export default function EnquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [converting, setConverting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    const cached = getAdminCache<EnquiryItem[]>("enquiries");
    if (cached) {
      setItems(cached);
      setLoading(false);
      if (cached.length > 0 && !selectedId) {
        setSelectedId(cached[0].id);
        setNotesDraft(cached[0].privateNotes || "");
      }
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      const list: EnquiryItem[] = data.items || [];
      setItems(list);
      setAdminCache("enquiries", list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
        setNotesDraft(list[0].privateNotes || "");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selected = items.find((i) => i.id === selectedId) || null;

  async function selectEnquiry(item: EnquiryItem) {
    setSelectedId(item.id);
    setNotesDraft(item.privateNotes || "");
    if (!item.isRead) {
      await fetch(`/api/admin/enquiries/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, isRead: true } : x))
      );
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privateNotes: notesDraft }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((x) =>
            x.id === selected.id ? { ...x, privateNotes: notesDraft } : x
          )
        );
        setNotice("Saved private notes.");
      }
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleConvertToClient() {
    if (!selected) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert_to_client" }),
      });
      const data = await res.json();
      if (res.ok && data.clientId) {
        router.push(`/admin/clients/${data.clientId}`);
      }
    } finally {
      setConverting(false);
    }
  }

  async function deleteEnquiry(id: string) {
    if (!confirm("Remove this enquiry from your inbox?")) return;
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      const next = items.filter((x) => x.id !== id);
      setItems(next);
      setSelectedId(next[0]?.id ?? null);
    }
  }

  const filtered = items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "unread") return !i.isRead;
    return i.status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customer Enquiries</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Every message sent through your website contact form appears here. Convert qualified leads into active clients in one click.
        </p>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread" },
          { id: "new", label: "New" },
          { id: "discussing", label: "Discussing" },
          { id: "confirmed", label: "Confirmed" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${
              filter === t.id
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <Inbox className="h-9 w-9 mx-auto text-neutral-400 mb-3" />
          <p className="text-sm font-medium">No enquiries in this view</p>
          <p className="text-xs text-neutral-500 mt-1">
            When potential clients submit your website contact form, their messages will appear right here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inbox List */}
          <div className="lg:col-span-1 space-y-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectEnquiry(item)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  selectedId === item.id
                    ? "border-neutral-900 bg-white shadow-xs dark:border-white dark:bg-neutral-900"
                    : "border-neutral-200/80 bg-white/70 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate flex items-center gap-2">
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                    {item.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {item.businessName && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
                    {item.businessName} · {item.country}
                  </p>
                )}
                <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5">
                  {item.message}
                </p>
              </button>
            ))}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-6 h-fit">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selected.businessName ? `${selected.businessName} · ` : ""}
                    {selected.country} · {selected.email}
                  </p>
                  {selected.selectedDesign && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Interested in: <strong>{selected.selectedDesign}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-medium"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteEnquiry(selected.id)}
                    className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/60"
                    title="Delete enquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-950 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(
                    `Re: Your website enquiry — JaniduDev`
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Reply by Email
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hi ${selected.name}, thanks for reaching out via JaniduDev!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Open WhatsApp
                </a>
                {selected.convertedClientId ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/clients/${selected.convertedClientId}`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Client Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConvertToClient}
                    disabled={converting}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    {converting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                    Convert to Client
                  </button>
                )}
              </div>

              {/* Private Notes */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Private Notes (only visible to you)
                </label>
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Write call notes, quote details, or follow-up reminders..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Check className="h-3.5 w-3.5" />
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
