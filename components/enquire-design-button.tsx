"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";

export const DESIGN_SELECT_EVENT = "janidu:select-design";

export function EnquireDesignButton({
  conceptSlug,
  label = "Enquire about this design",
  variant = "default",
  size = "default",
  className,
}: {
  conceptSlug: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const pathname = usePathname();
  const targetHref = `/?design=${encodeURIComponent(conceptSlug)}#contact`;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      const nextUrl = `/?design=${encodeURIComponent(conceptSlug)}#contact`;
      window.history.pushState(null, "", nextUrl);
      window.dispatchEvent(
        new CustomEvent(DESIGN_SELECT_EVENT, { detail: { slug: conceptSlug } })
      );
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
      const nameInput = document.getElementById("inquiry-name");
      if (nameInput instanceof HTMLInputElement) {
        setTimeout(() => nameInput.focus({ preventScroll: true }), 350);
      }
    }
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={targetHref} onClick={handleClick}>
        {label}
      </Link>
    </Button>
  );
}
