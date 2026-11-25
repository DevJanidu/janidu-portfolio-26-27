import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  getExternalProjectLabel,
  profile,
  projects,
  siteUrl,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };

  const title = `${project.title} | Case Study by ${profile.publicName}`;
  const url = `${siteUrl}/projects/${project.slug}`;

  return {
    title: { absolute: title },
    description: project.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description: project.tagline,
      siteName: "JaniduDev",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.tagline,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const cs = project.caseStudy;
  const url = `${siteUrl}/projects/${project.slug}`;
  const externalLabel = getExternalProjectLabel(project.externalLinkType);
  const relatedProjects = projects.filter((p) => p.slug !== project.slug);
  const [heroScreen, ...additionalScreens] = project.screens;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Work",
        item: `${siteUrl}/#work`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: url,
      },
    ],
  };

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.tagline,
    url,
    ...(project.images.length > 0
      ? { image: `${siteUrl}${project.images[0]}` }
      : {}),
    author: {
      "@type": "Person",
      name: profile.name,
      url: `${siteUrl}/`,
    },
  };

  return (
    <article className="pb-24 pt-24 sm:pt-32">
      <div className="container max-w-4xl">
        <JsonLd data={breadcrumbJsonLd} />
        <JsonLd data={creativeWorkJsonLd} />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link
                href="/#work"
                className="transition-colors hover:text-foreground"
              >
                Work
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              {project.title}
            </li>
          </ol>
        </nav>

        {/* Project header */}
        <header className="mt-8">
          <p className="section-label">{project.category}</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-3xl text-body text-muted-foreground sm:text-body-lg">
            {project.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {externalLabel}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#contact">Start a similar project</Link>
            </Button>
          </div>
        </header>

        {/* Lead real screenshot */}
        {heroScreen ? (
          <figure className="mt-10">
            <div className="screenshot-frame bg-neutral-900">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={heroScreen.src}
                  alt={heroScreen.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
            </div>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">
                {heroScreen.title}:
              </strong>{" "}
              {heroScreen.caption}
            </figcaption>
          </figure>
        ) : null}

        {/* The brief & What I built */}
        <div className="mt-14 grid gap-10 border-y border-border py-12 md:grid-cols-[0.95fr_1.05fr]">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              The brief
            </h2>
            <p className="mt-3 text-body text-muted-foreground">{cs.brief}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              What I built
            </h2>
            <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-foreground/90">
              {cs.whatIBuilt.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    className="mt-1 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Key screens */}
        {additionalScreens.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Key screens
            </h2>
            <p className="mt-2 text-body text-muted-foreground">
              How visitors move from checking services and prices to booking or
              sending an inquiry.
            </p>

            <div className="mt-8 space-y-12">
              {additionalScreens.map((screen) => (
                <figure key={screen.src} className="content-auto">
                  <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
                    <div className="relative aspect-[16/9] w-full bg-neutral-900">
                      <Image
                        src={screen.src}
                        alt={screen.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 896px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <figcaption className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    <strong className="font-semibold text-foreground">
                      {screen.title}:
                    </strong>{" "}
                    {screen.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* Verified delivery details */}
        {cs.verifiedOutcomes.length > 0 ? (
          <section className="mt-14 rounded-lg border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Delivery &amp; live preview
            </h2>
            <ul className="mt-3 space-y-2 text-[16px] text-muted-foreground">
              {cs.verifiedOutcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5">
                  <Check
                    className="mt-1 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:underline"
              >
                {externalLabel}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        ) : null}

        {/* Related projects */}
        {relatedProjects.length > 0 ? (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="text-xl font-semibold text-foreground">
              Other featured projects
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {relatedProjects.map((other) => (
                <Link
                  key={other.slug}
                  href={`/projects/${other.slug}`}
                  className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {other.category}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold text-foreground group-hover:text-primary">
                      {other.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {other.tagline}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View project
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Bottom navigation & CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <Button asChild variant="ghost">
            <Link href="/#work">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to featured work
            </Link>
          </Button>
          <Button asChild>
            <Link href="/#contact">Start a project</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
