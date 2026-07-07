import { featuredProjects } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";

/** ProjectGrid — responsive, reads featured projects from lib/data. */
export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="git log --oneline projects/"
          title="Things I've built"
          description="Full-stack products taken from schema to deploy. Each links to a deeper case study."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug} i={i} as="div">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
