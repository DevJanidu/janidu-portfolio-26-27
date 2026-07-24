import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { faqs, finalCTA } from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PricingFaq() {
  return (
    <>
      <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            command="man pricing"
            title="Frequently Asked Questions"
          />

          <div className="mt-10 max-w-3xl space-y-3">
            {faqs.map((item, i) => (
              <Reveal key={item.q} i={i % 4}>
                <details className="group rounded-lg border border-border bg-card open:border-ocean/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-sm font-semibold text-navy">
                    {item.q}
                    <ChevronDown className="size-4 shrink-0 text-ocean transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="contact-cta"
        className="scroll-mt-20 border-t border-border bg-muted py-20 sm:py-28"
      >
        <div className="container">
          <Reveal>
            <Card className="border-ocean/20 bg-accent/40">
              <CardContent className="flex flex-col items-start gap-6 p-8 sm:p-10">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                    {finalCTA.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-muted-foreground">
                    {finalCTA.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <a href="/#contact">
                      {finalCTA.primaryCta} <ArrowRight className="size-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href={`mailto:${profile.email}?subject=Demo request`}>
                      <Mail className="size-4" /> {finalCTA.secondaryCta}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
