"use client";

import { useEffect, useState } from "react";

/** Cycles through phrases with a typewriter effect + blinking caret. */
export function TypingEffect({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Reduced-motion: show the first phrase statically.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setText(phrases[0]);
      return;
    }

    const current = phrases[index % phrases.length];
    const done = text === current;
    const empty = text === "";

    let delay = deleting ? 45 : 90;
    if (done && !deleting) delay = 1500; // pause at full word
    if (empty && deleting) delay = 300;

    const timer = setTimeout(() => {
      if (!deleting && done) {
        setDeleting(true);
      } else if (deleting && empty) {
        setDeleting(false);
        setIndex((n) => n + 1);
      } else {
        setText(
          deleting
            ? current.slice(0, text.length - 1)
            : current.slice(0, text.length + 1)
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, index, phrases]);

  return (
    <span className={className} aria-live="polite">
      {text}
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[1em] w-[3px] translate-y-[2px] bg-ember align-middle animate-blink"
      />
    </span>
  );
}
