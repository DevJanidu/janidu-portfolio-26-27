import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  Layers,
  Lightbulb,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { projects } from "@/lib/data";
import { ImageCarousel } from "@/components/image-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  return {
    title: `${project.title} — Case Study`,
    description: project.tagline,
    openGraph: {
      title: `${project.title} — Case Study`,
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
      <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-ember">
        <Icon className="size-4" />
        {label}
      </h2>
      <div className="mt-4 text-sand">{children}</div>
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

  return (
    <article className="pt-28 pb-24">
      <div className="container max-w-3xl">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-ember"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>

        {/* Header */}
        <header className="mt-8">
          <span className="eyebrow">
            <span className="text-sand/60">$</span> open {project.slug}
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {project.description}
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
          <div className="mt-10 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-ink bg-dotgrid">
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Layers className="size-8 text-ember/70" />
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
                  <span className="mt-1 text-ember">▹</span>
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
                      <span className="text-ember">→</span>
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
                  <span className="mt-1 text-ember">▹</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={TrendingUp} label="Results & lessons">
            <ul className="space-y-2">
              {cs.results.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1 text-ember">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        {/* Footer nav */}
        <div className="mt-16 border-t border-border pt-8">
          <Button asChild variant="ghost">
            <Link href="/#projects">
              <ArrowLeft className="size-4" /> All projects
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
