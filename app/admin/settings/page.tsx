"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Save, LogOut, Loader2, Laptop } from "lucide-react";

interface SettingsData {
  siteName: string;
  siteTagline: string;
  publicEmail: string;
  publicWhatsapp: string;
  locationText: string;
  linkedinUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  notifyNewEnquiry: boolean;
  notifyNewReview: boolean;
  notifySecurityAlerts: boolean;
}

interface DeviceSession {
  id: string;
  createdAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    twoFactorEnabled: boolean;
  } | null>(null);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings);
      setUserInfo(data.user);
      setDevices(data.devices || []);
      setCurrentSessionId(data.currentSessionId || "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setNotice("Your website settings have been saved.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function signOutOthers() {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sign_out_other_devices" }),
    });
    if (res.ok) {
      setNotice("Signed out all other devices.");
      await load();
    }
  }

  if (loading || !settings) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Manage your public contact info, search appearance, email notifications, and account security.
        </p>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {/* Website & Contact Settings */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5"
      >
        <h2 className="text-base font-semibold border-b border-neutral-100 dark:border-neutral-800 pb-3">
          Website &amp; Business Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Website Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Location</label>
            <input
              type="text"
              value={settings.locationText}
              onChange={(e) => setSettings({ ...settings, locationText: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Public Contact Email</label>
            <input
              type="email"
              value={settings.publicEmail}
              onChange={(e) => setSettings({ ...settings, publicEmail: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={settings.publicWhatsapp}
              onChange={(e) => setSettings({ ...settings, publicWhatsapp: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">LinkedIn Profile Link</label>
          <input
            type="url"
            value={settings.linkedinUrl}
            onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm"
          />
        </div>

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold">Email Notifications</h3>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyNewEnquiry}
              onChange={(e) =>
                setSettings({ ...settings, notifyNewEnquiry: e.target.checked })
              }
              className="h-4 w-4 rounded"
            />
            Email me when a new customer enquiry arrives
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyNewReview}
              onChange={(e) =>
                setSettings({ ...settings, notifyNewReview: e.target.checked })
              }
              className="h-4 w-4 rounded"
            />
            Email me when a new customer review is waiting for approval
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </form>

      {/* Account Security & Signed-in Devices */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold">Account Security</h2>
          </div>
          {userInfo && (
            <span className="text-xs text-neutral-500">{userInfo.email}</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 p-4">
          <div>
            <p className="text-sm font-semibold">Two-Step Verification</p>
            <p className="text-xs text-neutral-500">
              {userInfo?.twoFactorEnabled
                ? "Protected — your account requires a 6-digit code on new devices."
                : "Not turned on yet. Add an authenticator app for extra safety."}
            </p>
          </div>
          <Link
            href="/admin/setup-2fa"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            {userInfo?.twoFactorEnabled ? "Manage 2FA" : "Turn On"}
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Signed-In Devices ({devices.length})</h3>
            {devices.length > 1 && (
              <button
                type="button"
                onClick={signOutOthers}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out other devices
              </button>
            )}
          </div>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {devices.map((d) => (
              <li key={d.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Laptop className="h-4 w-4 text-neutral-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {d.id === currentSessionId ? "This device (Current)" : "Signed-in browser"}
                    </p>
                    <p className="text-neutral-500 truncate">
                      Signed in {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
