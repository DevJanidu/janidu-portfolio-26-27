import { experience } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

/** Vertical timeline. Order carries meaning (most recent first). */
export function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="git log --graph"
          title="Where I've worked & learned"
        />

        <ol className="relative mt-12 border-l border-border pl-8 sm:pl-10">
          {experience.map((exp, i) => (
            <Reveal key={exp.company + exp.role} i={i} as="li" className="relative pb-12 last:pb-0">
              {/* Node */}
              <span
                aria-hidden="true"
                className="absolute -left-[41px] top-1 flex size-5 items-center justify-center rounded-full border-2 border-ocean bg-background sm:-left-[49px]"
              >
                <span className="size-2 rounded-full bg-ocean" />
              </span>

              <p className="font-mono text-xs uppercase tracking-widest text-ocean">
                {exp.period}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold text-navy">
                {exp.role}
              </h3>
              <p className="text-sm text-muted-foreground">{exp.company}</p>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {exp.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {exp.tech.map((t) => (
                  <li key={t}>
                    <Badge variant="accent">{t}</Badge>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
