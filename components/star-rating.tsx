import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "default",
  showNumeric = false,
  className,
}: {
  rating: number;
  size?: "sm" | "default";
  showNumeric?: boolean;
  className?: string;
}) {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));
  const iconSize = size === "sm" ? "size-4" : "size-[18px]";

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${clamped} out of 5 stars`}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconSize,
              star <= clamped
                ? "fill-amber-500 text-amber-500"
                : "fill-transparent text-border"
            )}
          />
        ))}
      </span>
      {showNumeric ? (
        <span className="text-sm font-medium text-foreground" aria-hidden="true">
          {clamped}/5
        </span>
      ) : null}
    </div>
  );
}
