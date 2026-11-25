"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send, Star } from "lucide-react";
import { profile } from "@/lib/data";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { CountryPicker } from "@/components/country-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-input bg-white px-3.5 py-3 text-[16px] text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";

const RATING_LABELS: Record<number, string> = {
  1: "1 star: Poor",
  2: "2 stars: Fair",
  3: "3 stars: Good",
  4: "4 stars: Very good",
  5: "5 stars: Excellent",
};

export function ReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [comment, setComment] = useState("");
  const [displayPermission, setDisplayPermission] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating from 1 to 5.");
      return;
    }
    if (!clientName.trim() || clientName.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(
        "Please enter a valid email address for private verification."
      );
      return;
    }
    if (!projectName.trim() || projectName.trim().length < 2) {
      setError("Please enter the name of your project.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 12) {
      setError("Please write a short comment about working together.");
      return;
    }
    if (!displayPermission) {
      setError(
        "Please check the permission box so we know we may display your name or business once moderated."
      );
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          clientName: clientName.trim(),
          businessName: businessName.trim() || undefined,
          country,
          email: email.trim(),
          projectName: projectName.trim(),
          comment: comment.trim(),
          displayPermission,
          website: formData.get("website"), // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            `Could not submit your review right now. Please try again or email ${profile.email}.`
        );
      }
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Could not submit your review. Please email ${profile.email}.`
      );
    } finally {
      setLoading(false);
    }
  }

  const activeStars = hoverRating || rating;

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8"
      >
        <CheckCircle2
          className="size-9 text-emerald-600"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-2xl font-semibold text-foreground">
          Thank you for your review
        </h3>
        <p className="mt-2 max-w-lg text-body text-muted-foreground">
          Your {rating}-star review for <strong>{projectName}</strong> has been
          published. Your email address stays private and is never displayed.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8"
      noValidate
    >
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* Rating 1 to 5 */}
      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Your rating (1 to 5)
        </legend>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = rating === value;
              const filled = value <= activeStars;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={RATING_LABELS[value]}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                      e.preventDefault();
                      setRating(Math.min(5, (rating || 0) + 1));
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                      e.preventDefault();
                      setRating(Math.max(1, (rating || 2) - 1));
                    }
                  }}
                  className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-white transition-colors hover:border-primary/40"
                >
                  <Star
                    className={cn(
                      "size-5 transition-colors",
                      filled
                        ? "fill-amber-500 text-amber-500"
                        : "fill-transparent text-muted-foreground/40"
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating > 0 ? RATING_LABELS[rating] : "Select a star rating"}
          </span>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="review-client-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Your name
          </label>
          <input
            id="review-client-name"
            name="clientName"
            type="text"
            required
            autoComplete="name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Alex Morgan"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="review-business-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Business name <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="review-business-name"
            name="businessName"
            type="text"
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Morgan Hair Studio"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="review-project-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Project name
          </label>
          <input
            id="review-project-name"
            name="projectName"
            type="text"
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Salon website & online booking"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="review-country"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Country
          </label>
          <CountryPicker
            id="review-country"
            name="country"
            value={country}
            onChange={setCountry}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="review-email"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Email <span className="text-muted-foreground">(kept private)</span>
        </label>
        <input
          id="review-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-describedby="review-email-privacy"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@yourbusiness.com"
          className={inputClass}
        />
        <p
          id="review-email-privacy"
          className="mt-1 text-xs text-muted-foreground"
        >
          Used only to verify your project. Never shown on the site.
        </p>
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Short comment
        </label>
        <textarea
          id="review-comment"
          name="comment"
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did we build together, and how did the process go?"
          className={inputClass + " resize-y"}
        />
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3.5">
        <input
          id="review-permission"
          name="displayPermission"
          type="checkbox"
          required
          checked={displayPermission}
          onChange={(e) => setDisplayPermission(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
        />
        <label
          htmlFor="review-permission"
          className="text-sm leading-relaxed text-foreground"
        >
          I worked with {profile.publicName} on this project and give permission
          to display this review along with my name or business name on the
          website.
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-red-50 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Submitting review..." : "Submit review"}
        <Send className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
