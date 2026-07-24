"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Check } from "lucide-react";
import { erpModules } from "@/lib/salon-data";
import { SectionHeading } from "@/components/section-heading";
import { SalonContainer } from "@/components/salon/salon-container";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SalonModules() {
  const [activeId, setActiveId] = useState(erpModules[0].id);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = erpModules.find((m) => m.id === activeId) ?? erpModules[0];

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, [activeId]);

  return (
    <section id="modules" className="scroll-mt-20 py-20 sm:py-28">
      <SalonContainer>
        <SectionHeading
          command="explore ./erp-modules"
          title="Every Module Inside the Salon ERP"
          description="One system for appointments, billing, inventory, staff, and reporting. Pick a category to see exactly what's included."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Category nav */}
          <nav
            aria-label="ERP module categories"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {erpModules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveId(mod.id)}
                aria-current={mod.id === activeId ? "true" : undefined}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-md px-4 py-3 text-left font-mono text-base transition-colors lg:whitespace-normal",
                  mod.id === activeId
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-ocean"
                )}
              >
                {mod.label}
              </button>
            ))}
          </nav>

          {/* Active category panel */}
          <div ref={panelRef} role="tabpanel">
            {active.description ? (
              <p className="mb-6 max-w-2xl text-lg text-muted-foreground">
                {active.description}
              </p>
            ) : null}

            <div className="space-y-6">
              {active.groups.map((group) => (
                <Card key={group.title ?? active.id}>
                  <CardContent className="p-6 sm:p-7">
                    {group.title ? (
                      <h3 className="font-display text-xl font-semibold text-navy">
                        {group.title}
                      </h3>
                    ) : null}
                    {group.description ? (
                      <p
                        className={cn(
                          "text-base text-muted-foreground",
                          group.title ? "mt-1.5" : ""
                        )}
                      >
                        {group.description}
                      </p>
                    ) : null}
                    <ul className="mt-4 grid gap-x-6 gap-y-2.5 text-base text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <Check className="mt-1 size-4 shrink-0 text-ocean" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SalonContainer>
    </section>
  );
}
