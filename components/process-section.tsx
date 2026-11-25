import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getVerifiedPaymentNotes,
  paymentConfig,
  processSteps,
} from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export function ProcessSection() {
  const paymentNotes = getVerifiedPaymentNotes();

  return (
    <section id="process" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          label="Process & payments"
          title="How a project runs from proposal to launch"
          description="Clear milestones, a private preview link to test everything on your phone and computer, and a written proposal agreed before work begins."
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* Four plain-English steps */}
          <ol className="divide-y divide-border border-y border-border">
            {processSteps.map((step) => (
              <li
                key={step.number}
                className="grid gap-3 py-7 sm:grid-cols-[56px_1fr] sm:gap-5"
              >
                <span className="text-sm font-semibold tracking-wide text-primary">
                  Step {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-body text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Custom proposal & payment terms (no fixed packages or tiers) */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Custom proposals tailored to your business
            </h3>
            <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
              Every website is scoped individually around what your customers
              need to do online, whether that is browsing your service menu,
              booking an appointment, or sending an inquiry.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              You receive a clear written proposal covering the exact pages,
              features, timeline, and total before any deposit is due. Domain
              registration and hosting stay in your own accounts.
            </p>

            <div className="mt-6 rounded-md border border-border bg-background p-4 sm:p-5">
              <p className="text-base font-semibold text-foreground">
                {paymentConfig.headline}
              </p>
              {paymentNotes.map((note) => (
                <p
                  key={note}
                  className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                >
                  {note}
                </p>
              ))}
            </div>

            <div className="mt-6">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/#contact">
                  Request a written proposal
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
