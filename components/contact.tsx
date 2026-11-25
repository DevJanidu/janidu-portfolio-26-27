"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Mail, MessageSquare, Send, X } from "lucide-react";
import { profile } from "@/lib/data";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { CountryPicker } from "@/components/country-picker";
import {
  getSalonConceptBySlug,
  type SalonConcept,
} from "@/lib/salon-concepts";
import { DESIGN_SELECT_EVENT } from "@/components/enquire-design-button";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-input bg-white px-3.5 py-3 text-[16px] text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

export function Contact() {
  const [selectedConcept, setSelectedConcept] = useState<SalonConcept | null>(
    null
  );
  const [customDesignSlug, setCustomDesignSlug] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const [message, setMessage] = useState("");

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("design");
      if (!slug) {
        setSelectedConcept(null);
        setCustomDesignSlug("");
        return;
      }
      const concept = getSalonConceptBySlug(slug);
      if (concept) {
        setSelectedConcept(concept);
        setCustomDesignSlug("");
      } else {
        setSelectedConcept(null);
        setCustomDesignSlug(slug);
      }
    }

    function onDesignSelect(e: Event) {
      const detail = (e as CustomEvent<{ slug?: string }>).detail;
      const slug = detail?.slug;
      if (!slug) return;
      const concept = getSalonConceptBySlug(slug);
      setSent(false);
      setError(null);
      if (concept) {
        setSelectedConcept(concept);
        setCustomDesignSlug("");
      } else {
        setSelectedConcept(null);
        setCustomDesignSlug(slug);
      }
    }

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener(DESIGN_SELECT_EVENT, onDesignSelect);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(DESIGN_SELECT_EVENT, onDesignSelect);
    };
  }, []);

  function clearSelectedDesign() {
    setSelectedConcept(null);
    setCustomDesignSlug("");
    const url = new URL(window.location.href);
    url.searchParams.delete("design");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  const activeDesignIdentifier =
    selectedConcept?.slug || customDesignSlug || "";
  const activeDesignTitle = selectedConcept?.title || customDesignSlug;

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
    if (!businessName.trim()) {
      setError("Please enter your business name (or 'New business' if unnamed).");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError("Please write a short note on what you want built.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      businessName: businessName.trim(),
      country,
      message: message.trim(),
      selectedDesign: activeDesignIdentifier || undefined,
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            `Could not send your inquiry right now. Please email ${profile.email} directly.`
        );
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Could not send your inquiry. Please email ${profile.email} directly.`
      );
    } finally {
      setLoading(false);
    }
  }

  const fallbackMailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(
    businessName ? `Website inquiry: ${businessName}` : "Website project inquiry"
  )}&body=${encodeURIComponent(
    [
      name ? `Name: ${name}` : null,
      businessName ? `Business: ${businessName}` : null,
      activeDesignTitle ? `Selected design: ${activeDesignTitle}` : null,
      "",
      message,
    ]
      .filter((line): line is string => line !== null)
      .join("\n")
  )}`;

  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-28"
    >
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* Direct contact details */}
          <div>
            <SectionHeading
              label="Start a project"
              title="Tell me about your business"
              description="Share what your business does and what you want visitors to do on the site. I will reply with questions or a clear written proposal."
            />

            <dl className="mt-8 space-y-5 border-t border-border pt-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="size-4 text-primary" aria-hidden="true" />
                    <span>{profile.email}</span>
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Business WhatsApp
                </dt>
                <dd className="mt-1">
                  <a
                    href={profile.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <MessageSquare
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    <span>{profile.whatsapp}</span>
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Location &amp; response time
                </dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                  {profile.location} (GMT+5:30). {profile.responseTime} for
                  clients in the US, UK, Australia, Sri Lanka, and elsewhere.
                </dd>
              </div>
            </dl>
          </div>

          {/* Short 4-field inquiry form */}
          <div className="rounded-lg border border-border bg-background p-6 shadow-card sm:p-8">
            {sent ? (
              <div
                role="status"
                aria-live="polite"
                className="py-8"
              >
                <CheckCircle2
                  className="size-9 text-emerald-600"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-2xl font-semibold text-foreground">
                  Inquiry received
                </h3>
                <p className="mt-2 max-w-md text-body text-muted-foreground">
                  Thanks for reaching out, {name}. I have your project details
                  {activeDesignTitle
                    ? ` (including the ${activeDesignTitle} design concept)`
                    : ""}{" "}
                  and will reply to <strong>{email}</strong> within one business
                  day.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSent(false);
                    setMessage("");
                  }}
                >
                  Send another note
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {activeDesignTitle ? (
                  <div
                    role="region"
                    aria-label="Selected design concept"
                    className="flex items-center justify-between gap-3 rounded-md border border-primary/25 bg-accent p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      {selectedConcept ? (
                        <div className="relative hidden h-12 w-20 shrink-0 overflow-hidden rounded border border-border sm:block">
                          <Image
                            src={selectedConcept.screenshot}
                            alt={selectedConcept.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                          Selected design concept
                        </p>
                        <p className="text-[15px] font-semibold text-foreground">
                          {activeDesignTitle}
                        </p>
                        <Link
                          href="/salon-concepts"
                          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          Browse other salon concepts
                        </Link>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearSelectedDesign}
                      aria-label="Remove selected design concept"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Name
                    </label>
                    <input
                      id="inquiry-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Miller"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="inquiry-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah@yourbusiness.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inquiry-business"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Business name
                    </label>
                    <input
                      id="inquiry-business"
                      name="businessName"
                      type="text"
                      required
                      autoComplete="organization"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your salon, spa, or service business"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-country"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Country
                    </label>
                    <CountryPicker
                      id="inquiry-country"
                      name="country"
                      value={country}
                      onChange={setCountry}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-message"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    What do you want built?
                  </label>
                  <textarea
                    id="inquiry-message"
                    name="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your services, whether you need online booking or an updated service menu, and any launch timeline."
                    className={inputClass + " resize-y"}
                  />
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-red-50 p-3.5 text-sm text-destructive"
                  >
                    <p>{error}</p>
                    <p className="mt-2 text-xs text-foreground">
                      You can also send your note directly via{" "}
                      <a
                        href={fallbackMailtoHref}
                        className="font-medium text-primary underline"
                      >
                        email ({profile.email})
                      </a>{" "}
                      or{" "}
                      <a
                        href={profile.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary underline"
                      >
                        WhatsApp ({profile.whatsapp})
                      </a>
                      .
                    </p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Sending inquiry..." : "Send inquiry"}
                  <Send className="size-4" aria-hidden="true" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
