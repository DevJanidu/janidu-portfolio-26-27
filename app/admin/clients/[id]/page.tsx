"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Loader2,
  CheckSquare,
  Square,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface ClientProject {
  id: string;
  title: string;
  stage: string;
  agreedAmount: string | null;
  currency: string;
  depositPaid: boolean;
  finalPaid: boolean;
  targetLaunchDate: string | null;
  privatePreviewUrl: string | null;
  liveSiteUrl: string | null;
  portfolioProjectId: string | null;
  privateNotes: string;
  milestones: Milestone[];
}

interface ClientDetail {
  id: string;
  name: string;
  businessName: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  status: string;
  privateNotes: string;
  projects: ClientProject[];
}

const STAGES = [
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "deposit_received", label: "50% Deposit Paid" },
  { value: "in_development", label: "In Development" },
  { value: "preview_ready", label: "Private Preview Ready" },
  { value: "revisions", label: "Revisions" },
  { value: "final_payment", label: "Final 50% Paid" },
  { value: "launched", label: "Launched" },
  { value: "maintenance", label: "Maintenance" },
];

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjAmount, setNewProjAmount] = useState("");
  const [addingProj, setAddingProj] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`);
      const data = await res.json();
      setClient(data.item || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    setAddingProj(true);
    try {
      const res = await fetch("/api/admin/client-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          title: newProjTitle.trim(),
          agreedAmount: newProjAmount.trim() || null,
        }),
      });
      if (res.ok) {
        setNewProjTitle("");
        setNewProjAmount("");
        setNotice("Added new client project with default milestones.");
        await load();
      }
    } finally {
      setAddingProj(false);
    }
  }

  async function updateProject(projectId: string, patch: Record<string, unknown>) {
    await fetch(`/api/admin/client-projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function copyToPortfolio(projectId: string) {
    const res = await fetch(`/api/admin/client-projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy_to_portfolio" }),
    });
    const data = await res.json();
    if (res.ok && data.portfolioProjectId) {
      router.push(`/admin/projects/${data.portfolioProjectId}`);
    }
  }

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!client) {
    return <div className="p-8 text-center text-sm">Client not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Clients
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {client.businessName ? `${client.businessName} · ` : ""}
              {client.country}
              {client.email ? ` · ${client.email}` : ""}
              {client.phone ? ` · ${client.phone}` : ""}
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {/* Add New Project Bar */}
      <form
        onSubmit={addProject}
        className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={newProjTitle}
          onChange={(e) => setNewProjTitle(e.target.value)}
          placeholder="New project title (e.g. Salon Website & Booking)"
          className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
        />
        <input
          type="text"
          value={newProjAmount}
          onChange={(e) => setNewProjAmount(e.target.value)}
          placeholder="Agreed quote (USD, optional)"
          className="sm:w-52 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={addingProj}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </form>

      {/* Client Projects */}
      <div className="space-y-5">
        {client.projects.map((proj) => (
          <div
            key={proj.id}
            className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold">{proj.title}</h2>
                {proj.agreedAmount && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Agreed quote: {proj.currency} {proj.agreedAmount}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={proj.stage}
                  onChange={(e) => updateProject(proj.id, { stage: e.target.value })}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-semibold"
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {proj.portfolioProjectId ? (
                  <Link
                    href={`/admin/projects/${proj.portfolioProjectId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    In Portfolio
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => copyToPortfolio(proj.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Copy to Portfolio Showcase
                  </button>
                )}
              </div>
            </div>

            {/* Payment Checkboxes & URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proj.depositPaid}
                    onChange={(e) =>
                      updateProject(proj.id, { depositPaid: e.target.checked })
                    }
                    className="h-4 w-4 rounded"
                  />
                  50% Deposit Paid
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proj.finalPaid}
                    onChange={(e) =>
                      updateProject(proj.id, { finalPaid: e.target.checked })
                    }
                    className="h-4 w-4 rounded"
                  />
                  Final 50% Paid
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="url"
                  defaultValue={proj.privatePreviewUrl || ""}
                  onBlur={(e) =>
                    updateProject(proj.id, { privatePreviewUrl: e.target.value })
                  }
                  placeholder="Private preview URL"
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-1.5 text-xs"
                />
                <input
                  type="url"
                  defaultValue={proj.liveSiteUrl || ""}
                  onBlur={(e) =>
                    updateProject(proj.id, { liveSiteUrl: e.target.value })
                  }
                  placeholder="Live website URL"
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Milestones Checklist */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Delivery Checklist
              </h3>
              <ul className="space-y-1.5">
                {proj.milestones.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() =>
                        updateProject(proj.id, {
                          action: "toggle_milestone",
                          milestoneId: m.id,
                          isCompleted: !m.isCompleted,
                        })
                      }
                      className="flex items-center gap-2.5 text-sm text-left hover:opacity-80"
                    >
                      {m.isCompleted ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-400 shrink-0" />
                      )}
                      <span className={m.isCompleted ? "line-through text-neutral-400" : ""}>
                        {m.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
