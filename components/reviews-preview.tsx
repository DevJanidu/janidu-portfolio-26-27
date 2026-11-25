"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import type { PublishedReview, ReviewSummary } from "@/lib/reviews";
import { getCountryByValue } from "@/lib/countries";
import { CountryFlag } from "@/components/country-flag";
import { SectionHeading } from "@/components/section-heading";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewsPreview({
  reviews,
  summary,
}: {
  reviews: PublishedReview[];
  summary: ReviewSummary | null;
}) {
  const [translatedIds, setTranslatedIds] = useState<Record<string, boolean>>(
    {}
  );
  const [liveTranslations, setLiveTranslations] = useState<
    Record<string, string>
  >({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  if (reviews.length === 0 || !summary) {
    return null;
  }

  async function toggleTranslation(review: PublishedReview) {
    if (translatedIds[review.id]) {
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

  return (
    <section
      id="reviews"
      className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-28"
    >
      <div className="container">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <SectionHeading
              label="Client reviews"
              title="Feedback from past projects"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[15px] text-muted-foreground">
              <StarRating rating={summary.average} />
              <span>
                <strong className="font-semibold text-foreground">
                  {summary.average.toFixed(1)}
                </strong>{" "}
                average from {summary.count}{" "}
                {summary.count === 1 ? "published review" : "published reviews"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/reviews">
                Read all reviews
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/reviews#leave-a-review">Leave a review</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {reviews.slice(0, 3).map((review) => {
            const isTranslated = Boolean(translatedIds[review.id]);
            const isLoading = Boolean(loadingIds[review.id]);
            const translatedText =
              review.translation || liveTranslations[review.id];

            return (
              <blockquote
                key={review.id}
                className="grid gap-4 py-8 md:grid-cols-[240px_1fr] md:gap-10"
              >
                <div>
                  <StarRating rating={review.rating} showNumeric size="sm" />
                  <p className="mt-2.5 text-base font-semibold text-foreground">
                    {review.clientName}
                  </p>
                  {review.businessName ? (
                    <p className="text-sm text-muted-foreground">
                      {review.businessName}
                    </p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{review.projectName}</span>
                    {review.location ? (
                      <>
                        <span>&middot;</span>
                        <CountryFlag
                          code={getCountryByValue(review.location).code}
                        />
                        <span>{review.location}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                <div>
                  <p className="text-body text-foreground/90">
                    &ldquo;
                    {isTranslated && translatedText
                      ? translatedText
                      : review.comment}
                    &rdquo;
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => toggleTranslation(review)}
                      disabled={isLoading}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
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
                      <span>{isTranslated ? "Show original" : "Translate"}</span>
                    </button>
                  </div>
                </div>
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}
