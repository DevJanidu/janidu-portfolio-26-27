import { cn } from "@/lib/utils";

export function SectionHeading({
  label,
  command,
  title,
  description,
  className,
}: {
  label?: string;
  command?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  const eyebrowText = label ?? command;
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrowText ? (
        <p className="section-label">{eyebrowText}</p>
      ) : null}
      <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3.5 text-body text-muted-foreground sm:text-body-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
