"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Icons live in /public/assets/tech-icons/ (icons8 PNGs, native sizes vary
// but are all rendered at a uniform 32x32 box below).
const techStack = [
  { name: ".NET", src: "/assets/tech-icons/icons8-.net-framework-48.png" },
  { name: "Angular", src: "/assets/tech-icons/icons8-angular-48.png" },
  { name: "AWS", src: "/assets/tech-icons/icons8-aws-logo-48.png" },
  { name: "ChatGPT", src: "/assets/tech-icons/icons8-chatgpt-50.png" },
  { name: "Claude", src: "/assets/tech-icons/icons8-claude-48.png" },
  { name: "cPanel", src: "/assets/tech-icons/icons8-cpanel-32.png" },
  { name: "Docker", src: "/assets/tech-icons/icons8-docker-48.png" },
  { name: "Flutter", src: "/assets/tech-icons/icons8-flutter-48.png" },
  { name: "Git", src: "/assets/tech-icons/icons8-git-48.png" },
  { name: "GitHub", src: "/assets/tech-icons/icons8-github-50.png" },
  { name: "JavaScript", src: "/assets/tech-icons/icons8-javascript-48.png" },
  { name: "Laravel", src: "/assets/tech-icons/icons8-laravel-48.png" },
  { name: "MySQL", src: "/assets/tech-icons/icons8-mysql-24.png" },
  { name: "Next.js", src: "/assets/tech-icons/icons8-nextjs-48.png" },
  { name: "Node.js", src: "/assets/tech-icons/icons8-node-js-48.png" },
  { name: "PostgreSQL", src: "/assets/tech-icons/icons8-postgres-48.png" },
  { name: "Python", src: "/assets/tech-icons/icons8-python-48.png" },
  { name: "React", src: "/assets/tech-icons/icons8-react-100.png" },
  { name: "Spring Boot", src: "/assets/tech-icons/icons8-spring-boot-48.png" },
  { name: "Tailwind CSS", src: "/assets/tech-icons/icons8-tailwind-css-48.png" },
  { name: "TypeScript", src: "/assets/tech-icons/icons8-typescript-48.png" },
  { name: "Vite", src: "/assets/tech-icons/icons8-vite-48.png" },
];

export function TechStackScroll() {
  // Duplicate the list so the CSS animation can loop seamlessly at -50%.
  const loopedStack = [...techStack, ...techStack];
  // Tap-to-pause for touch devices, where :hover never fires.
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative w-full overflow-hidden py-6">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink/40 to-transparent" />

      <div
        className="marquee-track flex w-max cursor-pointer"
        onClick={() => setPaused((v) => !v)}
        role="button"
        tabIndex={0}
        aria-pressed={paused}
        aria-label={paused ? "Resume tech stack scroll" : "Pause tech stack scroll"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPaused((v) => !v);
          }
        }}
      >
        <div
          className={cn(
            "flex animate-marquee items-center gap-8 sm:gap-10",
            paused && "is-paused"
          )}
        >
          {loopedStack.map((tech, i) => (
            <div
              key={`${tech.name}-${i}`}
              className="flex w-12 flex-col items-center gap-2 sm:w-14"
              title={tech.name}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary/60 transition-all duration-300 hover:scale-110 hover:border-ember/40 active:scale-110 active:border-ember/40 sm:h-11 sm:w-11">
                <Image
                  src={tech.src}
                  alt={tech.name}
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7"
                />
              </div>
              <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
