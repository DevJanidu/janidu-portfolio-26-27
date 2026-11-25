import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { profile, siteUrl } from "@/lib/data";
import { computeReviewSummary, getPublishedReviews } from "@/lib/reviews";
import { ReviewsList } from "@/components/reviews-list";
import { ReviewForm } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 60;

const title = `Client Reviews | ${profile.publicName}`;
const description =
  "Read verified feedback from past small-business website projects, or leave a review if we recently worked together.";
const url = `${siteUrl}/reviews`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "JaniduDev",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();
  const summary = computeReviewSummary(reviews);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: url },
    ],
  };

  return (
    <div className="pb-24 pt-24 sm:pt-32">
      <div className="container max-w-5xl">
        <JsonLd data={breadcrumbJsonLd} />

        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              Reviews
            </li>
          </ol>
        </nav>

        <header className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="section-label">Client reviews</p>
            <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {reviews.length > 0
                ? "What past clients say"
                : "Leave a project review"}
            </h1>
            <p className="mt-4 text-body text-muted-foreground sm:text-body-lg">
              {reviews.length > 0
                ? "Every testimonial below is from a verified client project and displays the exact rating submitted."
                : "Only verified client reviews are published here. If we worked together on your website or booking system, you can share your feedback below."}
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="shrink-0">
              <Button asChild size="lg">
                <a href="#leave-a-review">Leave a review</a>
              </Button>
            </div>
          ) : null}
        </header>

        {/* Published testimonials (only rendered when approved reviews exist) */}
        {reviews.length > 0 && summary ? (
          <ReviewsList reviews={reviews} summary={summary} />
        ) : null}

        {/* Review submission section */}
        <section
          id="leave-a-review"
          className={
            reviews.length > 0
              ? "mt-20 scroll-mt-24 border-t border-border pt-16"
              : "mt-10 scroll-mt-24"
          }
        >
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Worked with me recently?
              </h2>
              <p className="mt-3 text-body text-muted-foreground">
                Select a rating from 1 to 5, name the project we built, and
                share a few honest sentences about your experience.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Submissions are reviewed before going live to confirm project
                details. Your email address is kept strictly private.
              </p>
            </div>

            <ReviewForm />
          </div>
        </section>
      </div>
    </div>
  );
}
