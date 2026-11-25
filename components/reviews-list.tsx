"use client";

import { useMemo, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import type { PublishedReview, ReviewSummary } from "@/lib/reviews";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 18;

function formatReviewDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ReviewsList({
  reviews,
  summary,
}: {
  reviews: PublishedReview[];
  summary: ReviewSummary;
}) {
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Translation state: comments stay in their original language until the visitor clicks the globe button.
  const [translatedIds, setTranslatedIds] = useState<Record<string, boolean>>(
    {}
  );
  const [liveTranslations, setLiveTranslations] = useState<
    Record<string, string>
  >({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [globalTranslated, setGlobalTranslated] = useState(false);

  const filtered = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  const visibleReviews = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visibleCount);

  async function toggleReviewTranslation(review: PublishedReview) {
    const isCurrentlyShown = Boolean(translatedIds[review.id]);
    if (isCurrentlyShown) {
      setTranslatedIds((prev) => ({ ...prev, [review.id]: false }));
      return;
    }

    // Use stored translation immediately if available (e.g., Sinhala, Singlish, Spanish).
    if (review.translation || liveTranslations[review.id]) {
      setTranslatedIds((prev) => ({ ...prev, [review.id]: true }));
      return;
    }

    // Otherwise call our live /api/translate endpoint on demand.
    setLoadingIds((prev) => ({ ...prev, [review.id]: true }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: review.comment, target: "en" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.translatedText === "string") {
        setLiveTranslations((prev) => ({
          ...prev,
          [review.id]: data.translatedText,
        }));
        setTranslatedIds((prev) => ({ ...prev, [review.id]: true }));
      }
    } finally {
      setLoadingIds((prev) => ({ ...prev, [review.id]: false }));
    }
  }

  function handleGlobalTranslateToggle() {
    const next = !globalTranslated;
    setGlobalTranslated(next);
    const updated: Record<string, boolean> = {};
    for (const review of reviews) {
      if (review.translation || liveTranslations[review.id]) {
        updated[review.id] = next;
      }
    }
    setTranslatedIds(updated);
  }

  return (
    <section aria-label="Published client reviews" className="mt-10">
      {/* Summary bar + global translate toggle + rating filters */}
      <div className="flex flex-col justify-between gap-6 rounded-lg border border-border bg-surface p-6 sm:p-7 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {summary.average.toFixed(1)}
          </span>
          <div>
            <StarRating rating={summary.average} />
            <p className="mt-1 text-sm text-muted-foreground">
              Derived from {summary.count}{" "}
              {summary.count === 1 ? "published review" : "published reviews"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleGlobalTranslateToggle}
            aria-pressed={globalTranslated}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              globalTranslated
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-foreground/30"
            )}
          >
            <Globe className="size-4" aria-hidden="true" />
            {globalTranslated ? "Showing English" : "Translate all"}
          </button>

          {reviews.length > 3 ? (
            <div
              role="group"
              aria-label="Filter reviews by rating"
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                onClick={() => {
                  setRatingFilter("all");
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-pressed={ratingFilter === "all"}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  ratingFilter === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                All ({reviews.length})
              </button>
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = summary.distribution[star];
                if (count === 0) return null;
                const selected = ratingFilter === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRatingFilter(star);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {star} {star === 1 ? "star" : "stars"} ({count})
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Multi-column layout engineered to comfortably display 30+ reviews */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visibleReviews.map((review) => {
          const isTranslated = Boolean(translatedIds[review.id]);
          const isLoading = Boolean(loadingIds[review.id]);
          const translatedText =
            review.translation || liveTranslations[review.id];

          return (
            <article
              key={review.id}
              className="content-auto flex flex-col justify-between rounded-lg border border-border bg-surface p-6 shadow-card sm:p-7"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <StarRating rating={review.rating} showNumeric size="sm" />
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleReviewTranslation(review)}
                      disabled={isLoading}
                      aria-label={
                        isTranslated
                          ? "Show original review language"
                          : "Translate review to English"
                      }
                      title={
                        isTranslated ? "Show original" : "Translate to English"
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                        isTranslated
                          ? "border-primary/30 bg-accent text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      {isLoading ? (
                        <Loader2
                          className="size-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Globe className="size-3.5" aria-hidden="true" />
                      )}
                      <span>{isTranslated ? "Original" : "Translate"}</span>
                    </button>
                    <time
                      dateTime={review.publishedAt}
                      className="text-xs text-muted-foreground"
                    >
                      {formatReviewDate(review.publishedAt)}
                    </time>
                  </div>
                </div>

                <p className="mt-4 text-body text-foreground/95">
                  &ldquo;{isTranslated && translatedText ? translatedText : review.comment}&rdquo;
                </p>
              </div>

              <footer className="mt-5 border-t border-border pt-4">
                <p className="text-[15px] font-semibold text-foreground">
                  {review.clientName}
                  {review.businessName ? (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      &middot; {review.businessName}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {review.projectName}
                  {review.location ? ` · ${review.location}` : ""}
                </p>
              </footer>
            </article>
          );
        })}
      </div>

      {remaining > 0 ? (
        <div className="mt-8 text-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          >
            Show more reviews ({remaining} remaining)
          </Button>
        </div>
      ) : null}
    </section>
  );
}
