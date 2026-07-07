"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { openSource } from "@/lib/data";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

// Ember-tinted ramp matching the site palette (level 0 → 4).
const LEVEL_COLORS = [
  "rgba(204,197,185,0.10)",
  "rgba(235,94,40,0.30)",
  "rgba(235,94,40,0.55)",
  "rgba(235,94,40,0.80)",
  "#EB5E28",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * GitHub contribution graph rendered as real DOM cells (fetched from the
 * public jogruber contributions API) so each slot can light up one by one.
 * Falls back to the static ghchart image if the API is unreachable.
 */
export function ContributionGraph() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [lit, setLit] = useState(false);
  const [instant, setInstant] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = openSource.githubUrl.split("/").pop();
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((d: { contributions: Day[] }) => setDays(d.contributions))
      .catch(() => setFailed(true));
  }, []);

  // Light the cells only once the graph scrolls into view.
  useEffect(() => {
    if (!days || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInstant(true);
      setLit(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLit(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [days]);

  if (failed) {
    return (
      <div className="rounded-md border border-border bg-ink/40 p-3 sm:p-4">
        <img
          src={openSource.graphImage}
          alt="GitHub contribution graph"
          className="h-auto w-full"
          loading="lazy"
        />
      </div>
    );
  }

  if (!days) {
    return (
      <div className="h-28 animate-pulse rounded-md border border-border bg-ink/40 sm:h-32" />
    );
  }

  // Group days into GitHub-style week columns (Sun-start, pad first week).
  const padded: (Day | null)[] = [
    ...Array<null>(new Date(days[0].date).getDay()).fill(null),
    ...days,
  ];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month label per week column (shown when the month changes).
  const monthLabels = weeks.map((week, w) => {
    const first = week.find(Boolean) as Day;
    const month = new Date(first.date).getMonth();
    if (w === 0) return MONTHS[month];
    const prevFirst = weeks[w - 1].find(Boolean) as Day;
    return month !== new Date(prevFirst.date).getMonth() ? MONTHS[month] : "";
  });

  return (
    <div
      ref={ref}
      className="rounded-md border border-border bg-ink/40 p-3 sm:p-4"
    >
      <div className="flex gap-1.5">
        {/* Weekday labels (Mon / Wed / Fri) */}
        <div
          className="grid shrink-0 gap-[2px] pt-[14px] font-mono text-[7px] leading-none text-muted-foreground sm:text-[8px]"
          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
          aria-hidden="true"
        >
          <span />
          <span className="self-center">Mon</span>
          <span />
          <span className="self-center">Wed</span>
          <span />
          <span className="self-center">Fri</span>
          <span />
        </div>

        <div className="w-full min-w-0">
          {/* Month labels */}
          <div
            className="grid gap-[2px] pb-1 font-mono text-[7px] leading-none text-muted-foreground sm:text-[8px]"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
            aria-hidden="true"
          >
            {monthLabels.map((label, w) => (
              <span key={w} className="overflow-visible whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>

          {/* Cells */}
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
            role="img"
            aria-label="GitHub contribution graph, one square per day"
          >
            {weeks.map((week, w) => (
              <div key={w} className="grid grid-rows-7 gap-[2px]">
                {week.map((day, d) =>
                  day ? (
                    <div
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                      className={
                        instant
                          ? "aspect-square w-full rounded-[2px]"
                          : lit
                            ? "contrib-cell lit aspect-square w-full rounded-[2px]"
                            : "contrib-cell aspect-square w-full rounded-[2px]"
                      }
                      style={{
                        backgroundColor: LEVEL_COLORS[day.level],
                        // Fast left-to-right sweep with a slight downward cascade.
                        animationDelay: instant
                          ? undefined
                          : `${w * 18 + d * 12}ms`,
                      }}
                    />
                  ) : (
                    <div key={`pad-${w}-${d}`} />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
