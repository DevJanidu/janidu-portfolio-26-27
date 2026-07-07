"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin } from "lucide-react";
import { profile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { TypingEffect } from "@/components/typing-effect";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex items-center overflow-hidden bg-dotgrid pt-24 pb-12 sm:pt-32 sm:pb-24 lg:min-h-screen"
    >
      {/* Ambient ember glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-ember/20 blur-[120px]"
      />
      <div className="container relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.p
            variants={item}
            className="eyebrow mb-5"
          >
            <span className="text-sand/60">$</span> whoami
          </motion.p>

          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Hi, I&apos;m{" "}
            <span className="text-ember">{profile.firstName}</span>.
          </motion.h1>

          <motion.div
            variants={item}
            className="mt-4 flex items-center font-mono text-lg text-sand sm:text-2xl"
          >
            <span className="text-ember">&gt;&nbsp;</span>
            <TypingEffect phrases={profile.roles} className="text-foreground" />
          </motion.div>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {profile.intro}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <a href="#projects">
                View projects <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={profile.resumeUrl} download="Janidu-Yapa-Resume.pdf">
                <Download className="size-4" /> Download résumé
              </a>
            </Button>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-8 flex items-center gap-2"
            aria-label="Social links"
          >
            {[
              { href: profile.socials.github, label: "GitHub", Icon: Github },
              { href: profile.socials.linkedin, label: "LinkedIn", Icon: Linkedin },
            ].map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-ember/50 hover:text-ember active:-translate-y-0.5 active:border-ember/50 active:text-ember"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Terminal signature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="terminal-frame w-full max-w-full overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-border bg-ink/60 px-4 py-3">
            <span className="size-3 rounded-full bg-[#EB5E28]" />
            <span className="size-3 rounded-full bg-[#CCC5B9]" />
            <span className="size-3 rounded-full bg-[#403D39]" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {profile.firstName.toLowerCase()}@portfolio: ~
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-sand sm:p-5 sm:text-[13px]">
            <code>
              <span className="text-ember">$</span> cat profile.json{"\n"}
              {"{"}
              {"\n"}
              {"  "}<span className="text-ember">&quot;name&quot;</span>:{" "}
              <span className="text-cream">&quot;{profile.name}&quot;</span>,{"\n"}
              {"  "}<span className="text-ember">&quot;role&quot;</span>:{" "}
              <span className="text-cream">&quot;{profile.title}&quot;</span>,{"\n"}
              {"  "}<span className="text-ember">&quot;location&quot;</span>:{" "}
              <span className="text-cream">&quot;{profile.location}&quot;</span>,{"\n"}
              {"  "}<span className="text-ember">&quot;stack&quot;</span>: [
              <span className="text-cream">&quot;React&quot;</span>,{" "}
              <span className="text-cream">&quot;Spring Boot&quot;</span>,{" "}
              <span className="text-cream">&quot;PostgreSQL&quot;</span>],{"\n"}
              {"  "}<span className="text-ember">&quot;status&quot;</span>:{" "}
              <span className="text-cream">&quot;available&quot;</span>{"\n"}
              {"}"}
              {"\n\n"}
              <span className="text-ember">$</span>{" "}
              <span className="animate-blink">▋</span>
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
