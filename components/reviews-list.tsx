"use client";

import { useMemo, useState } from "react";
import { Calendar, Globe, Loader2, RotateCcw } from "lucide-react";
import type { PublishedReview, ReviewSummary } from "@/lib/reviews";
import { getCountryByValue } from "@/lib/countries";
import { CountryFlag } from "@/components/country-flag";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 18;

type SortOption = "recent" | "oldest" | "highest";

function formatReviewDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7); // YYYY-MM
}

function formatMonthLabel(monthKey: string): string {
  const parsed = new Date(`${monthKey}-01T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return monthKey;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
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
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
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

  const monthOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reviews) {
      const key = getMonthKey(r.publishedAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, count]) => ({
        key,
        label: formatMonthLabel(key),
        count,
      }));
  }, [reviews]);

  const countryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reviews) {
      if (!r.location) continue;
      counts.set(r.location, (counts.get(r.location) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        count,
        country: getCountryByValue(value),
      }));
  }, [reviews]);

  const filtered = useMemo(() => {
    const matching = reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;
      if (monthFilter !== "all" && getMonthKey(r.publishedAt) !== monthFilter)
        return false;
      if (countryFilter !== "all" && r.location !== countryFilter) return false;
      return true;
    });

    return [...matching].sort((a, b) => {
      if (sortBy === "oldest") {
        return a.publishedAt.localeCompare(b.publishedAt);
      }
      if (sortBy === "highest") {
        return b.rating - a.rating || b.publishedAt.localeCompare(a.publishedAt);
      }
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [reviews, ratingFilter, monthFilter, countryFilter, sortBy]);

  const hasActiveFilters =
    sortBy !== "recent" ||
    monthFilter !== "all" ||
    countryFilter !== "all" ||
    ratingFilter !== "all";

  const visibleReviews = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visibleCount);

  function resetFilters() {
    setSortBy("recent");
    setMonthFilter("all");
    setCountryFilter("all");
    setRatingFilter("all");
    setVisibleCount(PAGE_SIZE);
  }

  async function toggleReviewTranslation(review: PublishedReview) {
    const isCurrentlyShown = Boolean(translatedIds[review.id]);
    if (isCurrentlyShown) {
      setTranslatedIds((prev) => ({ ...prev, [review.id]: false }));
      return;
    }

    if (review.translation || liveTranslations[review.id]) {
      setTranslatedIds((prev) => ({ ...prev, [review.id]: true }));
      return;
    }

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
      {/* Summary & Filters Panel */}
      <div className="space-y-5 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

          <button
            type="button"
            onClick={handleGlobalTranslateToggle}
            aria-pressed={globalTranslated}
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors",
              globalTranslated
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-foreground/30"
            )}
          >
            <Globe className="size-4" aria-hidden="true" />
            {globalTranslated ? "Showing English" : "Translate all"}
          </button>
        </div>

        {/* Sort + Month + Rating controls */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="reviews-sort"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Sort
            </label>
            <select
              id="reviews-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-input bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
            </select>
          </div>

          {monthOptions.length > 1 ? (
            <div className="flex items-center gap-2">
              <label
                htmlFor="reviews-month"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                <Calendar className="size-3.5" aria-hidden="true" />
                Month
              </label>
              <select
                id="reviews-month"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="rounded-md border border-input bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All months ({reviews.length})</option>
                {monthOptions.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} ({m.count})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div
            role="group"
            aria-label="Filter reviews by rating"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => {
                setRatingFilter("all");
                setVisibleCount(PAGE_SIZE);
              }}
              aria-pressed={ratingFilter === "all"}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                ratingFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              All ratings
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
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {star} ★ ({count})
                </button>
              );
            })}
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset filters
            </button>
          ) : null}
        </div>

        {/* Country flag pills */}
        {countryOptions.length > 1 ? (
          <div
            role="group"
            aria-label="Filter reviews by country"
            className="flex flex-wrap items-center gap-2 border-t border-border pt-4"
          >
            <button
              type="button"
              onClick={() => {
                setCountryFilter("all");
                setVisibleCount(PAGE_SIZE);
              }}
              aria-pressed={countryFilter === "all"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                countryFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              All countries ({reviews.length})
            </button>
            {countryOptions.map(({ value, count, country }) => {
              const selected = countryFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setCountryFilter(value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-foreground/30"
                  )}
                >
                  <CountryFlag code={country.code} />
                  <span>{value}</span>
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Results count */}
      {hasActiveFilters ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {reviews.length} reviews
        </p>
      ) : null}

      {/* Multi-column layout engineered to comfortably display 30+ reviews */}
      {visibleReviews.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {visibleReviews.map((review) => {
            const isTranslated = Boolean(translatedIds[review.id]);
            const isLoading = Boolean(loadingIds[review.id]);
            const translatedText =
              review.translation || liveTranslations[review.id];
            const countryInfo = review.location
              ? getCountryByValue(review.location)
              : null;

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
                          isTranslated
                            ? "Show original"
                            : "Translate to English"
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
                    &ldquo;
                    {isTranslated && translatedText
                      ? translatedText
                      : review.comment}
                    &rdquo;
                  </p>
                </div>

                <footer className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
                  <div>
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
                    </p>
                  </div>

                  {countryInfo && review.location ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-xs font-medium text-foreground">
                      <CountryFlag code={countryInfo.code} />
                      <span>{review.location}</span>
                    </span>
                  ) : null}
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-body text-muted-foreground">
            No reviews match the selected filters.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        </div>
      )}

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
