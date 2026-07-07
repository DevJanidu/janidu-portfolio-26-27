"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
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
          className="group inline-flex items-center gap-2 font-mono text-sm font-semibold"
        >
          <Terminal className="size-4 text-ember" aria-hidden="true" />
          <span className="tracking-tight">
            {profile.firstName.toLowerCase()}
            <span className="text-ember">Dev</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground active:text-foreground"
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
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 font-mono text-sm text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-secondary active:text-foreground"
                  >
                    <span className="text-ember">~/</span>
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
