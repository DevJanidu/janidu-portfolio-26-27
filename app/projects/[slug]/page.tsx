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
import { getPublicProjectBySlug } from "@/lib/cms/queries";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 60;

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
  const staticProject = projects.find((p) => p.slug === slug);
  if (staticProject) {
    const title = `${staticProject.title} | Case Study by ${profile.publicName}`;
    const url = `${siteUrl}/projects/${staticProject.slug}`;

    return {
      title: { absolute: title },
      description: staticProject.tagline,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title,
        description: staticProject.tagline,
        siteName: "JaniduDev",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: staticProject.tagline,
      },
    };
  }

  const cmsProject = await getPublicProjectBySlug(slug);
  if (!cmsProject) return { title: "Project not found" };

  return {
    title: cmsProject.seoTitle || `${cmsProject.title} | ${profile.publicName}`,
    description: cmsProject.seoDescription || cmsProject.shortDescription,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    const cms = await getPublicProjectBySlug(slug);
    if (!cms) notFound();

    const externalUrl = cms.liveUrl || cms.demoUrl;
    const badge =
      cms.classification === "client_work"
        ? "Client Project"
        : cms.classification === "demo"
          ? "Demo Website"
          : cms.classification === "design_concept"
            ? "Design Concept"
            : "Personal Project";

    return (
      <article className="pb-24 pt-24 sm:pt-32">
        <div className="container max-w-4xl">
          <Link
            href={cms.categorySlug ? `/categories/${cms.categorySlug}` : "/#work"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="size-4" />
            {cms.categoryName ? `Back to ${cms.categoryName}` : "Back to Portfolio"}
          </Link>

          <header>
            <p className="section-label">
              {cms.projectType || cms.categoryName || badge} · {badge}
            </p>
            <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {cms.title}
            </h1>
            {cms.shortDescription && (
              <p className="mt-4 max-w-3xl text-body text-muted-foreground sm:text-body-lg">
                {cms.shortDescription}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {externalUrl && (
                <Button asChild size="lg">
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    {cms.liveUrl ? "Visit Live Website" : "Open Live Demo"}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {cms.customLinks.map((lnk, i) => (
                <Button key={i} asChild size="lg" variant="outline">
                  <a href={lnk.url} target="_blank" rel="noopener noreferrer">
                    {lnk.label}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </Button>
              ))}
              <Button asChild size="lg" variant="outline">
                <Link href="/#contact">Start a similar project</Link>
              </Button>
            </div>
          </header>

          {cms.coverUrl && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-neutral-900">
              <img
                src={cms.coverUrl}
                alt={cms.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {(cms.fullDescription || cms.whatIBuilt.length > 0) && (
            <div className="mt-14 grid gap-10 border-y border-border py-12 md:grid-cols-2">
              {cms.fullDescription && (
                <section>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    About this project
                  </h2>
                  <p className="mt-3 text-body text-muted-foreground whitespace-pre-line">
                    {cms.fullDescription}
                  </p>
                </section>
              )}
              {cms.whatIBuilt.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    What I built
                  </h2>
                  <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-foreground/90">
                    {cms.whatIBuilt.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="mt-1 size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {cms.gallery.length > 0 && (
            <section className="mt-14 space-y-8">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Project Screenshots
              </h2>
              {cms.gallery.map((g) => (
                <figure key={g.id} className="space-y-2">
                  <div className="overflow-hidden rounded-xl border border-border bg-neutral-100">
                    <img src={g.url} alt={g.altText} className="w-full h-auto object-cover" />
                  </div>
                  {(g.title || g.caption) && (
                    <figcaption className="text-sm text-muted-foreground">
                      {g.title && <strong className="text-foreground">{g.title}: </strong>}
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </section>
          )}
        </div>
      </article>
    );
  }

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
