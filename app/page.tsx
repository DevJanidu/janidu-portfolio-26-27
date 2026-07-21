import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { LinkedInHighlight } from "@/components/linkedin-highlight";
import { Venture } from "@/components/venture";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { OpenSource } from "@/components/open-source";
import { Experience } from "@/components/experience";
import { Writing } from "@/components/writing";
import { Contact } from "@/components/contact";
import { JsonLd } from "@/components/json-ld";
import { profile, siteUrl } from "@/lib/data";

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: `${siteUrl}/`,
  mainEntity: {
    "@type": "Person",
    name: profile.name,
    alternateName: [profile.publicName, "JaniduDev"],
    url: `${siteUrl}/`,
    jobTitle: "Software Engineer and Full-Stack Developer",
    description:
      "Software engineer in Kandy, Sri Lanka specializing in ERP systems, POS software, AI-powered web applications, booking systems, and business automation.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kandy",
      addressRegion: "Central Province",
      addressCountry: "LK",
    },
    knowsAbout: [
      "Software Engineering",
      "Full-Stack Development",
      "ERP Systems",
      "POS Software",
      "Business Automation",
      "Artificial Intelligence",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "AI Agents",
      "Next.js",
      "React",
      "TypeScript",
      "Java",
      "Spring Boot",
      "ASP.NET Core",
      "Laravel",
      "PostgreSQL",
      "MySQL",
      "Docker",
    ],
    sameAs: [profile.socials.linkedin, profile.socials.github],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={profilePageJsonLd} />
      <Hero />
      <About />
      <LinkedInHighlight />
      <Venture />
      <Skills />
      <Projects />
      <OpenSource />
      <Experience />
      <Writing />
      <Contact />
    </>
  );
}
