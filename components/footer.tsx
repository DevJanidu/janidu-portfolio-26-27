import Link from "next/link";
import { Linkedin } from "lucide-react";
import { profile } from "@/lib/data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="text-base font-semibold tracking-tight text-foreground">
              {profile.publicName}
            </p>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Websites, service menus, and online booking for small businesses.{" "}
              {profile.clientMarkets}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Pages
            </p>
            <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
              <li>
                <Link href="/#work" className="transition-colors hover:text-foreground">
                  Work
                </Link>
              </li>
              <li>
                <Link
                  href="/salon-concepts"
                  className="transition-colors hover:text-foreground"
                >
                  Salon design concepts
                </Link>
              </li>
              <li>
                <Link href="/#process" className="transition-colors hover:text-foreground">
                  Process &amp; payments
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="transition-colors hover:text-foreground">
                  Client reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews#leave-a-review"
                  className="transition-colors hover:text-foreground"
                >
                  Leave a review
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Direct contact
            </p>
            <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  WhatsApp: {profile.whatsapp}
                </a>
              </li>
              <li>{profile.location}</li>
              <li className="pt-1">
                <a
                  href={profile.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary"
                >
                  <Linkedin className="size-4" aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>
            &copy; {year} {profile.name}. All rights reserved.
          </p>
          <p>JaniduDev &middot; {profile.location}</p>
        </div>
      </div>
    </footer>
  );
}
