"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, X } from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  featuresJson: string[];
  startingPrice: string | null;
  currency: string;
  deliveryEstimate: string | null;
  ctaLabel: string;
  isVisible: boolean;
}

export default function ServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [showSection, setShowSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      setItems(data.items || []);
      setShowSection(Boolean(data.showServicesSection));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublicSection(next: boolean) {
    setShowSection(next);
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleShowServicesSection: next }),
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          featuresJson: featuresText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          startingPrice: startingPrice.trim() || null,
          currency,
          deliveryEstimate: deliveryEstimate.trim() || null,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setName("");
        setDescription("");
        setFeaturesText("");
        setStartingPrice("");
        setDeliveryEstimate("");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/admin/services?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Optional service cards for your homepage. Leave starting price blank if you prefer custom quotes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Master Show/Hide Toggle */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Show Services section on public website</p>
          <p className="text-xs text-neutral-500">
            Turn this off to keep your portfolio clean without service cards or pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => togglePublicSection(!showSection)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            showSection
              ? "bg-emerald-600 text-white"
              : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {showSection ? "Showing on Site" : "Hidden"}
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <p className="text-sm font-medium">No services added yet</p>
          <p className="text-xs text-neutral-500 mt-1">
            Add your services here anytime and turn on the switch above when you want them visible.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((svc) => (
            <div
              key={svc.id}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-base">{svc.name}</h2>
                  <button
                    type="button"
                    onClick={() => deleteService(svc.id)}
                    className="text-red-500 hover:bg-red-50 rounded-lg p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {svc.startingPrice && (
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                    From {svc.currency} {svc.startingPrice}
                  </p>
                )}
                {svc.deliveryEstimate && (
                  <p className="text-xs text-neutral-500">{svc.deliveryEstimate}</p>
                )}
                {svc.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                    {svc.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Add a Service</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Custom Salon Website & Booking"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (optional)</label>
                  <input
                    type="text"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="Blank = custom"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                    <option value="LKR">LKR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Delivery time</label>
                  <input
                    type="text"
                    value={deliveryEstimate}
                    onChange={(e) => setDeliveryEstimate(e.target.value)}
                    placeholder="7-14 days"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Included Features (one per line)</label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder={"Mobile-friendly design\nOnline booking setup\nGoogle Maps & SEO"}
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
                  {saving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
