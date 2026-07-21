import { ArrowUpRight, Clock } from "lucide-react";
import { posts } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function Writing() {
  return (
    <section
      id="writing"
      className="scroll-mt-20 border-t border-border bg-muted py-20 sm:py-28"
    >
      <div className="container">
        <SectionHeading
          command="cat ~/writing/*.md"
          title="Notes & writing"
          description="Short posts on the decisions behind the projects."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.title} i={i}>
              <a href={post.url} className="group block h-full">
                <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-ocean/40 group-hover:shadow-elevated group-active:-translate-y-1 group-active:border-ocean/40">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-ocean group-active:text-ocean">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm text-ocean">
                      Read <ArrowUpRight className="size-4" />
                    </span>
                  </CardContent>
                </Card>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
