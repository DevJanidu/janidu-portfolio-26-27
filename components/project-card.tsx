import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github, Star } from "lucide-react";
import type { Project } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-ocean/40 hover:shadow-elevated active:-translate-y-1 active:border-ocean/40 active:shadow-elevated">
      {/* Preview area */}
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-[16/10] overflow-hidden border-b border-border bg-muted"
        aria-label={`Open ${project.title} case study`}
      >
        {project.images && project.images.length > 0 ? (
          <Image
            src={project.images[0]}
            alt={`${project.title} preview`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-dotgrid opacity-40" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <span className="font-display text-2xl font-bold text-navy/90">
                {project.title}
              </span>
              <code className="mt-2 w-fit rounded bg-white/80 px-2 py-1 font-mono text-[11px] text-ocean">
                {project.accentTerminal}
              </code>
            </div>
          </>
        )}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-transparent pointer-events-none",
            "transition-opacity duration-300 group-hover:opacity-80 group-active:opacity-80"
          )}
        />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-navy">
            <Link
              href={`/projects/${project.slug}`}
              className="transition-colors hover:text-ocean active:text-ocean"
            >
              {project.title}
            </Link>
          </h3>
          {typeof project.stars === "number" && (
            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
              <Star className="size-3.5 fill-sky/50 text-ocean/60" />
              {project.stars}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{project.tagline}</p>

        <p className="mt-3 text-sm text-muted-foreground">
          <span className="text-ocean">→ </span>
          {project.outcome}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 5).map((t) => (
            <li key={t}>
              <Badge variant="outline">{t}</Badge>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-ocean hover:underline"
          >
            Case study <ArrowUpRight className="size-4" />
          </Link>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground active:text-foreground"
          >
            <Github className="size-4" /> Code
          </a>
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground active:text-foreground"
          >
            <ArrowUpRight className="size-4" /> Live demo
          </a>
        </div>
      </div>
    </Card>
  );
}
