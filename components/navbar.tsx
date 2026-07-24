"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The salon landing page is a focused, unlinked page — show a trimmed nav
// there instead of the full site navigation.
const SALON_NAV_LABELS = ["About", "LycoLabs", "Projects", "Contact"];

export function Navbar() {
  const pathname = usePathname();
  const isSalon = pathname?.startsWith("/salon-details") ?? false;
  const links = isSalon
    ? navLinks.filter((link) => SALON_NAV_LABELS.includes(link.label))
    : navLinks;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="container flex h-16 items-center justify-between"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-mono text-base font-semibold sm:text-lg"
        >
          <Image
            src="/devjanidu-logo.png"
            alt=""
            width={40}
            height={40}
            className="size-11 sm:size-12"
            priority
          />
          <span className="tracking-tight text-navy">
            {profile.firstName.toLowerCase()}
            <span className="text-ocean">Dev</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-ocean focus-visible:text-ocean active:text-ocean"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/#contact">Get in touch</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-background/95 md:hidden"
          >
            <ul className="container flex flex-col gap-1 py-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 font-mono text-sm text-muted-foreground hover:bg-accent hover:text-ocean active:bg-accent active:text-ocean"
                  >
                    <span className="text-ocean">~/</span>
                    {link.label.toLowerCase()}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="w-full">
                  <Link href="/#contact" onClick={() => setOpen(false)}>
                    Get in touch
                  </Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
