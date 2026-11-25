"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Play } from "lucide-react";
import {
  featuredProjects,
  getExternalProjectLabel,
  type Project,
} from "@/lib/data";
import { LIVE_PREVIEW_SELECT_EVENT } from "@/components/live-project-showcase";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

function openInLiveScreen(slug: string) {
  window.dispatchEvent(
    new CustomEvent(LIVE_PREVIEW_SELECT_EVENT, { detail: { slug } })
  );
}

function WideProjectFeature({ project }: { project: Project }) {
  const externalLabel = getExternalProjectLabel(project.externalLinkType);

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="grid lg:grid-cols-[1.26fr_0.74fr]">
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`View ${project.title} project details`}
          className="group relative block aspect-[16/9] overflow-hidden border-b border-border bg-neutral-900 lg:aspect-auto lg:min-h-[380px] lg:border-b-0 lg:border-r"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 h-28 w-28 overflow-hidden"
          >
            <span className="absolute -left-11 top-5 block w-40 -rotate-45 border-y border-black/15 bg-[#CCFF00] py-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-black shadow-sm">
              Recent Project
            </span>
          </div>
          <Image
            src={project.cardImage}
            alt={project.cardImageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 720px"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]"
          />
        </Link>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {project.category}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              <Link
                href={`/projects/${project.slug}`}
                className="transition-colors hover:text-primary"
              >
                {project.title}
              </Link>
            </h3>

            <p className="mt-3 text-body text-foreground/90">
              {project.cardLead}
            </p>

            <ul className="mt-5 space-y-2 text-[15px] text-muted-foreground">
              {project.cardCapabilities.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    className="mt-1 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            {project.supportsLiveEmbed ? (
              <Button
                type="button"
                size="sm"
                onClick={() => openInLiveScreen(project.slug)}
              >
                <Play className="size-3.5" aria-hidden="true" />
                Try live here
              </Button>
            ) : null}
            <Button asChild size="sm" variant="outline">
              <Link href={`/projects/${project.slug}`}>
                View project
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {externalLabel}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryProjectPreview({ project }: { project: Project }) {
  const externalLabel = getExternalProjectLabel(project.externalLinkType);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`View ${project.title} project details`}
        className="group relative block aspect-[16/9] overflow-hidden border-b border-border bg-neutral-900"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 h-28 w-28 overflow-hidden"
        >
          <span className="absolute -left-11 top-5 block w-40 -rotate-45 border-y border-black/15 bg-[#CCFF00] py-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-black shadow-sm">
            Recent Project
          </span>
        </div>
        <Image
          src={project.cardImage}
          alt={project.cardImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            {project.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            <Link
              href={`/projects/${project.slug}`}
              className="transition-colors hover:text-primary"
            >
              {project.title}
            </Link>
          </h3>

          <p className="mt-3 text-body text-muted-foreground">
            {project.cardLead}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-[15px]">
          {project.supportsLiveEmbed ? (
            <button
              type="button"
              onClick={() => openInLiveScreen(project.slug)}
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <Play className="size-3.5" aria-hidden="true" />
              Try live here
            </button>
          ) : null}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
          >
            View project
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={project.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {externalLabel}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const [leadProject, ...secondaryProjects] = featuredProjects;

  return (
    <section id="work" className="scroll-mt-20 py-20 sm:py-28">
      <span id="projects" className="scroll-mt-24" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          label="Featured work · Premium builds"
          title="Recent builds for salons, spas, and service firms"
          description="Real layouts built around how customers check prices, pick a time or specialist, and get in touch."
        />

        <div className="mt-12 space-y-8">
          {leadProject ? <WideProjectFeature project={leadProject} /> : null}

          {secondaryProjects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {secondaryProjects.map((project) => (
                <SecondaryProjectPreview key={project.slug} project={project} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
