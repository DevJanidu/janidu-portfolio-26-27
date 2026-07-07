"use client";

import Image from "next/image";

// Drop your icons8 PNGs into /public/icons/ using these exact filenames.
// (mysql-24, cpanel-32, react-100, chatgpt-50 and github-50 are native sizes
// other than 48 — they're all rendered at a uniform 48x48 box below.)
const techStack = [
  { name: ".NET Framework", src: "/icons/icons8-.net-framework-48.png" },
  { name: "Angular", src: "/icons/icons8-angular-48.png" },
  { name: "AWS", src: "/icons/icons8-aws-logo-48.png" },
  { name: "ChatGPT", src: "/icons/icons8-chatgpt-50.png" },
  { name: "Claude", src: "/icons/icons8-claude-48.png" },
  { name: "cPanel", src: "/icons/icons8-cpanel-32.png" },
  { name: "Docker", src: "/icons/icons8-docker-48.png" },
  { name: "Flutter", src: "/icons/icons8-flutter-48.png" },
  { name: "Git", src: "/icons/icons8-git-48.png" },
  { name: "GitHub", src: "/icons/icons8-github-50.png" },
  { name: "JavaScript", src: "/icons/icons8-javascript-48.png" },
  { name: "Laravel", src: "/icons/icons8-laravel-48.png" },
  { name: "MySQL", src: "/icons/icons8-mysql-24.png" },
  { name: "Next.js", src: "/icons/icons8-nextjs-48.png" },
  { name: "Node.js", src: "/icons/icons8-node-js-48.png" },
  { name: "PostgreSQL", src: "/icons/icons8-postgres-48.png" },
  { name: "Python", src: "/icons/icons8-python-48.png" },
  { name: "React", src: "/icons/icons8-react-100.png" },
  { name: "Spring Boot", src: "/icons/icons8-spring-boot-48.png" },
  { name: "Tailwind CSS", src: "/icons/icons8-tailwind-css-48.png" },
  { name: "TypeScript", src: "/icons/icons8-typescript-48.png" },
  { name: "Vite", src: "/icons/icons8-vite-48.png" },
];

export default function TechStackScroll() {
  // Duplicate the list so the CSS animation can loop seamlessly at -50%.
  const loopedStack = [...techStack, ...techStack];

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950 py-10">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-neutral-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-neutral-950 to-transparent" />

      <div className="group flex w-max">
        <div className="flex animate-marquee items-center gap-12 group-hover:[animation-play-state:paused]">
          {loopedStack.map((tech, i) => (
            <div
              key={`${tech.name}-${i}`}
              className="flex w-14 flex-col items-center gap-2"
              title={tech.name}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 ring-1 ring-neutral-800 transition-all duration-300 hover:scale-110 hover:ring-neutral-600">
                <Image
                  src={tech.src}
                  alt={tech.name}
                  width={48}
                  height={48}
                  className="h-8 w-8 object-contain grayscale transition-all duration-300 hover:grayscale-0"
                />
              </div>
              <span className="text-[10px] font-medium text-neutral-500 whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}