import { Sparkles } from "lucide-react";
import { profile, current, education } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";

export function About() {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="cat about.md"
          title="A full-stack engineer who ships the whole thing"
          description={profile.intro}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <p className="text-muted-foreground">
                  Currently a{" "}
                  <span className="text-foreground">{current.role}</span> at{" "}
                  <span className="text-ember">{current.company}</span> since{" "}
                  {current.since}. {current.blurb}
                </p>
                <div className="rounded-md border border-border bg-ink/40 p-4">
                  <p className="flex items-start gap-2 text-sm text-sand">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-ember" />
                    <span>{profile.funFact}</span>
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Education
                  </p>
                  <ul className="space-y-2">
                    {education.map((e) => (
                      <li key={e.program} className="text-sm">
                        <span className="text-foreground">{e.program}</span>
                        <span className="text-muted-foreground">
                          {" "}— {e.school}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={1}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col justify-center gap-6 p-6 sm:p-8">
                {profile.stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-4xl font-bold text-ember">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
