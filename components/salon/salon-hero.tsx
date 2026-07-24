import { ArrowRight } from "lucide-react";
import { salonHero } from "@/lib/salon-data";
import { GsapReveal } from "@/components/salon/gsap-reveal";
import { SalonContainer } from "@/components/salon/salon-container";
import { Button } from "@/components/ui/button";

export function SalonHero() {
  return (
    <section className="relative overflow-hidden bg-dotgrid pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-sky/40 blur-[120px]"
      />
      <SalonContainer className="relative max-w-4xl">
        <GsapReveal>
          <span className="eyebrow text-sm">
            <span className="text-muted-foreground/60">$</span> {salonHero.eyebrow}
          </span>
        </GsapReveal>

        <GsapReveal delay={0.08}>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-navy sm:text-6xl">
            {salonHero.title}
          </h1>
        </GsapReveal>

        <GsapReveal delay={0.16}>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {salonHero.intro}
          </p>
        </GsapReveal>

        <GsapReveal delay={0.22}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground/80">
            {salonHero.note}
          </p>
        </GsapReveal>

        <GsapReveal delay={0.3}>
          <div className="mt-7 rounded-lg border border-ocean/20 bg-accent/40 p-5">
            <p className="font-display text-lg font-semibold text-navy sm:text-xl">
              {salonHero.callout}
            </p>
          </div>
        </GsapReveal>

        <GsapReveal delay={0.36}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="text-base">
              <a href="#packages">
                See salon packages <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <a href="#modules">Explore the ERP</a>
            </Button>
          </div>
        </GsapReveal>
      </SalonContainer>
    </section>
  );
}
