"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SalonConcept, SalonPackageTier } from "@/lib/salon-concepts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquireDesignButton } from "@/components/enquire-design-button";
import { cn } from "@/lib/utils";

type TierFilter = "All" | SalonPackageTier;

const TIER_ORDER: TierFilter[] = ["All", "Starter", "Standard", "Premium"];

export function SalonConceptsGallery({
  concepts,
}: {
  concepts: SalonConcept[];
}) {
  const [activeTier, setActiveTier] = useState<TierFilter>("All");

  const counts = useMemo(() => {
    const map: Record<TierFilter, number> = {
      All: concepts.length,
      Starter: 0,
      Standard: 0,
      Premium: 0,
    };
    for (const concept of concepts) {
      map[concept.tier] += 1;
    }
    return map;
  }, [concepts]);

  const filtered = useMemo(() => {
    if (activeTier === "All") return concepts;
    return concepts.filter((concept) => concept.tier === activeTier);
  }, [concepts, activeTier]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter salon design concepts by scope tier"
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        {TIER_ORDER.map((tier) => {
          const count = counts[tier];
          if (tier !== "All" && count === 0) return null;
          const selected = activeTier === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTier(tier)}
              aria-pressed={selected}
              className={cn(
                "rounded-md border px-3.5 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {tier} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {filtered.map((concept, index) => (
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
                  <Badge variant="default">{concept.tier}</Badge>
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
    </div>
  );
}
