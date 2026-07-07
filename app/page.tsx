import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Venture } from "@/components/venture";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { OpenSource } from "@/components/open-source";
import { Experience } from "@/components/experience";
import { Writing } from "@/components/writing";
import { Contact } from "@/components/contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Venture />
      <Skills />
      <Projects />
      <OpenSource />
      <Experience />
      <Writing />
      <Contact />
    </>
  );
}
