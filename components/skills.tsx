import { skillGroups } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { TechStackScroll } from "@/components/tech-stack-scroll";

export function Skills() {
  return (
    <section
      id="skills"
      className="scroll-mt-20 border-y border-border bg-ink/40 py-20 sm:py-28"
    >
      <div className="container">
        <SectionHeading
          command="ls ~/skills"
          title="Tools I reach for"
          description="Grouped by where they live in the stack — from the database up to the deploy."
        />

        <Reveal i={1}>
          <TechStackScroll />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.category} i={gi}>
              <Card className="h-full transition-colors hover:border-ember/30">
                <CardContent className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-mono text-sm text-ember">
                    <span className="text-sand/50">#</span>
                    {group.category}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-sm text-sand transition-colors hover:border-ember/40 hover:text-foreground active:border-ember/40 active:text-foreground"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
