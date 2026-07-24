"use client";

import {
  createContext,
  useContext,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Linkedin, Mail, Send, CheckCircle2, X } from "lucide-react";
import { profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-input bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ring";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.499-.669-.508-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.04 22h-.004a9.867 9.867 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.04 0 5.436 0 .057 5.373.054 11.977c0 2.108.55 4.166 1.596 5.983L0 24l6.204-1.628a11.95 11.95 0 0 0 5.83 1.487h.005c6.604 0 11.99-5.373 11.993-11.977a11.9 11.9 0 0 0-3.5-8.494" />
    </svg>
  );
}

const InquiryDialogContext = createContext<((packageName: string) => void) | null>(null);

function useInquiryDialog() {
  const openDialog = useContext(InquiryDialogContext);
  if (!openDialog) {
    throw new Error("useInquiryDialog must be used inside an InquiryDialogProvider");
  }
  return openDialog;
}

export function InquiryDialogProvider({ children }: { children: ReactNode }) {
  const [packageName, setPackageName] = useState<string | null>(null);

  return (
    <InquiryDialogContext.Provider value={setPackageName}>
      {children}
      {packageName ? (
        <InquiryModal packageName={packageName} onClose={() => setPackageName(null)} />
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
      onClick={() => openDialog(packageName)}
      className={cn(
        "w-full",
        featured && "bg-white text-navy hover:bg-ice active:bg-ice",
        className
      )}
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
  const [subject, setSubject] = useState(`${packageName} — quick inquiry`);
  const [message, setMessage] = useState(
    `Hi Janidu,\n\nI'm interested in the ${packageName} package. Could you get in touch with more details?\n\n`
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappDigits = profile.whatsapp.replace(/[^\d]/g, "");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: `${packageName} inquiry`,
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message.");
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please email me directly!"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Get in touch about ${packageName}`}
      className="fixed inset-0 z-[100] sm:flex sm:items-center sm:justify-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
      />

      <div className="relative flex h-full w-full flex-col overflow-y-auto bg-card sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-lg sm:border sm:border-border sm:shadow-elevated">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-ocean"
        >
          <X className="size-5" />
        </button>

        <div className="p-6 pt-16 sm:p-8 sm:pt-8">
          {sent ? (
            <div
              role="status"
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <CheckCircle2 className="size-10 text-emerald-500" />
              <h3 className="mt-4 font-display text-lg font-semibold text-navy">
                Message sent successfully!
              </h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Thanks for reaching out about {packageName}. I&apos;ll get back to you as soon as possible.
              </p>
              <Button className="mt-6" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-navy">
                Get in touch about {packageName}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Reach out on social media, or send a quick email and I&apos;ll reply directly.
              </p>

              <ul className="mt-5 flex items-center gap-2" aria-label="Social links">
                {[
                  { href: profile.socials.linkedin, label: "LinkedIn", Icon: Linkedin },
                  { href: `mailto:${profile.email}`, label: "Email", Icon: Mail },
                  {
                    href: `https://wa.me/${whatsappDigits}`,
                    label: "WhatsApp",
                    Icon: WhatsAppIcon,
                  },
                ].map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-ocean/50 hover:text-ocean"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground/70">
                WhatsApp: {profile.whatsapp}
              </p>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
                  Or send a quick email
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <div>
                  <label htmlFor="inquiry-email" className="mb-1.5 block text-sm font-medium">
                    Your email
                  </label>
                  <input
                    id="inquiry-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="your email"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-subject" className="mb-1.5 block text-sm font-medium">
                    Subject
                  </label>
                  <input
                    id="inquiry-subject"
                    name="subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-message" className="mb-1.5 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="inquiry-message"
                    name="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={inputClass + " resize-y"}
                  />
                </div>
                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send message"} <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
