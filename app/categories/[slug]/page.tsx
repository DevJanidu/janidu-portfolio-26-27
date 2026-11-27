import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { getPublicCategoryBySlug } from "@/lib/cms/queries";

export const revalidate = 60;

const CLASS_BADGE: Record<string, string> = {
  client_work: "Client Project",
  demo: "Interactive Demo",
  design_concept: "Design Concept",
  personal: "Personal Project",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCategoryBySlug(slug);
  if (!data) return { title: "Category Not Found" };

  return {
    title: data.category.seoTitle || data.category.sectionTitle,
    description:
      data.category.seoDescription ||
      data.category.description ||
      `Explore ${data.category.name} website designs and projects by JaniduDev.`,
  };
}

export default async function CategoryShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicCategoryBySlug(slug);
  if (!data) notFound();

  const { category, projects } = data;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>

        <div className="max-w-3xl mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-medium text-neutral-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {category.name}
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
            {category.sectionTitle}
          </h1>
          {category.sectionSubtitle && (
            <p className="mt-3 text-lg text-neutral-700 font-medium">
              {category.sectionSubtitle}
            </p>
          )}
          {category.description && (
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="text-base font-medium text-neutral-800">
              New {category.name.toLowerCase()} projects are coming soon.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Want a custom website for your {category.name.toLowerCase()} business?
            </p>
            <Link
              href="/#contact"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Start a Conversation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const externalLink = project.liveUrl || project.demoUrl;
              return (
                <article
                  key={project.id}
                  className="group rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                    {project.coverUrl ? (
                      <img
                        src={project.coverUrl}
                        alt={project.title}
                        className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs">
                        Preview coming soon
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-xs">
                      {CLASS_BADGE[project.classification] || "Project"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {project.title}
                      </h2>
                      {project.projectType && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {project.projectType}
                        </p>
                      )}
                      {project.shortDescription && (
                        <p className="mt-2.5 text-sm text-neutral-600 line-clamp-3">
                          {project.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="flex-1 text-center rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                      >
                        View Details
                      </Link>
                      {externalLink && (
                        <a
                          href={externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          Live
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
