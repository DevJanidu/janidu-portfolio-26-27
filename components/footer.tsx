import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/lib/data";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border pt-10 overflow-hidden">
      <div className="container flex flex-col items-center justify-between gap-6 sm:flex-row pb-10">
        <p className="font-mono text-sm text-muted-foreground z-10">
          <span className="text-ember">$</span> echo &quot;© {year}{" "}
          {profile.name}&quot;
        </p>
        <ul className="flex items-center gap-2 z-10">
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
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-ember"
              >
                <Icon className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full overflow-hidden flex justify-center items-end pointer-events-none mt-8">
        <h1 className="text-[22vw] font-bold text-ember/90 leading-none tracking-tighter select-none translate-y-[15%]">
          {profile.firstName}
        </h1>
      </div>
    </footer>
  );
}
