import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Github,
  Layers,
  Lightbulb,
  Mail,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { profile, projects, siteUrl } from "@/lib/data";
import { ImageCarousel } from "@/components/image-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";

type Params = { slug: string };

// Pre-render every case study at build time.
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

  const title = `${project.title} | Software Project by Janidu Yapa`;
  const url = `${siteUrl}/projects/${project.slug}`;

  return {
    // The title above is already the complete, final string — use
    // `absolute` so the root layout's "%s | Janidu Yapa" template doesn't
    // get appended a second time.
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

function Block({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24">
      <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-ocean">
        <Icon className="size-4" />
        {label}
      </h2>
      <div className="mt-4 text-muted-foreground">{children}</div>
    </section>
  );
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
  const relatedProjects = projects.filter((p) => p.slug !== project.slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${siteUrl}/#projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: url,
      },
    ],
  };

  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.tagline,
    url: project.demo,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    ...(project.images && project.images.length > 0
      ? { image: `${siteUrl}${project.images[0]}` }
      : {}),
    author: {
      "@type": "Person",
      name: profile.name,
      url: `${siteUrl}/`,
    },
  };

  return (
    <article className="pt-28 pb-24">
      <div className="container max-w-3xl">
        <JsonLd data={breadcrumbJsonLd} />
        <JsonLd data={softwareAppJsonLd} />

        {/* Breadcrumb — visible trail matches the BreadcrumbList schema above */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-ocean">
                Home
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link
                href="/#projects"
                className="transition-colors hover:text-ocean"
              >
                Projects
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li aria-current="page" className="text-foreground">
              {project.title}
            </li>
          </ol>
        </nav>

        <Link
          href="/#projects"
          className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-ocean"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>

        {/* Header */}
        <header className="mt-8">
          <span className="eyebrow">
            <span className="text-muted-foreground/60">$</span> open {project.slug}
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {project.description}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Designed and developed by{" "}
            <Link href="/" className="text-ocean hover:underline">
              {profile.publicName}
            </Link>
            .
          </p>

          <ul className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <li key={t}>
                <Badge variant="accent">{t}</Badge>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                Live demo <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="size-4" /> Repository
              </a>
            </Button>
          </div>
        </header>

        {/* Screenshots / Images */}
        {project.images && project.images.length > 0 ? (
          <ImageCarousel images={project.images} title={project.title} />
        ) : (
          <div className="mt-10 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted bg-dotgrid">
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Layers className="size-8 text-ocean/70" />
              <p className="font-mono text-xs text-muted-foreground">
                Drop a screenshot or architecture diagram here
              </p>
              <p className="max-w-xs text-[11px] text-muted-foreground/70">
                Use next/image for automatic optimization — see the README.
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="mt-12 space-y-12">
          <Block icon={Target} label="Problem">
            <p>{cs.problem}</p>
          </Block>

          <Block icon={Lightbulb} label="User context">
            <p>{cs.context}</p>
          </Block>

          <Block icon={Wrench} label="Constraints & tradeoffs">
            <ul className="space-y-2">
              {cs.constraints.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-1 text-ocean">▹</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={Layers} label="Architecture">
            <Card>
              <CardContent className="p-5">
                <ul className="space-y-2 font-mono text-sm">
                  {cs.architecture.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-ocean">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Block>

          <Block icon={Wrench} label="Highlights">
            <ul className="space-y-2">
              {cs.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-1 text-ocean">▹</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={TrendingUp} label="Results & lessons">
            <ul className="space-y-2">
              {cs.results.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1 text-emerald-600">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        {/* Related projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-16 border-t border-border pt-8">
            <h2 className="font-display text-lg font-semibold text-navy">
              More projects
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedProjects.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group block rounded-md border border-border bg-card p-4 transition-colors hover:border-ocean/40"
                  >
                    <span className="font-display text-sm font-semibold text-navy group-hover:text-ocean">
                      {p.title}
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.tagline}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer nav + contact CTA */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
          <Button asChild variant="ghost">
            <Link href="/#projects">
              <ArrowLeft className="size-4" /> All projects
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/#contact">
              <Mail className="size-4" /> Contact {profile.publicName}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
