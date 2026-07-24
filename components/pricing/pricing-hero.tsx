import { ArrowRight, Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { pricingHero, overview, overviewNote } from "@/lib/pricing-data";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-dotgrid pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-sky/40 blur-[120px]"
      />
      <div className="container relative">
        <Reveal>
          <span className="eyebrow">
            <span className="text-muted-foreground/60">$</span>{" "}
            {pricingHero.eyebrow}
          </span>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            {pricingHero.title}
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {pricingHero.intro}
          </p>
        </Reveal>

        <Reveal i={3}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href="/#contact">
                Get a Free Consultation <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`mailto:${profile.email}`}>
                <Mail className="size-4" /> Email me directly
              </a>
            </Button>
          </div>
        </Reveal>

        {/* Choose the right solution */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {overview.map((pkg, i) => (
            <Reveal key={pkg.name} i={i}>
              <Card className="h-full transition-colors hover:border-ocean/30">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <h2 className="font-display text-xl font-bold text-navy">
                    {pkg.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Best for:
                    </span>{" "}
                    {pkg.bestFor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Purpose:
                    </span>{" "}
                    {pkg.purpose}
                  </p>
                  <p className="mt-auto pt-3 font-mono text-sm font-semibold text-ocean">
                    {pkg.price}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal i={4}>
          <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Prices are one-time payments.
            </span>{" "}
            {overviewNote.replace(
              "Prices are one-time payments for the standard package. ",
              "",
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
