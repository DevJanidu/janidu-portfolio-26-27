"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { openSource } from "@/lib/data";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

// Blue ramp matching the site palette (level 0 → 4).
const LEVEL_COLORS = [
  "rgba(0,119,182,0.08)",
  "#90E0EF",
  "#00B4D8",
  "#0077B6",
  "#023E8A",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Fixed cell/gap size (px) so cells never get squeezed down on narrow
// screens — instead the strip scrolls horizontally, GitHub-mobile style.
const CELL = 11;
const GAP = 3;

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
  const [scrollable, setScrollable] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // The strip only scrolls when the card is too narrow to fit the whole
  // year at full cell size — measure the real overflow instead of assuming
  // a fixed cutoff, so a wide desktop card shows the full year with no
  // dead space, while a narrow one still opens on the latest months.
  useEffect(() => {
    if (!days || !scrollRef.current) return;
    const el = scrollRef.current;
    const check = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [days]);

  if (failed) {
    return (
      <div className="rounded-md border border-border bg-muted p-3 sm:p-4">
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
      <div className="h-28 animate-pulse rounded-md border border-border bg-muted sm:h-32" />
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

  const columnTemplate = `repeat(${weeks.length}, ${CELL}px)`;

  return (
    <div
      ref={ref}
      className="rounded-md border border-border bg-white p-3 sm:p-4"
    >
      <div className="flex gap-1.5">
        {/* Weekday labels (Mon / Wed / Fri) — fixed, doesn't scroll */}
        <div
          className="grid shrink-0 gap-[3px] pt-[16px] font-mono text-[7px] leading-none text-muted-foreground sm:text-[8px]"
          style={{ gridTemplateRows: `repeat(7, ${CELL}px)` }}
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

        {/* Horizontally scrollable strip. Cells stay a fixed, readable size
            instead of shrinking to fit — the strip just fills whatever
            width the card actually has. On a wide desktop card that's
            enough room for the whole year (no scrolling, no dead space);
            on a narrow one it naturally can't fit everything, so it opens
            on the most recent months — same idea as GitHub's own mobile
            contribution graph. The rtl wrapper (with an ltr child) opens
            the strip already scrolled to its right edge — the most recent
            week — with no JS scroll jump. The native scrollbar stays
            hidden until you touch or hover the strip (see .contrib-scroll),
            then it appears to scroll back through earlier months and fades
            out again once you let go. */}
        <div className="relative min-w-0 w-full">
          <div
            ref={scrollRef}
            dir="rtl"
            className="contrib-scroll w-full overflow-x-auto pb-1"
          >
            <div dir="ltr" className="w-max">
              {/* Month labels */}
              <div
                className="grid gap-[3px] pb-1 font-mono text-[7px] leading-none text-muted-foreground sm:text-[8px]"
                style={{ gridTemplateColumns: columnTemplate }}
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
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: columnTemplate }}
                role="img"
                aria-label={
                  scrollable
                    ? "GitHub contribution graph, one square per day. Showing the most recent months — scroll left for earlier ones."
                    : "GitHub contribution graph, one square per day."
                }
              >
                {weeks.map((week, w) => (
                  <div
                    key={w}
                    className="grid grid-rows-7 gap-[3px]"
                  >
                    {week.map((day, d) =>
                      day ? (
                        <div
                          key={day.date}
                          title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                          className={
                            instant
                              ? "rounded-[2px]"
                              : lit
                                ? "contrib-cell lit rounded-[2px]"
                                : "contrib-cell rounded-[2px]"
                          }
                          style={{
                            width: CELL,
                            height: CELL,
                            backgroundColor: LEVEL_COLORS[day.level],
                            // Fast left-to-right sweep with a slight downward cascade.
                            animationDelay: instant
                              ? undefined
                              : `${w * 18 + d * 12}ms`,
                          }}
                        />
                      ) : (
                        <div
                          key={`pad-${w}-${d}`}
                          style={{ width: CELL, height: CELL }}
                        />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fade hinting that earlier months sit just off-screen to the left */}
          {scrollable && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-white to-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
}
