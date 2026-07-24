import type { Metadata } from "next";
import { Check } from "lucide-react";
import { profile, siteUrl } from "@/lib/data";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { Card } from "@/components/ui/card";
import { InquiryDialogProvider, InquiryTrigger } from "@/components/pricing/inquiry-dialog";
import { cn } from "@/lib/utils";

const title = "Pricing | Website & Cloud ERP Packages";
const description =
  "Web Lite, Web Pro, and Cloud ERP — professional website and cloud management packages for businesses in any industry.";
const url = `${siteUrl}/pricing`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: url,
  },
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
    label: "Professional Website",
    description:
      "Perfect for businesses that need a clean and professional website to showcase their services and receive customer inquiries.",
    featured: false,
    features: [
      "Modern professional website",
      "Mobile-friendly responsive design",
      "Business and service information",
      "Services or product showcase",
      "Team or staff profiles",
      "Portfolio or image gallery",
      "Contact and inquiry form",
      "WhatsApp contact button",
      "Google Maps integration",
      "Basic SEO and speed optimization",
      "SSL, domain connection and deployment",
      "Free lifetime bug fixes",
    ],
    note: "Admin dashboard and online booking are not included.",
    cta: "Get My Website",
  },
  {
    name: "Web Pro",
    label: "Most Popular",
    description:
      "The complete solution for businesses that need a professional website, online customer actions, email confirmations, and a management dashboard.",
    featured: true,
    features: [
      "Everything included in Web Lite",
      "Online booking, registration or inquiry system",
      "Service, package, staff, date and time selection",
      "Customer information collection",
      "Automated email notifications",
      "Customer confirmation emails",
      "Secure business management dashboard",
      "Booking and inquiry management",
      "Customer database",
      "Services and pricing management",
      "Staff or team management",
      "Website content management",
      "Booking calendar and basic reports",
      "Free lifetime bug fixes",
    ],
    note: "Customized to match your business and customer workflow.",
    cta: "Request a Free Demo",
  },
  {
    name: "Cloud ERP",
    label: "Complete Management System",
    description:
      "A customizable cloud-based system designed to manage your complete daily business operations from one place.",
    featured: false,
    features: [
      "Business performance dashboard",
      "Customer and client management",
      "Bookings, orders or workflow management",
      "Sales, billing and digital invoices",
      "Products and inventory management",
      "Purchase orders and suppliers",
      "Services, packages and pricing",
      "Staff management",
      "Attendance and leave management",
      "Payroll and commission management",
      "Expense and profit tracking",
      "Reports and business analytics",
      "Users, roles and permissions",
      "Multi-branch support",
      "Custom modules for your business",
      "Free lifetime bug fixes",
    ],
    note: "Works on computers, tablets and phones without special hardware.",
    cta: "Book a Free Consultation",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: url,
    },
  ],
};

const offerCatalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Website and Cloud ERP Packages",
  url,
  provider: {
    "@type": "Person",
    name: profile.name,
    url: `${siteUrl}/`,
  },
  itemListElement: packages.map((item) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: item.name,
      description: item.description,
    },
  })),
};

export default function PricingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={offerCatalogJsonLd} />

      <section className="relative overflow-hidden bg-dotgrid pb-20 pt-28 sm:pb-28 sm:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-sky/40 blur-[120px]"
        />
        <div className="container relative">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Reveal>
              <h1 className="font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
                Choose the right solution for your business
              </h1>
            </Reveal>

            <Reveal i={1}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Get a professional website or complete cloud management
                system customized for your industry.
              </p>
            </Reveal>
          </div>

          <InquiryDialogProvider>
            <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {packages.map((item, i) => (
              <Reveal key={item.name} i={i}>
                <Card
                  className={cn(
                    "relative flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8",
                    item.featured
                      ? "border-navy bg-navy text-white shadow-elevated lg:-translate-y-6 lg:hover:-translate-y-7"
                      : "shadow-card"
                  )}
                >
                  <p
                    className={cn(
                      "font-mono text-xs font-bold uppercase tracking-widest",
                      item.featured ? "text-sky" : "text-ocean"
                    )}
                  >
                    {item.label}
                  </p>

                  <h2 className="mt-3 font-display text-3xl font-bold">
                    {item.name}
                  </h2>

                  <p
                    className={cn(
                      "mt-4 text-sm leading-6",
                      item.featured ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {item.description}
                  </p>

                  <div
                    className={cn(
                      "my-7 h-px",
                      item.featured ? "bg-white/15" : "bg-border"
                    )}
                  />

                  <ul className="flex-1 space-y-3">
                    {item.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-5"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                            item.featured
                              ? "bg-white text-navy"
                              : "bg-ocean text-white"
                          )}
                        >
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <p
                    className={cn(
                      "mt-7 rounded-lg p-4 text-xs leading-5",
                      item.featured
                        ? "bg-white/10 text-white/80"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.note}
                  </p>

                  <InquiryTrigger
                    packageName={item.name}
                    cta={item.cta}
                    featured={item.featured}
                    className="mt-6"
                  />
                </Card>
              </Reveal>
            ))}
          </div>
          </InquiryDialogProvider>

          <Reveal i={3}>
            <div className="mx-auto mt-12 max-w-3xl text-center">
              <p className="text-sm leading-6 text-muted-foreground">
                Packages can be customized for salons, gyms, clinics,
                restaurants, hotels, educational institutes, construction
                companies, professional services, retail businesses, and
                other industries.
              </p>

              <p className="mt-3 text-xs leading-5 text-muted-foreground/70">
                Domain, hosting, premium integrations, SMS, WhatsApp API,
                payment gateway, and third-party usage fees are charged
                separately when required.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
