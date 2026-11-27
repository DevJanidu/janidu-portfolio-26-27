import { Hero } from "@/components/hero";
import { LiveProjectShowcase } from "@/components/live-project-showcase";
import { Projects } from "@/components/projects";
import { SalonConceptsSection } from "@/components/salon-concepts-section";
import { DynamicCategoriesSection } from "@/components/dynamic-categories-section";
import { AnnouncementBanner } from "@/components/announcement-banner";
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
import {
  getPublicCategories,
  getPublicCustomSections,
  getPublicServices,
  getPublicSiteSettings,
} from "@/lib/cms/queries";

export const revalidate = 60;

const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Janidu Dev — Web Design & Development",
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
  const [
    allReviews,
    featuredReviews,
    categories,
    siteSettings,
    services,
    customSections,
  ] = await Promise.all([
    getPublishedReviews(),
    getFeaturedReviews(3),
    getPublicCategories(),
    getPublicSiteSettings(),
    getPublicServices(),
    getPublicCustomSections(),
  ]);
  const reviewSummary = computeReviewSummary(allReviews);

  const activeAnnouncementRow = customSections.find(
    (s) => s.templateType === "announcement"
  );
  const activeAnnouncement = activeAnnouncementRow
    ? {
        id: activeAnnouncementRow.id,
        heading: String(
          activeAnnouncementRow.contentJson?.heading ||
            activeAnnouncementRow.title ||
            ""
        ),
        body: String(activeAnnouncementRow.contentJson?.body || ""),
        ctaLabel: String(activeAnnouncementRow.contentJson?.ctaLabel || ""),
        ctaHref: String(
          activeAnnouncementRow.contentJson?.ctaHref || "/#contact"
        ),
        logoUrl: activeAnnouncementRow.contentJson?.logoUrl
          ? String(activeAnnouncementRow.contentJson.logoUrl)
          : undefined,
        badgeText: activeAnnouncementRow.contentJson?.badgeText
          ? String(activeAnnouncementRow.contentJson.badgeText)
          : undefined,
        socials: {
          whatsapp: activeAnnouncementRow.contentJson?.whatsappUrl
            ? String(activeAnnouncementRow.contentJson.whatsappUrl)
            : undefined,
          facebook: activeAnnouncementRow.contentJson?.facebookUrl
            ? String(activeAnnouncementRow.contentJson.facebookUrl)
            : undefined,
          instagram: activeAnnouncementRow.contentJson?.instagramUrl
            ? String(activeAnnouncementRow.contentJson.instagramUrl)
            : undefined,
          tiktok: activeAnnouncementRow.contentJson?.tiktokUrl
            ? String(activeAnnouncementRow.contentJson.tiktokUrl)
            : undefined,
        },
      }
    : null;

  return (
    <>
      <JsonLd data={professionalServiceJsonLd} />
      <AnnouncementBanner announcement={activeAnnouncement} />
      <Hero />
      <LiveProjectShowcase />
      <Projects />
      <SalonConceptsSection />
      <DynamicCategoriesSection
        categories={categories}
        services={services}
        showServicesSection={Boolean(siteSettings?.showServicesSection)}
        customSections={customSections}
      />
      <ProcessSection />
      <ReviewsPreview reviews={featuredReviews} summary={reviewSummary} />
      <About />
      <Contact />
    </>
  );
}
