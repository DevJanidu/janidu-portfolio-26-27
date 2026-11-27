"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { OtpInput } from "@/components/admin/otp-input";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const initialStep = searchParams.get("step") === "verify" ? "verify" : "credentials";

  const [step, setStep] = useState<"credentials" | "verify">(initialStep);
  const [verifyMethod, setVerifyMethod] = useState<"totp" | "email" | "backup">("totp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
      });

      if (signInError) {
        setError("That email or password didn't match. Please try again.");
        setLoading(false);
        return;
      }

      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        setStep("verify");
        setLoading(false);
        return;
      }

      router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch {
      setError("Could not sign in right now. Please try again in a moment.");
      setLoading(false);
    }
  }

  async function handleSendEmailOtp() {
    setError(null);
    setSendingEmailCode(true);
    try {
      const { error: otpError } = await authClient.twoFactor.sendOtp();
      if (otpError) {
        setError("Could not send the verification code. Please try again.");
      } else {
        setVerifyMethod("email");
        setNotice("We sent a 6-digit code to your email. It expires in 5 minutes.");
      }
    } catch {
      setError("Could not send the verification code. Please try again.");
    } finally {
      setSendingEmailCode(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanCode = code.trim();
      let verifyError: { message?: string } | null = null;

      if (verifyMethod === "totp") {
        const res = await authClient.twoFactor.verifyTotp({
          code: cleanCode,
          trustDevice,
        });
        verifyError = res.error;
      } else if (verifyMethod === "email") {
        const res = await authClient.twoFactor.verifyOtp({
          code: cleanCode,
          trustDevice,
        });
        verifyError = res.error;
      } else {
        const res = await authClient.twoFactor.verifyBackupCode({
          code: cleanCode,
          trustDevice,
        });
        verifyError = res.error;
      }

      if (verifyError) {
        setError("That code didn't work. Please check it and try again.");
        setLoading(false);
        return;
      }

      router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch {
      setError("Could not verify your code right now. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#FAF9F6] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Website
          </Link>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm">
            {step === "verify" ? (
              <ShieldCheck className="h-6 w-6" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {step === "verify" ? "Verify It's You" : "JaniduDev Admin"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600">
            {step === "verify"
              ? "Enter the 6-digit security code to finish signing in."
              : "Sign in to manage your website, projects, reviews, and clients."}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-800 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@janidudev.com"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-800"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-11 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setVerifyMethod("totp")}
                  className={`flex-1 rounded-lg py-2 transition-colors ${
                    verifyMethod === "totp"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Authenticator App
                </button>
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={sendingEmailCode}
                  className={`flex-1 rounded-lg py-2 transition-colors ${
                    verifyMethod === "email"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {sendingEmailCode ? "Sending..." : "Email Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyMethod("backup")}
                  className={`flex-1 rounded-lg py-2 transition-colors ${
                    verifyMethod === "backup"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Recovery Code
                </button>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-neutral-800 mb-2.5 text-center"
                >
                  {verifyMethod === "backup"
                    ? "Enter one of your recovery codes"
                    : "Enter 6-digit code"}
                </label>
                {verifyMethod === "backup" ? (
                  <input
                    id="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="xxxxx-xxxxx"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-center text-lg font-mono tracking-[0.2em] text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                ) : (
                  <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
                )}
              </div>

              <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                Remember this device for 30 days
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Checking code..." : "Verify & Open Dashboard"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setCode("");
                  setError(null);
                }}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
              >
                Use a different email or password
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Private website management area for JaniduDev.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#FAF9F6] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
