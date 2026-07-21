"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipeThreshold = 50; // Minimum distance to trigger swipe
    if (offset.x < -swipeThreshold && currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (offset.x > swipeThreshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="mt-10 space-y-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border shadow-md">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Image
              src={images[currentIndex]}
              alt={`${title} screenshot ${currentIndex + 1}`}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-3 pt-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                currentIndex === idx
                  ? "bg-ocean scale-110"
                  : "bg-sky/60 hover:bg-sky"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
