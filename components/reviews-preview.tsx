import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublishedReview, ReviewSummary } from "@/lib/reviews";
import { SectionHeading } from "@/components/section-heading";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";

export function ReviewsPreview({
  reviews,
  summary,
}: {
  reviews: PublishedReview[];
  summary: ReviewSummary | null;
}) {
  // Hide the empty testimonial section completely when there are no approved reviews.
  if (reviews.length === 0 || !summary) {
    return null;
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
          {reviews.slice(0, 3).map((review) => (
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
                <p className="mt-1 text-xs text-muted-foreground">
                  Project: {review.projectName}
                </p>
              </div>

              <p className="text-body text-foreground/90">
                &ldquo;{review.comment}&rdquo;
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
