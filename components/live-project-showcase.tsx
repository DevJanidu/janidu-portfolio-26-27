"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Monitor, RotateCw, Smartphone } from "lucide-react";
import { EnquireDesignButton } from "@/components/enquire-design-button";
import { cn } from "@/lib/utils";

export const LIVE_PREVIEW_SELECT_EVENT = "janidu:select-live-preview";

type LiveShowcaseItem = {
  slug: string;
  title: string;
  url: string;
  displayUrl: string;
  summary: string;
};

const PREMIUM_LIVE_ITEMS: LiveShowcaseItem[] = [
  {
    slug: "lucia-atelier",
    title: "Lucia Atelier",
    url: "https://salon-demo-coral-eta.vercel.app/concepts/lucia",
    displayUrl: "salon-demo-coral-eta.vercel.app/concepts/lucia",
    summary:
      "One of my recent salon projects. Scroll and click inside the live site below to explore services, transformation stories, and booking without leaving the page.",
  },
  {
    slug: "milan-marble",
    title: "Milan Marble",
    url: "https://salon-demo-coral-eta.vercel.app/concepts/marble",
    displayUrl: "salon-demo-coral-eta.vercel.app/concepts/marble",
    summary:
      "One of my recent editorial salon builds, connecting featured looks directly to the service menu, packages, and appointment booking.",
  },
  {
    slug: "swiss-classic",
    title: "Swiss Classic",
    url: "https://salon-demo-coral-eta.vercel.app/concepts/classic",
    displayUrl: "salon-demo-coral-eta.vercel.app/concepts/classic",
    summary:
      "One of my recent salon builds featuring a structured service index with upfront pricing and direct per-service Book buttons.",
  },
];

export function LiveProjectShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [activeSlug, setActiveSlug] = useState<string>("lucia-atelier");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);

  const activeItem =
    PREMIUM_LIVE_ITEMS.find((item) => item.slug === activeSlug) ??
    PREMIUM_LIVE_ITEMS[0];

  useEffect(() => {
    if (!isSwitching) return;
    const timer = window.setTimeout(() => setIsSwitching(false), 1800);
    return () => window.clearTimeout(timer);
  }, [isSwitching, activeSlug, reloadKey]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 92%", "start 22%"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [0.92, 1]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [56, 0]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.55, 0.92, 1]
  );

  useEffect(() => {
    function onSelectLivePreview(e: Event) {
      const slug = (e as CustomEvent<{ slug?: string }>).detail?.slug;
      if (!slug) return;
      if (PREMIUM_LIVE_ITEMS.some((item) => item.slug === slug)) {
        setActiveSlug(slug);
        setIsSwitching(true);
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    window.addEventListener(LIVE_PREVIEW_SELECT_EVENT, onSelectLivePreview);
    return () =>
      window.removeEventListener(
        LIVE_PREVIEW_SELECT_EVENT,
        onSelectLivePreview
      );
  }, []);

  return (
    <section
      id="live-showcase"
      ref={sectionRef}
      className="scroll-mt-20 border-b border-border pb-20 pt-10 sm:pb-28 sm:pt-14"
      aria-label="Interactive live project preview"
    >
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6">
        {/* Header + Premium build switcher */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="section-label">
              Recent project &middot; Interactive live preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Try {activeItem.title} right here on the page
            </h2>
            <p className="mt-2.5 text-body text-muted-foreground">
              {activeItem.summary}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Switch live interactive project"
            className="flex flex-wrap items-center gap-2"
          >
            {PREMIUM_LIVE_ITEMS.map((item) => {
              const selected = item.slug === activeItem.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    if (item.slug !== activeSlug) {
                      setActiveSlug(item.slug);
                      setIsSwitching(true);
                    }
                  }}
                  className={cn(
                    "rounded-md border px-3.5 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll-animated interactive browser frame */}
        <motion.div
          style={{ scale, y, opacity }}
          className="mt-8 origin-top will-change-transform"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-frame">
            {/* Diagonal corner ribbon tag */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-20 h-36 w-36 overflow-hidden"
            >
              <span className="absolute -left-[44px] top-[34px] block w-[180px] -rotate-45 border-y border-black/15 bg-[#CCFF00] py-1.5 text-center text-[10px] font-extrabold uppercase tracking-[0.06em] text-black shadow-sm">
                Recent Project
              </span>
            </div>

            {/* Browser chrome toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/75 py-3 pl-28 pr-4 sm:pl-32 sm:pr-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                </span>

                <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span
                    className="size-2 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="max-w-[200px] truncate sm:max-w-[340px]">
                    {activeItem.displayUrl}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Desktop / Mobile preview toggle */}
                <div
                  role="group"
                  aria-label="Preview viewport size"
                  className="hidden items-center rounded-md border border-border bg-white p-0.5 sm:inline-flex"
                >
                  <button
                    type="button"
                    onClick={() => setViewportMode("desktop")}
                    aria-pressed={viewportMode === "desktop"}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      viewportMode === "desktop"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Monitor className="size-3.5" aria-hidden="true" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode("mobile")}
                    aria-pressed={viewportMode === "mobile"}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      viewportMode === "mobile"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Smartphone className="size-3.5" aria-hidden="true" />
                    Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSwitching(true);
                    setReloadKey((k) => k + 1);
                  }}
                  aria-label={`Reload ${activeItem.title} preview`}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-white text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCw className="size-3.5" aria-hidden="true" />
                </button>

                <EnquireDesignButton
                  conceptSlug={activeItem.slug}
                  label="Use this style"
                  size="sm"
                />
              </div>
            </div>

            {/* Live embedded interactive site */}
            <div className="relative flex justify-center bg-[#F0EFEA]">
              {isSwitching ? (
                <div
                  aria-live="polite"
                  className="pointer-events-none absolute right-4 top-4 z-10 rounded-md border border-border bg-white/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                >
                  Loading {activeItem.title}...
                </div>
              ) : null}

              <div
                className={cn(
                  "w-full transition-all duration-300",
                  viewportMode === "mobile"
                    ? "my-6 max-w-[390px] overflow-hidden rounded-[24px] border border-border bg-white shadow-elevated"
                    : "max-w-none bg-white"
                )}
              >
                <iframe
                  key={`${activeItem.slug}-${reloadKey}`}
                  src={activeItem.url}
                  title={`${activeItem.title} live interactive website preview`}
                  onLoad={() => setIsSwitching(false)}
                  className={cn(
                    "block w-full border-0 bg-white",
                    viewportMode === "mobile"
                      ? "h-[740px]"
                      : "h-[700px] sm:h-[82vh] sm:min-h-[760px] lg:h-[86vh] lg:min-h-[820px] lg:max-h-[980px]"
                  )}
                  allow="clipboard-write"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
