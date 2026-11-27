"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { OtpInput } from "@/components/admin/otp-input";

type Step = "request" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "forget-password",
      });
      if (sendError) {
        setError("Could not send the code right now. Please check your email address and try again.");
        setLoading(false);
        return;
      }
      setOtp("");
      setStep("otp");
      setNotice(`We sent a 6-digit verification code to ${email.trim()}.`);
    } catch {
      setError("Could not send the code right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "forget-password",
      });
      if (sendError) {
        setError("Could not resend the code. Please wait a moment and try again.");
      } else {
        setOtp("");
        setNotice("A fresh 6-digit code has been sent to your email.");
      }
    } catch {
      setError("Could not resend the code right now.");
    } finally {
      setResending(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (otp.length !== 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }
    setLoading(true);
    try {
      const { error: checkError } = await authClient.emailOtp.checkVerificationOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        type: "forget-password",
      });
      if (checkError) {
        setError("That 6-digit code is incorrect or has expired. Please try again.");
        setLoading(false);
        return;
      }
      // Code verified! Now advance to the separate password creation section.
      setStep("password");
    } catch {
      setError("Could not verify that code right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 10) {
      setError("Please choose a password that is at least 10 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Those two passwords don't match. Please type them again.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await authClient.emailOtp.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password: newPassword,
      });
      if (resetError) {
        setError("Your verification code expired. Please request a fresh code.");
        setLoading(false);
        return;
      }
      setStep("done");
    } catch {
      setError("Could not save your new password right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stepIndex =
    step === "request" ? 1 : step === "otp" ? 2 : step === "password" ? 3 : 4;

  return (
    <div className="min-h-dvh bg-[#FAF9F6] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm">
            {step === "done" ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            ) : step === "otp" ? (
              <ShieldCheck className="h-6 w-6" />
            ) : step === "password" ? (
              <Lock className="h-5 w-5" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {step === "request" && "Reset Your Password"}
            {step === "otp" && "Enter Verification Code"}
            {step === "password" && "Create a New Password"}
            {step === "done" && "Password Updated"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600">
            {step === "request" &&
              "Enter your admin email address and we'll send you a 6-digit code."}
            {step === "otp" &&
              "Type the 6-digit code sent to your inbox to verify your identity."}
            {step === "password" &&
              "Your code is verified. Now choose a strong new password for your account."}
            {step === "done" &&
              "Your password has been changed. You can now sign in with it."}
          </p>
        </div>

        {/* Step Indicator */}
        {step !== "done" && (
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-medium">
            {[
              { n: 1, label: "Email" },
              { n: 2, label: "Verify Code" },
              { n: 3, label: "New Password" },
            ].map((item, i) => (
              <div key={item.n} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                    stepIndex === item.n
                      ? "bg-neutral-900 text-white"
                      : stepIndex > item.n
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-200/70 text-neutral-500"
                  }`}
                >
                  <span>{item.n}.</span>
                  <span>{item.label}</span>
                </span>
                {i < 2 && <span className="text-neutral-300">→</span>}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {notice && !error && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === "request" && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-neutral-800 mb-1.5"
                >
                  Admin email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@janidudev.com"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending code..." : "Send 6-Digit Code"}
              </button>
            </form>
          )}

          {/* STEP 2: Verify 6-Block OTP ONLY */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-center text-sm font-medium text-neutral-800">
                  6-Digit Verification Code
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-center text-xs text-neutral-500">
                  Sent to <strong className="text-neutral-700">{email}</strong> · Expires in 5 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Verifying code..." : "Verify Code & Continue"}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setError(null);
                    setNotice(null);
                  }}
                  className="text-neutral-500 hover:text-neutral-900"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="font-medium text-neutral-800 hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Create New Password ONLY (after OTP verified) */}
          {step === "password" && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                  New password (at least 10 characters)
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={10}
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong new password"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-11 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={10}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Type your new password again"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-11 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Saving new password..." : "Save New Password"}
              </button>
            </form>
          )}

          {/* STEP 4: Done */}
          {step === "done" && (
            <Link
              href="/login"
              className="block w-full text-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Sign In Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
