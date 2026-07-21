import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

/** Command-line eyebrow + display title. The eyebrow encodes a route/command. */
export function SectionHeading({
  command,
  title,
  description,
  className,
}: {
  command: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Reveal>
        <span className="eyebrow">
          <span className="text-muted-foreground/60">$</span> {command}
        </span>
      </Reveal>
      <Reveal i={1}>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal i={2}>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
