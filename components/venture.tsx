import { ArrowUpRight, Rocket } from "lucide-react";
import { venture } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Venture() {
  return (
    <section id="venture" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="./lycolabs --founder"
          title="Founder of LycoLabs"
          description={venture.tagline}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-6 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-ocean/30 bg-accent text-ocean">
                    <Rocket className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold text-navy">
                      {venture.name}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-widest text-ocean">
                      {venture.role}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground">{venture.blurb}</p>

                <div>
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    What we build
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {venture.services.map((s) => (
                      <li key={s}>
                        <Badge variant="outline">{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-2">
                  <Button asChild variant="outline">
                    <a
                      href={venture.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit LycoLabs <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={1}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col justify-center gap-6 p-6 sm:p-8">
                <div>
                  <div className="font-display text-4xl font-bold text-ocean">
                    6+
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Service lines delivered
                  </div>
                </div>
                <div>
                  <div className="font-display text-4xl font-bold text-ocean">
                    End&#8209;to&#8209;end
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Concept, build, and launch
                  </div>
                </div>
                <div>
                  <div className="font-display text-4xl font-bold text-ocean">
                    Founder
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Leading product & delivery
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
