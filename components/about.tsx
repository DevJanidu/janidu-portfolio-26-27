import { profile } from "@/lib/data";

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-t border-border py-20 sm:py-24"
    >
      <div className="container">
        <div className="max-w-3xl">
          <p className="section-label">About</p>
          <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One person handling design, booking setup, and launch
          </h2>

          <p className="mt-5 text-body text-foreground/90 sm:text-body-lg">
            {profile.aboutParagraph}
          </p>

          <p className="mt-4 border-l-2 border-primary/40 pl-4 text-[16px] leading-relaxed text-muted-foreground">
            {profile.experienceLine}
          </p>
        </div>
      </div>
    </section>
  );
}
