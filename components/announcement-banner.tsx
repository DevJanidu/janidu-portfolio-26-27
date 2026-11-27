"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

export interface AnnouncementData {
  id: string;
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  logoUrl?: string;
  badgeText?: string;
}

interface AnnouncementBannerProps {
  announcement: AnnouncementData | null;
}

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    const storageKey = `jd_announcement_dismissed_${announcement.id}_${announcement.heading}`;
    try {
      if (sessionStorage.getItem(storageKey) === "1") {
        return;
      }
    } catch {
      // Ignore storage access errors
    }
    const timer = window.setTimeout(() => setVisible(true), 220);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  if (!announcement) return null;

  function handleDismiss() {
    setVisible(false);
    try {
      if (announcement) {
        sessionStorage.setItem(
          `jd_announcement_dismissed_${announcement.id}_${announcement.heading}`,
          "1"
        );
      }
    } catch {
      // Ignore storage access errors
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Special announcement"
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-[76px] sm:top-[82px] z-40 px-4 pointer-events-none flex flex-col items-center"
        >
          <div className="pointer-events-auto relative w-full max-w-2xl">
            {/* Luminous Blue Outer Aura */}
            <div
              aria-hidden="true"
              className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 opacity-75 blur-[6px]"
            />

            {/* Luminous White & Blue Card */}
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-sky-300 via-blue-500 to-sky-400 shadow-[0_14px_40px_-10px_rgba(37,99,235,0.32)]">
              <div className="relative overflow-hidden rounded-[15px] bg-white/95 backdrop-blur-xl px-4 py-3.5 sm:px-5 sm:py-4">
                {/* Subtle Luminous Shimmer Highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -right-12 h-32 w-48 rounded-full bg-sky-300/30 blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-40 rounded-full bg-blue-400/20 blur-2xl"
                />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {announcement.logoUrl ? (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-blue-200/80 p-1.5 shadow-[0_4px_16px_rgba(37,99,235,0.18)] overflow-hidden">
                        <img
                          src={announcement.logoUrl}
                          alt={announcement.heading}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.45)]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                          {announcement.badgeText || "Special Offer"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm sm:text-[15px] font-semibold text-neutral-900 leading-snug">
                        {announcement.heading}
                      </p>
                      {announcement.body && (
                        <p className="mt-0.5 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                          {announcement.body}
                        </p>
                      )}
                    </div>
                  </div>

                  {announcement.ctaLabel && (
                    <Link
                      href={announcement.ctaHref || "/#contact"}
                      onClick={handleDismiss}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_6px_20px_rgba(37,99,235,0.38)] hover:brightness-105 hover:shadow-[0_8px_24px_rgba(37,99,235,0.5)] transition-all"
                    >
                      <span>{announcement.ctaLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Centered Floating Cancel (X) Button */}
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close announcement"
                className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-blue-600 border border-blue-200/90 shadow-[0_4px_16px_rgba(37,99,235,0.22)] backdrop-blur-md hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
