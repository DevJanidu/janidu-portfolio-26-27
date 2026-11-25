import Link from "next/link";
import type { Metadata } from "next";
import { Check, ChevronRight } from "lucide-react";
import {
  getVerifiedPaymentNotes,
  paymentConfig,
  profile,
  siteUrl,
} from "@/lib/data";
import { JsonLd } from "@/components/json-ld";
import {
  InquiryDialogProvider,
  InquiryTrigger,
} from "@/components/pricing/inquiry-dialog";

const title = `Packages & Scope Guide | ${profile.publicName}`;
const description =
  "Compare Brochure & Service Menu websites, Online Booking & Admin Dashboard builds, and Multi-Branch Business Systems.";
const url = `${siteUrl}/pricing`;

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

const packages = [
  {
    name: "Web Lite",
    label: "Service menu & brochure website",
    timeline: "1 to 3 weeks",
    description:
      "For salons, spas, and local service firms that need a clear, mobile-friendly website presenting their services, prices, hours, location, and contact options.",
    featured: false,
    features: [
      "Custom mobile-first website tailored to your brand",
      "Services and pricing showcase",
      "Team or staff profiles and photo gallery",
      "Opening hours, address, and Google Maps",
      "Direct inquiry form, click-to-call, and WhatsApp button",
      "Foundational search engine optimization and speed tuning",
      "SSL setup, domain connection, and launch handover",
    ],
    note: "Does not include online appointment scheduling or an admin dashboard.",
    cta: "Request a Web Lite quote",
  },
  {
    name: "Web Pro",
    label: "Website + online booking & dashboard",
    timeline: "3 to 6 weeks",
    description:
      "For appointment-based businesses and professional practices that want clients to book services or consultations online while staff manage availability and inquiries in a dashboard.",
    featured: true,
    features: [
      "Everything included in Web Lite",
      "Custom online booking or consultation intake workflow",
      "Service, package, specialist, date, and time selection",
      "Automated email confirmations for clients and staff",
      "Secure dashboard for bookings, inquiries, and customer records",
      "Self-serve editing for services, prices, staff schedules, and hours",
      "Calendar overview and appointment status controls",
    ],
    note: "Adapted to your exact booking rules, service durations, and team structure.",
    cta: "Request a Web Pro quote",
  },
  {
    name: "Cloud ERP",
    label: "Operations & multi-branch system",
    timeline: "Scoped after workflow review",
    description:
      "For established salons and growing businesses that want appointments, digital billing, inventory, staff attendance, commissions, and reporting in one cloud system.",
    featured: false,
    features: [
      "Point-of-sale checkout and paperless digital invoices",
      "Customer history, loyalty points, and memberships",
      "Product stock levels, low-stock alerts, and purchase orders",
      "Staff schedules, attendance, leave, and commission tracking",
      "Expense recording and daily/monthly revenue reports",
      "Role-based staff logins and multi-branch support",
    ],
    note: "Modules are selected around your daily operations so you only pay for what your team uses.",
    cta: "Discuss an ERP project",
  },
];

export default function PricingPage() {
  const paymentNotes = getVerifiedPaymentNotes();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Packages", item: url },
    ],
  };

  return (
    <div className="pb-24 pt-24 sm:pt-32">
      <div className="container max-w-5xl">
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
              Packages
            </li>
          </ol>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="section-label">Scope &amp; pricing guide</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Compare website and booking scopes
          </h1>
          <p className="mt-4 text-body text-muted-foreground sm:text-body-lg">
            Every project receives a fixed written proposal with exact deliverables,
            price, and timeline before you commit. Pay 50% to begin and 50%
            after you approve the private preview before launch.
          </p>
        </header>

        <InquiryDialogProvider>
          <div className="mt-12 space-y-6">
            {packages.map((pkg) => (
              <section
                key={pkg.name}
                className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        {pkg.label}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {pkg.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Typical timeline: {pkg.timeline}
                      </p>
                      <p className="mt-3 text-body text-foreground/90">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <InquiryTrigger
                        packageName={pkg.name}
                        cta={pkg.cta}
                        featured={pkg.featured}
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <ul className="space-y-2.5 text-[15px] text-foreground/90">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check
                            className="mt-1 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 rounded-md bg-background p-3.5 text-sm text-muted-foreground">
                      {pkg.note}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </InquiryDialogProvider>

        <section className="mt-12 rounded-lg border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            {paymentConfig.headline}
          </h2>
          {paymentNotes.map((note) => (
            <p key={note} className="mt-1.5 text-[15px] text-muted-foreground">
              {note}
            </p>
          ))}
          <p className="mt-3 text-sm text-muted-foreground">
            Domain registration, hosting, and any third-party SMS, WhatsApp API,
            or payment gateway charges stay in your own accounts or are itemized
            separately when required.
          </p>
        </section>
      </div>
    </div>
  );
}
