import { Check, X } from "lucide-react";
import { webLite } from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WebLite() {
  return (
    <section id="web-lite" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="open web-lite"
          title={webLite.tagline}
          description={webLite.bestFor}
        />
        <Reveal i={1}>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {webLite.description}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Reveal i={2}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Suitable for
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {webLite.suitableFor.map((s) => (
                    <li key={s}>
                      <Badge variant="outline">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={3}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Included pages
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {webLite.includedPages.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-1 text-ocean">▹</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground/70">
                  {webLite.includedPagesNote}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal i={4}>
          <Card className="mt-6">
            <CardContent className="p-6 sm:p-7">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-ocean">
                Included features
              </h3>
              <ul className="grid gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                {webLite.includedFeatures.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-ocean" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Reveal i={5}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  What customers can do
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {webLite.whatCustomersCanDo.map((c) => (
                    <li key={c} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-ocean" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={6}>
            <Card className="h-full border-ocean/20 bg-accent/40">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Important information
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {webLite.importantInfo.map((info) => (
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

        <Reveal i={7}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted p-6">
            <p className="font-mono text-lg font-semibold text-ocean">
              {webLite.startingPrice}
            </p>
            <Button asChild size="lg">
              <a href="/#contact">{webLite.cta}</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
