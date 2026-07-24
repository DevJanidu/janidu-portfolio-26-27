import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wider, tighter-padded shell for the salon page only — the site-wide
 * `container` utility's 1.5rem side padding was eating too much width from
 * the module explorer and package cards on this content-dense page.
 */
export function SalonContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
