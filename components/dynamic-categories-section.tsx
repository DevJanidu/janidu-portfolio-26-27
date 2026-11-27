import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { PublicCategory, PublicService } from "@/lib/cms/queries";

interface DynamicCategoriesSectionProps {
  categories: PublicCategory[];
  services: PublicService[];
  showServicesSection: boolean;
  customSections: Array<{
    id: string;
    templateType: string;
    title: string;
    contentJson: Record<string, unknown>;
  }>;
}

const DEFAULT_CORE_SLUGS = new Set(["featured-websites", "salon-concepts"]);

export function DynamicCategoriesSection({
  categories,
  services,
  showServicesSection,
  customSections,
}: DynamicCategoriesSectionProps) {
  // Show newly created industry categories (e.g. Restaurants, Hotels, Cleaning Companies)
  const extraCategories = categories.filter((c) => !DEFAULT_CORE_SLUGS.has(c.slug));

  const extraCustomSections = customSections.filter(
    (s) =>
      ![
        "hero",
        "process",
        "about",
        "contact",
        "live_showcase",
        "featured_projects",
        "reviews",
        "announcement",
      ].includes(s.templateType)
  );

  return (
    <>
      {extraCategories.length > 0 && (
        <section className="py-20 bg-[#FAF9F6] border-t border-border/60">
          <div className="container max-w-6xl">
            <div className="max-w-2xl mb-10">
              <p className="section-label">More Industries</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                Explore Websites by Industry
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                Browse additional website categories and live demos built for local businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {extraCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group rounded-2xl border border-border bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-foreground/20 transition-all flex flex-col"
                >
                  {cat.coverUrl && (
                    <div className="aspect-[16/9] bg-neutral-100 overflow-hidden">
                      <img
                        src={cat.coverUrl}
                        alt={cat.name}
                        className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        {cat.name}
                      </span>
                      <h3 className="mt-1.5 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cat.sectionTitle}
                      </h3>
                      {cat.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-foreground pt-2 border-t border-border/50">
                      <span>
                        {cat.projectCount}{" "}
                        {cat.projectCount === 1 ? "project" : "projects"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-primary">
                        Explore
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {showServicesSection && services.length > 0 && (
        <section id="services" className="py-20 bg-white border-t border-border/60">
          <div className="container max-w-6xl">
            <div className="max-w-2xl mb-10">
              <p className="section-label">Services</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                How I Can Help Your Business
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="rounded-2xl border border-border bg-[#FAF9F6] p-6 flex flex-col justify-between gap-5"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{svc.name}</h3>
                    {svc.startingPrice && (
                      <p className="mt-1 text-sm font-semibold text-primary">
                        From {svc.currency} {svc.startingPrice}
                      </p>
                    )}
                    {svc.deliveryEstimate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estimated delivery: {svc.deliveryEstimate}
                      </p>
                    )}
                    {svc.description && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {svc.description}
                      </p>
                    )}
                    {svc.features.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                        {svc.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Link
                    href={svc.ctaHref || "/#contact"}
                    className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
                  >
                    {svc.ctaLabel || "Start a project"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {extraCustomSections.map((sec) => {
        const heading = String(sec.contentJson?.heading || sec.title || "");
        const body = String(sec.contentJson?.body || "");
        const ctaLabel = String(sec.contentJson?.ctaLabel || "");
        const ctaHref = String(sec.contentJson?.ctaHref || "/#contact");

        return (
          <section key={sec.id} className="py-16 bg-[#FAF9F6] border-t border-border/60">
            <div className="container max-w-4xl text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {heading}
              </h2>
              {body && (
                <p className="mt-3 text-body text-muted-foreground max-w-2xl mx-auto">
                  {body}
                </p>
              )}
              {ctaLabel && (
                <Link
                  href={ctaHref}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
