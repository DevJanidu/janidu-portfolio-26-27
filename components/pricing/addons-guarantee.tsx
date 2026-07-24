import { Check, X } from "lucide-react";
import { addOns, bugFixes, charges, chargesNote } from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AddonsGuarantee() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container space-y-16">
        {/* Optional add-ons */}
        <div>
          <SectionHeading
            command="ls ./add-ons"
            title="Optional Add-Ons"
            description="Optional services can be added to any suitable package."
          />
          <Reveal i={1}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {addOns.map((a) => (
                <li key={a}>
                  <Badge variant="outline">{a}</Badge>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Free lifetime bug fixes */}
        <div>
          <SectionHeading
            command="cat guarantee.md"
            title="Free Lifetime Bug Fixes"
            description={bugFixes.description}
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Reveal i={1}>
              <Card className="h-full">
                <CardContent className="p-6 sm:p-7">
                  <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                    Included
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {bugFixes.included.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-ocean" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal i={2}>
              <Card className="h-full">
                <CardContent className="p-6 sm:p-7">
                  <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                    Not included
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {bugFixes.notIncluded.map((item) => (
                      <li key={item} className="flex gap-2">
                        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
          <Reveal i={3}>
            <p className="mt-4 text-sm text-muted-foreground">
              {bugFixes.note}
            </p>
          </Reveal>
        </div>

        {/* Domain, hosting, and third-party charges */}
        <div>
          <SectionHeading
            command="cat charges.md"
            title="Domain, Hosting, and Third-Party Charges"
            description={chargesNote}
          />
          <Reveal i={1}>
            <Card className="mt-8">
              <CardContent className="p-6 sm:p-7">
                <ul className="grid gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {charges.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-1 text-ocean">▹</span>
                      <span>{c}</span>
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
