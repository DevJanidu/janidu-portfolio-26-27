import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  getFeaturedSalonConcepts,
  getVerifiedSalonConcepts,
} from "@/lib/salon-concepts";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquireDesignButton } from "@/components/enquire-design-button";

export function SalonConceptsSection() {
  const featured = getFeaturedSalonConcepts();
  const allVerifiedCount = getVerifiedSalonConcepts().length;

  if (featured.length === 0) return null;

  return (
    <section
      id="concepts"
      className="scroll-mt-20 border-y border-border bg-surface py-20 sm:py-28"
    >
      <div className="container">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            label="Salon collection · Design concepts"
            title="Pick a salon style and booking approach"
            description="Three contrasting starting points from my salon collection, ranging from an instant price directory to a calm first-visit guide and an editorial lookbook. Every design is customized to your brand and service menu."
          />

          <div className="shrink-0">
            <Link
              href="/salon-concepts"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-black/15 bg-[#CCFF00] px-6 text-[15px] font-semibold text-black shadow-[0_0_24px_rgba(204,255,0,0.55),0_6px_16px_-4px_rgba(0,0,0,0.12)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#D8FF33] hover:shadow-[0_0_32px_rgba(204,255,0,0.75),0_10px_20px_-4px_rgba(0,0,0,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Browse all {allVerifiedCount} salon concepts
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-12 divide-y divide-border border-t border-border">
          {featured.map((concept) => (
            <article
              key={concept.slug}
              className="grid items-center gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12"
            >
              <a
                href={concept.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${concept.title} live demo`}
                className="group block overflow-hidden rounded-lg border border-border bg-background shadow-card"
              >
                <div className="relative aspect-[16/9] w-full bg-neutral-900">
                  <Image
                    src={concept.screenshot}
                    alt={concept.screenshotAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                  />
                </div>
              </a>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{concept.label}</Badge>
                  <Badge variant="outline">{concept.bookingApproach}</Badge>
                  <Badge variant="default">{concept.tier} scope</Badge>
                </div>

                <h3 className="mt-3.5 text-2xl font-semibold tracking-tight text-foreground">
                  {concept.title}
                </h3>

                <p className="mt-3 text-body text-foreground/90">
                  {concept.suits}
                </p>

                <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                  {concept.styleSummary}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <EnquireDesignButton conceptSlug={concept.slug} />
                  <Button asChild variant="outline">
                    <a
                      href={concept.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open demo
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-[15px] text-muted-foreground">
            Want to compare more palettes and layouts? Explore all{" "}
            {allVerifiedCount} verified live salon concepts in the collection.
          </p>
          <Link
            href="/salon-concepts"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary hover:underline"
          >
            Open full salon concept gallery ({allVerifiedCount} designs)
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
