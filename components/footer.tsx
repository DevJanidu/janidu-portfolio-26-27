import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/lib/data";
import { BinaryName } from "@/components/binary-name";
import { MosaicBackdrop } from "@/components/mosaic-backdrop";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-navy pt-10 text-white">
      {/* Pool-tile mosaic: dark→light dithered gradient, left to right */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <MosaicBackdrop />
        {/* Dark filter sweeping from the bottom-left up to the top-right,
            so the name sits on shade while the mosaic stays vivid above */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, rgba(1, 1, 40, 0.95) 0%, rgba(2, 2, 56, 0.8) 32%, rgba(2, 3, 74, 0.5) 52%, rgba(2, 3, 74, 0.2) 72%, transparent 90%)",
          }}
        />
        {/* Second, tighter shade pass just behind the wordmark for extra
            contrast against the busiest part of the mosaic */}
        <div
          className="absolute inset-x-0 bottom-0 h-[65%]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(2, 2, 56, 0.35) 60%, rgba(1, 1, 40, 0.55) 100%)",
          }}
        />
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-between gap-6 pb-10 sm:flex-row">
        <p className="font-mono text-sm text-white/80">
          <span className="text-cyan">$</span> echo &quot;© {year}{" "}
          {profile.name}&quot;
        </p>
        <ul className="flex items-center gap-2">
           {[
            { href: profile.socials.github, label: "GitHub", Icon: Github },
            { href: profile.socials.linkedin, label: "LinkedIn", Icon: Linkedin },
            { href: `mailto:${profile.email}`, label: "Email", Icon: Mail },
          ].map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Janidu drawn as a field of tiny 1/0 digits that follow the pointer */}
      <p className="sr-only">{profile.firstName}</p>
      <div className="relative z-10 mt-4 select-none pb-4">
        <BinaryName text={profile.firstName} />
      </div>
    </footer>
  );
}
