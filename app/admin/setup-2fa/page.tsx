"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ShieldCheck, Copy, Check, ArrowLeft, Loader2, QrCode, KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { OtpInput } from "@/components/admin/otp-input";

export default function Setup2FAPage() {
  const [step, setStep] = useState<"password" | "verify" | "done">("password");
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showManualKey, setShowManualKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract manual secret from otpauth://totp/... ?secret=XXXX
  const manualSecret = (() => {
    try {
      if (!totpURI) return "";
      const u = new URL(totpURI);
      return u.searchParams.get("secret") || "";
    } catch {
      return "";
    }
  })();

  // Generate QR code locally in the browser so the secret never leaves your device
  useEffect(() => {
    if (!totpURI) {
      setQrDataUrl("");
      return;
    }
    let active = true;
    QRCode.toDataURL(totpURI, {
      width: 220,
      margin: 2,
      color: {
        dark: "#111111",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [totpURI]);

  async function handleStartSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: enableError } = await authClient.twoFactor.enable({
        password,
      });
      if (enableError || !data) {
        setError("That password didn't match. Please try again.");
        setLoading(false);
        return;
      }
      if ("totpURI" in data) {
        setTotpURI(data.totpURI);
        setBackupCodes(data.backupCodes || []);
      }
      setStep("verify");
    } catch {
      setError("Could not start setup right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length !== 6) {
      setError("Please enter all 6 digits from your authenticator app.");
      return;
    }
    setLoading(true);
    try {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: code.trim(),
      });
      if (verifyError) {
        setError("That 6-digit code didn't match. Please check your authenticator app.");
        setLoading(false);
        return;
      }
      setStep("done");
    } catch {
      setError("Could not verify your code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyRecoveryCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyManualSecret() {
    if (!manualSecret) return;
    navigator.clipboard.writeText(manualSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Two-Step Verification</h1>
            <p className="text-xs text-neutral-500">
              Scan a QR code with Google Authenticator, Apple Passwords, Authy, or 1Password.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {step === "password" && (
          <form onSubmit={handleStartSetup} className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              First, confirm your current admin password to generate your QR code.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5">Current password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue to QR Code
            </button>
          </form>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            {/* Step 1: Scannable QR Code + optional manual key */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-950 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  1. Scan this QR code with your authenticator app
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                {qrDataUrl ? (
                  <div className="rounded-2xl bg-white p-3.5 border border-neutral-200 shadow-xs">
                    <img
                      src={qrDataUrl}
                      alt="Two-Step Verification QR Code"
                      width={220}
                      height={220}
                      className="h-[220px] w-[220px]"
                    />
                  </div>
                ) : (
                  <div className="h-[220px] w-[220px] rounded-2xl bg-white border border-neutral-200 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowManualKey((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline underline-offset-2"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {showManualKey ? "Hide manual setup key" : "Can't scan? Enter setup key manually"}
                </button>
              </div>

              {showManualKey && (
                <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3">
                  <code className="flex-1 font-mono text-xs break-all select-all text-center">
                    {manualSecret || totpURI}
                  </code>
                  <button
                    type="button"
                    onClick={copyManualSecret}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {copiedSecret ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedSecret ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Recovery Codes */}
            {backupCodes.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                    2. Save your recovery codes in a safe place
                  </p>
                  <button
                    type="button"
                    onClick={copyRecoveryCodes}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy codes"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-amber-950 dark:text-amber-100">
                  {backupCodes.map((bc) => (
                    <div key={bc} className="rounded bg-white/80 dark:bg-neutral-900 px-2.5 py-1.5 text-center">
                      {bc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Verify 6-digit code */}
            <form onSubmit={handleConfirmCode} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-3 text-center">
                  3. Enter the 6-digit code shown in your app
                </label>
                <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Turn On Two-Step Verification
              </button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Two-Step Verification is now turned on. Next time you sign in on a new device, we will ask for your 6-digit code.
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            >
              Back to Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
