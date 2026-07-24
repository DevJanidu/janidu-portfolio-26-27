import { Check, X } from "lucide-react";
import { salonWebLite, salonWebPro, salonERP } from "@/lib/salon-data";
import { SectionHeading } from "@/components/section-heading";
import { GsapReveal } from "@/components/salon/gsap-reveal";
import { SalonContainer } from "@/components/salon/salon-container";
import { Card, CardContent } from "@/components/ui/card";
import {
  InquiryDialogProvider,
  InquiryTrigger,
} from "@/components/pricing/inquiry-dialog";

function FeatureList({
  items,
  dark,
}: {
  items: string[];
  dark?: boolean;
}) {
  return (
    <ul className="grid gap-x-6 gap-y-2.5 text-base sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check
            className={
              "mt-1 size-4 shrink-0 " + (dark ? "text-sky" : "text-ocean")
            }
          />
          <span className={dark ? "text-white/80" : "text-muted-foreground"}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SalonPackages() {
  return (
    <section
      id="packages"
      className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-28"
    >
      <SalonContainer>
        <SectionHeading
          command="ls ./salon-packages"
          title="Three Ways to Get Your Salon Online"
          description="Start with a professional website, add online booking and a dashboard, or run your entire salon on one cloud ERP."
        />

        <InquiryDialogProvider>
          <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-start">
            {/* Salon Web Lite */}
            <GsapReveal delay={0}>
              <Card className="flex h-full flex-col p-7 shadow-card sm:p-8">
                <p className="font-mono text-sm font-bold uppercase tracking-widest text-ocean">
                  Package 1
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold text-navy">
                  {salonWebLite.name}
                </h3>
                <p className="mt-3 text-base text-muted-foreground">
                  {salonWebLite.bestFor}
                </p>
                <div className="my-6 h-px bg-border" />
                <div className="flex-1">
                  <FeatureList items={salonWebLite.features} />
                </div>
                <p className="mt-6 flex gap-2 rounded-lg bg-muted p-4 text-sm leading-6 text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                  {salonWebLite.importantInfo}
                </p>
                <InquiryTrigger
                  packageName={salonWebLite.name}
                  cta={salonWebLite.cta}
                  className="mt-6 text-base"
                />
              </Card>
            </GsapReveal>

            {/* Salon Web Pro (featured) */}
            <GsapReveal delay={0.08}>
              <Card className="flex h-full flex-col border-navy bg-navy p-7 text-white shadow-elevated lg:-translate-y-4 sm:p-8">
                <p className="font-mono text-sm font-bold uppercase tracking-widest text-sky">
                  Package 2 · Most popular
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold">
                  {salonWebPro.name}
                </h3>
                <p className="mt-3 text-base text-white/70">{salonWebPro.bestFor}</p>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/60">
                  {salonWebPro.includesNote}
                </p>

                <div className="mt-5 space-y-6">
                  <div>
                    <h4 className="mb-2 font-mono text-sm uppercase tracking-widest text-sky">
                      {salonWebPro.booking.title}
                    </h4>
                    <FeatureList items={salonWebPro.booking.features} dark />
                  </div>
                  <div className="h-px bg-white/15" />
                  <div>
                    <h4 className="mb-2 font-mono text-sm uppercase tracking-widest text-sky">
                      {salonWebPro.dashboard.title}
                    </h4>
                    <FeatureList items={salonWebPro.dashboard.features} dark />
                  </div>
                </div>

                <InquiryTrigger
                  packageName={salonWebPro.name}
                  cta={salonWebPro.cta}
                  featured
                  className="mt-8 text-base"
                />
              </Card>
            </GsapReveal>

            {/* Full Cloud Salon ERP */}
            <GsapReveal delay={0.16}>
              <Card className="flex h-full flex-col p-7 shadow-card sm:p-8">
                <p className="font-mono text-sm font-bold uppercase tracking-widest text-ocean">
                  Package 3
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold text-navy">
                  {salonERP.name}
                </h3>
                <p className="mt-3 text-base text-muted-foreground">
                  {salonERP.description}
                </p>
                <div className="my-6 h-px bg-border" />
                <p className="text-base text-muted-foreground">{salonERP.accessNote}</p>
                <CardContent className="mt-4 flex-1 p-0">
                  <a
                    href="#modules"
                    className="inline-flex items-center gap-1.5 text-base font-medium text-ocean hover:underline"
                  >
                    Explore every module below ↓
                  </a>
                </CardContent>
                <InquiryTrigger
                  packageName={salonERP.name}
                  cta={salonERP.cta}
                  className="mt-6 text-base"
                />
              </Card>
            </GsapReveal>
          </div>
        </InquiryDialogProvider>
      </SalonContainer>
    </section>
  );
}
