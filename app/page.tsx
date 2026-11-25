import { Hero } from "@/components/hero";
import { LiveProjectShowcase } from "@/components/live-project-showcase";
import { Projects } from "@/components/projects";
import { SalonConceptsSection } from "@/components/salon-concepts-section";
import { ProcessSection } from "@/components/process-section";
import { ReviewsPreview } from "@/components/reviews-preview";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { JsonLd } from "@/components/json-ld";
import { profile, siteUrl } from "@/lib/data";
import {
  computeReviewSummary,
  getFeaturedReviews,
  getPublishedReviews,
} from "@/lib/reviews";

export const revalidate = 60;

const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Janidu Yapa — Web Design & Development",
  alternateName: "JaniduDev",
  url: `${siteUrl}/`,
  email: profile.email,
  telephone: profile.whatsapp,
  description:
    "Custom websites, service menus, and online booking systems for small businesses in the US, UK, Australia, Sri Lanka, and worldwide.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kandy",
    addressRegion: "Central Province",
    addressCountry: "LK",
  },
  areaServed: ["US", "GB", "AU", "LK"],
  founder: {
    "@type": "Person",
    name: profile.name,
    url: `${siteUrl}/`,
    sameAs: [profile.socials.linkedin],
  },
};

export default async function HomePage() {
  const allReviews = await getPublishedReviews();
  const featuredReviews = await getFeaturedReviews(3);
  const reviewSummary = computeReviewSummary(allReviews);

  return (
    <>
      <JsonLd data={professionalServiceJsonLd} />
      <Hero />
      <LiveProjectShowcase />
      <Projects />
      <SalonConceptsSection />
      <ProcessSection />
      <ReviewsPreview reviews={featuredReviews} summary={reviewSummary} />
      <About />
      <Contact />
    </>
  );
}
