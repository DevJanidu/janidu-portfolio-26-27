import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  costExpectations,
  getVerifiedPaymentNotes,
  paymentConfig,
  processSteps,
} from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

export function ProcessSection() {
  const paymentNotes = getVerifiedPaymentNotes();

  return (
    <section id="process" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          label="Process & payments"
          title="How a project runs from proposal to launch"
          description="Clear milestones, a private preview link to test everything on your phone and computer, and fixed pricing agreed before work begins."
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
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

          {/* Scope, pricing clarity, and payment confirmation notice */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {costExpectations.heading}
            </h3>
            <p className="mt-2.5 text-[16px] leading-relaxed text-muted-foreground">
              {costExpectations.summary}
            </p>

            <dl className="mt-6 space-y-5 border-t border-border pt-5">
              {costExpectations.tiers.map((tier) => (
                <div key={tier.name}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-base font-semibold text-foreground">
                      {tier.name}
                    </dt>
                    <span className="text-xs font-medium text-muted-foreground">
                      Typical timeline: {tier.timeline}
                    </span>
                  </div>
                  <dd className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                    {tier.summary}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {costExpectations.ownershipNote}{" "}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Compare package details
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
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
          </div>
        </div>
      </div>
    </section>
  );
}
