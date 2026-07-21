import { ArrowUpRight, GitBranch } from "lucide-react";
import { openSource } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { ContributionGraph } from "@/components/contribution-graph";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OpenSource() {
  return (
    <section
      id="open-source"
      className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-28"
    >
      <div className="container">
        <SectionHeading
          command="gh repo list"
          title="Open source & contributions"
        />

        <div className="mt-12 grid min-w-0 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="min-w-0">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Contribution activity
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    <span className="text-foreground">
                      {openSource.repoCount}
                    </span>{" "}
                    repos ·{" "}
                    <span className="text-foreground">
                      {openSource.contributionsLastYear}
                    </span>{" "}
                    contributions this year
                  </p>
                </div>
                {/* Live per-day cells with a staggered light-up animation. */}
                <ContributionGraph />
                <div className="mt-6">
                  <Button asChild variant="outline">
                    <a
                      href={openSource.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View GitHub profile <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={1} className="min-w-0">
            <Card className="h-full">
              <CardContent className="p-6">
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Notable work
                </p>
                <ul className="space-y-4">
                  {openSource.contributions.map((c) => (
                    <li key={c.repo} className="flex gap-3">
                      <GitBranch className="mt-0.5 size-4 shrink-0 text-ocean" />
                      <div className="min-w-0">
                        <span className="font-mono text-sm text-foreground">
                          {c.repo}
                        </span>
                        <p className="text-sm text-muted-foreground">{c.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
