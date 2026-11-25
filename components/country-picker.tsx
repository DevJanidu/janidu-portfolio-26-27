"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, getCountryByValue } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function CountryPicker({
  id,
  name = "country",
  value,
  onChange,
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => getCountryByValue(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.value.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected.value} />

      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-white px-3.5 py-3 text-left text-[16px] text-foreground transition-colors",
          open
            ? "border-primary ring-2 ring-ring"
            : "border-input hover:border-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        )}
      >
        <span className="flex items-center gap-2.5 truncate">
          <span className="text-lg leading-none" aria-hidden="true">
            {selected.flag}
          </span>
          <span className="truncate font-normal">{selected.label}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-180 text-primary"
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-elevated">
          {/* Search box matching the reference design */}
          <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">
            <Search
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country..."
              aria-label="Search country"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
          </div>

          {/* Country options list */}
          <ul
            id={`${id}-listbox`}
            role="listbox"
            aria-label="Country options"
            className="max-h-60 divide-y divide-border/70 overflow-y-auto py-1"
          >
            {filtered.length > 0 ? (
              filtered.map((country) => {
                const isSelected = country.value === selected.value;
                return (
                  <li key={country.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(country.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-accent font-medium text-primary"
                          : "text-foreground hover:bg-secondary/70"
                      )}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span
                          className="text-base leading-none"
                          aria-hidden="true"
                        >
                          {country.flag}
                        </span>
                        <span className="truncate">{country.label}</span>
                      </span>
                      {isSelected ? (
                        <Check
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3.5 py-4 text-center text-sm text-muted-foreground">
                No matching countries
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
