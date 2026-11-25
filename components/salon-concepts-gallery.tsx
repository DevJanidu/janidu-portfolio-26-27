"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SalonConcept } from "@/lib/salon-concepts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquireDesignButton } from "@/components/enquire-design-button";

export function SalonConceptsGallery({
  concepts,
}: {
  concepts: SalonConcept[];
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {concepts.map((concept, index) => (
        <article
          key={concept.slug}
          className="content-auto flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card"
        >
          <a
            href={concept.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${concept.title} live demo`}
            className="group relative block aspect-[16/9] w-full overflow-hidden border-b border-border bg-neutral-900"
          >
            <Image
              src={concept.screenshot}
              alt={concept.screenshotAlt}
              fill
              priority={index < 2}
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]"
            />
          </a>

          <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{concept.label}</Badge>
                <Badge variant="outline">{concept.bookingApproach}</Badge>
              </div>

              <h2 className="mt-3.5 text-2xl font-semibold tracking-tight text-foreground">
                {concept.title}
              </h2>

              <p className="mt-2.5 text-body text-foreground/90">
                {concept.suits}
              </p>

              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {concept.styleSummary}
              </p>

              <p className="mt-2.5 text-xs font-medium text-muted-foreground">
                Palette: {concept.palette}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
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
  );
}
