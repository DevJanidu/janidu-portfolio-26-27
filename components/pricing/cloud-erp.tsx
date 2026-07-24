import { X } from "lucide-react";
import { cloudERP } from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CloudErp() {
  return (
    <section id="cloud-erp" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="open cloud-erp"
          title={cloudERP.tagline}
          description={cloudERP.bestFor}
        />
        <Reveal i={1}>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {cloudERP.description}
          </p>
        </Reveal>

        <Reveal i={2}>
          <p className="mt-10 font-mono text-xs uppercase tracking-widest text-ocean">
            Modules
          </p>
        </Reveal>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cloudERP.modules.map((mod, i) => (
            <Reveal key={mod.title} i={(i % 6) + 1}>
              <Card className="h-full transition-colors hover:border-ocean/30">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="mb-3 font-display text-sm font-semibold text-navy">
                    {mod.title}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {mod.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span className="mt-1 text-ocean">▹</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  {mod.note ? (
                    <p className="mt-3 text-xs text-muted-foreground/70">
                      {mod.note}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Reveal i={1}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Optional custom modules
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {cloudERP.optionalModules.map((m) => (
                    <li key={m}>
                      <Badge variant="outline">{m}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={2}>
            <Card className="h-full border-ocean/20 bg-accent/40">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Important information
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {cloudERP.importantInfo.map((info) => (
                    <li key={info} className="flex gap-2">
                      <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal i={3}>
          <Card className="mt-6">
            <CardContent className="p-6 sm:p-7">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                Pricing is calculated based on
              </h3>
              <ul className="grid gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                {cloudERP.pricingFactors.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-1 text-ocean">▹</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal i={4}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted p-6">
            <p className="font-mono text-lg font-semibold text-ocean">
              {cloudERP.startingPrice}
            </p>
            <Button asChild size="lg">
              <a href="/#contact">{cloudERP.cta}</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
