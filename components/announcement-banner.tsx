"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

export interface AnnouncementSocials {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface AnnouncementData {
  id: string;
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  logoUrl?: string;
  badgeText?: string;
  socials?: AnnouncementSocials;
}

function normalizeWhatsappHref(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : trimmed;
}

function normalizeExternalHref(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
                      {announcement.socials &&
                        (announcement.socials.whatsapp ||
                          announcement.socials.facebook ||
                          announcement.socials.instagram ||
                          announcement.socials.tiktok) && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            {announcement.socials.whatsapp && (
                              <a
                                href={normalizeWhatsappHref(announcement.socials.whatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                title="WhatsApp"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/70 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.18-4.94-4.37-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.1.19-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.69.8 1.98.94.29.15.49.22.56.34.07.12.07.7-.17 1.38z" />
                                </svg>
                              </a>
                            )}
                            {announcement.socials.facebook && (
                              <a
                                href={normalizeExternalHref(announcement.socials.facebook)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                title="Facebook"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/70 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                  <path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14c-.29-.04-1.3-.14-2.47-.14-2.44 0-4.12 1.49-4.12 4.23v2.37H7.44v3.2h2.76V22h3.3z" />
                                </svg>
                              </a>
                            )}
                            {announcement.socials.instagram && (
                              <a
                                href={normalizeExternalHref(announcement.socials.instagram)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                title="Instagram"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/70 text-pink-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38 3.7 3.7 0 0 1-1.38.9c-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 0 0-2.12 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.12.65.66 1.32 1.07 2.12 1.38.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.12-1.38 5.87 5.87 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.12A5.87 5.87 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
                                </svg>
                              </a>
                            )}
                            {announcement.socials.tiktok && (
                              <a
                                href={normalizeExternalHref(announcement.socials.tiktok)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="TikTok"
                                title="TikTok"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/70 text-neutral-900 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.14 15.7 6.34 6.34 0 0 0 9.48 22a6.34 6.34 0 0 0 6.34-6.33V8.73a8.26 8.26 0 0 0 4.77 1.52V6.8a4.85 4.85 0 0 1-1-.11z" />
                                </svg>
                              </a>
                            )}
                          </div>
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
