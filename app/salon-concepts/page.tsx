import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { profile, siteUrl } from "@/lib/data";
import {
  getVerifiedSalonConcepts,
  salonTierScopes,
} from "@/lib/salon-concepts";
import { SalonConceptsGallery } from "@/components/salon-concepts-gallery";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";

const title = `Salon Website Design Concepts | ${profile.publicName}`;
const description =
  "Explore 11 verified salon and spa website design concepts across Starter, Standard, and Premium scopes, each with a live interactive demo.";
const url = `${siteUrl}/salon-concepts`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "JaniduDev",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function SalonConceptsPage() {
  const concepts = getVerifiedSalonConcepts();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Salon design concepts",
        item: url,
      },
    ],
  };

  return (
    <div className="pb-24 pt-24 sm:pt-32">
      <div className="container">
        <JsonLd data={breadcrumbJsonLd} />

        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              Salon design concepts
            </li>
          </ol>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="section-label">Salon collection &middot; Design concepts</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Salon &amp; spa website design concepts
          </h1>
          <p className="mt-4 text-body text-muted-foreground sm:text-body-lg">
            Browse {concepts.length} live salon concepts built around different
            customer habits, from instant service directories to guided
            first-time booking and editorial lookbooks. Pick any design below to
            open its live demo or preselect it in your project inquiry.
          </p>
        </header>

        <section className="mt-12" aria-label="Verified salon design concepts">
          <SalonConceptsGallery concepts={concepts} />
        </section>

        {/* Salon scope tiers summary matching #packages */}
        <section
          id="scopes"
          className="mt-20 border-t border-border pt-16"
          aria-labelledby="salon-scopes-heading"
        >
          <div className="max-w-2xl">
            <p className="section-label">Salon scopes</p>
            <h2
              id="salon-scopes-heading"
              className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              What Starter, Standard, and Premium salon builds include
            </h2>
            <p className="mt-3 text-body text-muted-foreground">
              Any visual style above can be paired with the feature level your
              salon needs. Exact pricing and timeline are confirmed in your
              written proposal.
            </p>
          </div>

          <div className="mt-10 divide-y divide-border rounded-lg border border-border bg-surface">
            {salonTierScopes.map((scope) => (
              <div
                key={scope.tier}
                className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[260px_1fr]"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    {scope.tag}
                  </span>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    {scope.tier}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scope.revisions}
                  </p>
                </div>

                <div>
                  <p className="text-body text-foreground/90">{scope.summary}</p>
                  <ul className="mt-4 grid gap-2.5 text-[15px] text-muted-foreground sm:grid-cols-2">
                    {scope.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check
                          className="mt-1 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-lg border border-border bg-surface p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Have a specific salon style in mind?
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                Click Enquire about this design on any concept above to
                preselect it, or send your treatment list and reference links
                for a custom proposal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/#contact">Start a project</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/#work">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to homepage
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
