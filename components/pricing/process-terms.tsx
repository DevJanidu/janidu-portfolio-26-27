import {
  deliveryFactors,
  deliveryTimes,
  paymentTerms,
  paymentTermsNote,
  process,
  responsibilities,
  responsibilitiesNote,
  revisions,
} from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";

export function ProcessTerms() {
  return (
    <section
      id="process"
      className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-28"
    >
      <div className="container space-y-16">
        {/* Project process */}
        <div>
          <SectionHeading
            command="./run-project.sh"
            title="Project Process"
            description="From first conversation to launch."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step, i) => (
              <Reveal key={step.title} i={i % 4}>
                <Card className="h-full">
                  <CardContent className="p-5 sm:p-6">
                    <span className="font-mono text-2xl font-bold text-ice">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-sm font-semibold text-navy">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Payment terms + delivery time */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal i={0}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-ocean">
                  Payment terms
                </h3>
                <ul className="space-y-3">
                  {paymentTerms.map((term) => (
                    <li key={term.label} className="flex items-baseline gap-3">
                      <span className="font-display text-xl font-bold text-ocean">
                        {term.split}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {term.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground/70">
                  {paymentTermsNote}
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={1}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-ocean">
                  Delivery time
                </h3>
                <ul className="space-y-3">
                  {deliveryTimes.map((d) => (
                    <li
                      key={d.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {d.name}
                      </span>
                      <span className="text-muted-foreground">{d.estimate}</span>
                    </li>
                  ))}
                </ul>
                <p className="mb-2 mt-5 text-xs uppercase tracking-widest text-muted-foreground/70">
                  Timeline may change based on
                </p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {deliveryFactors.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Responsibilities + revisions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal i={0}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Content &amp; customer responsibilities
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {responsibilities.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="mt-1 text-ocean">▹</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground/70">
                  {responsibilitiesNote}
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={1}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Revisions &amp; scope changes
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {revisions.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="mt-1 text-ocean">▹</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
