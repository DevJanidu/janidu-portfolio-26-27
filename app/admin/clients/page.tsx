"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, ArrowRight, Loader2, X } from "lucide-react";
import { getAdminCache, setAdminCache } from "@/lib/admin/client-cache";

interface ClientProjectSummary {
  id: string;
  title: string;
  stage: string;
  depositPaid: boolean;
  finalPaid: boolean;
}

interface ClientItem {
  id: string;
  name: string;
  businessName: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  status: string;
  projects: ClientProjectSummary[];
}

const STAGE_LABELS: Record<string, string> = {
  proposal_sent: "Proposal Sent",
  deposit_received: "50% Deposit Paid",
  in_development: "In Development",
  preview_ready: "Private Preview Ready",
  revisions: "Revisions",
  final_payment: "Final 50% Paid",
  launched: "Launched",
  maintenance: "Maintenance",
};

export default function ClientsPage() {
  const [items, setItems] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States");

  async function load() {
    const cached = getAdminCache<ClientItem[]>("clients");
    if (cached) {
      setItems(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      const fresh: ClientItem[] = data.items || [];
      setItems(fresh);
      setAdminCache("clients", fresh);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessName, email, phone, country }),
      });
      if (res.ok) {
        setModalOpen(false);
        setName("");
        setBusinessName("");
        setEmail("");
        setPhone("");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients &amp; Active Projects</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Track your private freelance clients, project stages, 50% deposit &amp; final payments, preview links, and launch milestones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <Users className="h-9 w-9 mx-auto text-neutral-400 mb-3" />
          <p className="text-sm font-medium">No clients added yet</p>
          <p className="text-xs text-neutral-500 mt-1">
            Add a client directly or convert an incoming enquiry from Customer Enquiries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="group rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-400 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold group-hover:underline">
                    {client.name}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {client.businessName ? `${client.businessName} · ` : ""}
                    {client.country}
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[11px] font-medium capitalize">
                  {client.status}
                </span>
              </div>

              {client.projects.length > 0 ? (
                <div className="space-y-2">
                  {client.projects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs"
                    >
                      <span className="font-medium truncate">{p.title}</span>
                      <span className="text-neutral-500 shrink-0 ml-2">
                        {STAGE_LABELS[p.stage] || p.stage}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No active projects yet</p>
              )}

              <div className="flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span>{client.email || client.phone || "No contact info"}</span>
                <span className="inline-flex items-center gap-1 text-neutral-900 dark:text-white">
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Add a New Client</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Glow Studio Salon"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </div>
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
              <div className="flex justify-end gap-2 pt-3">
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
                  {saving ? "Adding..." : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
