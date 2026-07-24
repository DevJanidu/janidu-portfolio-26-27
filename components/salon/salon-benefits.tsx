import { Sparkles } from "lucide-react";
import { mainBenefits, salonFinalCTA } from "@/lib/salon-data";
import { SectionHeading } from "@/components/section-heading";
import { GsapStagger, GsapReveal } from "@/components/salon/gsap-reveal";
import { SalonContainer } from "@/components/salon/salon-container";
import { Card, CardContent } from "@/components/ui/card";
import {
  InquiryDialogProvider,
  InquiryTrigger,
} from "@/components/pricing/inquiry-dialog";

export function SalonBenefits() {
  return (
    <>
      <section className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-28">
        <SalonContainer>
          <SectionHeading
            command="cat benefits.md"
            title="Main Benefits"
            description="Why salons move their operations onto one cloud system."
          />

          <GsapStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mainBenefits.map((benefit) => (
              <Card key={benefit} className="h-full">
                <CardContent className="flex items-start gap-3 p-5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-ocean" />
                  <span className="text-base text-foreground">{benefit}</span>
                </CardContent>
              </Card>
            ))}
          </GsapStagger>
        </SalonContainer>
      </section>

      <section className="scroll-mt-20 py-20 sm:py-28">
        <SalonContainer>
          {/* InquiryDialogProvider must stay outside GsapReveal — GSAP leaves
              a transform on the animated element, which creates a CSS
              containing block that breaks the modal's position:fixed. */}
          <InquiryDialogProvider>
            <GsapReveal>
              <Card className="border-ocean/20 bg-accent/40">
                <CardContent className="flex flex-col items-start gap-6 p-8 sm:p-10">
                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                      {salonFinalCTA.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-lg text-muted-foreground">
                      {salonFinalCTA.description}
                    </p>
                  </div>
                  <InquiryTrigger
                    packageName="Salon ERP"
                    cta="Book a Free Consultation"
                    className="w-auto px-8 text-base"
                  />
                </CardContent>
              </Card>
            </GsapReveal>
          </InquiryDialogProvider>
        </SalonContainer>
      </section>
    </>
  );
}
