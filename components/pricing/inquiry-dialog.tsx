"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CheckCircle2, Mail, MessageSquare, Send, X } from "lucide-react";
import { profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-input bg-white px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

const InquiryDialogContext = createContext<
  ((packageName: string) => void) | null
>(null);

function useInquiryDialog() {
  const openDialog = useContext(InquiryDialogContext);
  if (!openDialog) {
    throw new Error(
      "useInquiryDialog must be used inside an InquiryDialogProvider"
    );
  }
  return openDialog;
}

export function InquiryDialogProvider({ children }: { children: ReactNode }) {
  const [packageName, setPackageName] = useState<string | null>(null);

  return (
    <InquiryDialogContext.Provider value={setPackageName}>
      {children}
      {packageName ? (
        <InquiryModal
          packageName={packageName}
          onClose={() => setPackageName(null)}
        />
      ) : null}
    </InquiryDialogContext.Provider>
  );
}

export function InquiryTrigger({
  packageName,
  cta,
  featured,
  className,
}: {
  packageName: string;
  cta: string;
  featured?: boolean;
  className?: string;
}) {
  const openDialog = useInquiryDialog();

  return (
    <Button
      type="button"
      size="lg"
      variant={featured ? "default" : "outline"}
      onClick={() => openDialog(packageName)}
      className={cn("w-full sm:w-auto", className)}
    >
      {cta}
    </Button>
  );
}

function InquiryModal({
  packageName,
  onClose,
}: {
  packageName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState(
    `Hi Janidu, I'm interested in the ${packageName} scope for my business.`
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError("Please include a short note about what you want built.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          businessName: businessName.trim() || undefined,
          packageName,
          message: message.trim(),
          company: formData.get("company"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to send inquiry.");
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Something went wrong. Please email ${profile.email} directly.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Inquire about ${packageName}`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40"
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-elevated sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        {sent ? (
          <div role="status" className="py-8 text-center">
            <CheckCircle2
              className="mx-auto size-10 text-emerald-600"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-xl font-semibold text-foreground">
              Inquiry received
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Thanks for reaching out about {packageName}. I will get back to{" "}
              {email} within one business day.
            </p>
            <Button className="mt-6" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <p className="section-label">Selected scope</p>
            <h2 className="mt-1.5 text-2xl font-semibold text-foreground">
              Inquire about {packageName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Mail className="size-4 text-primary" aria-hidden="true" />
                {profile.email}
              </a>
              <a
                href={profile.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <MessageSquare
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                {profile.whatsapp}
              </a>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="modal-name"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Name
                  </label>
                  <input
                    id="modal-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="modal-email"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Email
                  </label>
                  <input
                    id="modal-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-business"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Business name
                </label>
                <input
                  id="modal-business"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your salon, spa, or firm"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="modal-message"
                  className="mb-1.5 block text-sm font-medium"
                >
                  What do you want built?
                </label>
                <textarea
                  id="modal-message"
                  name="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass + " resize-y"}
                />
              </div>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send inquiry"}
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
