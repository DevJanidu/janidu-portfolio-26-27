import { Check } from "lucide-react";
import { webPro } from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function FeatureCard({
  title,
  items,
  note,
  i,
}: {
  title: string;
  items: string[];
  note?: string;
  i: number;
}) {
  return (
    <Reveal i={i}>
      <Card className="h-full">
        <CardContent className="p-6 sm:p-7">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
            {title}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {items.map((it) => (
              <li key={it} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-ocean" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
          {note ? (
            <p className="mt-4 text-xs text-muted-foreground/70">{note}</p>
          ) : null}
        </CardContent>
      </Card>
    </Reveal>
  );
}

export function WebPro() {
  return (
    <section
      id="web-pro"
      className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-28"
    >
      <div className="container">
        <SectionHeading
          command="open web-pro"
          title={webPro.tagline}
          description={webPro.bestFor}
        />
        <Reveal i={1}>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {webPro.description}
          </p>
        </Reveal>

        <Reveal i={2}>
          <div className="mt-8">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
              Suitable for
            </h3>
            <ul className="flex flex-wrap gap-2">
              {webPro.suitableFor.map((s) => (
                <li key={s}>
                  <Badge variant="outline">{s}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal i={3}>
          <p className="mt-10 font-display text-lg font-semibold text-navy">
            Includes everything in Web Lite, plus:
          </p>
        </Reveal>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <FeatureCard
            i={4}
            title="Online customer actions"
            items={webPro.onlineActions}
            note={webPro.onlineActionsNote}
          />
          <FeatureCard
            i={5}
            title="Booking, inquiry, or registration features"
            items={webPro.bookingFeatures}
          />
          <FeatureCard
            i={6}
            title="Email notifications and confirmations"
            items={webPro.emailNotifications}
          />
          <FeatureCard
            i={7}
            title="Business management dashboard"
            items={webPro.dashboardFeatures}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal i={8}>
            <Card className="h-full">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  What your business can manage
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {webPro.whatBusinessCanManage.map((m) => (
                    <li key={m}>
                      <Badge>{m}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={9}>
            <Card className="h-full border-ocean/20 bg-accent/40">
              <CardContent className="p-6 sm:p-7">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-ocean">
                  Optional AI features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {webPro.aiFeatures.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-ocean" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground/70">
                  {webPro.aiNote}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal i={10}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-lg font-semibold text-ocean">
              {webPro.startingPrice}
            </p>
            <Button asChild size="lg">
              <a href="/#contact">{webPro.cta}</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
