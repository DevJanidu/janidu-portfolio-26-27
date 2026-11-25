import type { Metadata } from "next";
import { profile, siteUrl } from "@/lib/data";
import { JsonLd } from "@/components/json-ld";
import { SalonHero } from "@/components/salon/salon-hero";
import { SalonPackages } from "@/components/salon/salon-packages";
import { SalonModules } from "@/components/salon/salon-modules";
import { SalonBenefits } from "@/components/salon/salon-benefits";

const title = "Salon Website & Cloud ERP System | Salon Management Software";
const description =
  "A complete cloud-based salon management platform with online booking, digital billing, customer and staff management, inventory, loyalty, memberships, and reports, all from one system.";
const url = `${siteUrl}/salon-details`;

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

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Salon ERP", item: url },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Salon Website & Cloud ERP Management System",
  description,
  url,
  provider: {
    "@type": "Person",
    name: profile.name,
    url: `${siteUrl}/`,
  },
  areaServed: "LK",
  serviceType: "Salon management software",
};

export default function SalonPage() {
  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <SalonHero />
      <SalonPackages />
      <SalonModules />
      <SalonBenefits />
    </div>
  );
}
