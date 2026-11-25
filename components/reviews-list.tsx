"use client";

import { useMemo, useState } from "react";
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

  const filtered = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  const visibleReviews = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visibleCount);

  return (
    <section aria-label="Published client reviews" className="mt-10">
      {/* Summary bar derived strictly from published reviews */}
      <div className="flex flex-col justify-between gap-6 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-7">
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

      {/* Multi-column layout engineered to comfortably display 30+ reviews */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visibleReviews.map((review) => (
          <article
            key={review.id}
            className="content-auto flex flex-col justify-between rounded-lg border border-border bg-surface p-6 shadow-card sm:p-7"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <StarRating rating={review.rating} showNumeric size="sm" />
                <time
                  dateTime={review.publishedAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatReviewDate(review.publishedAt)}
                </time>
              </div>

              <p className="mt-4 text-body text-foreground/95">
                &ldquo;{review.comment}&rdquo;
              </p>

              {review.translation ? (
                <p className="mt-2.5 border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    English:
                  </span>{" "}
                  {review.translation}
                </p>
              ) : null}
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
        ))}
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
