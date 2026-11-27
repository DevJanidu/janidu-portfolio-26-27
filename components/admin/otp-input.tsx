"use client";

import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, idx) => value[idx] || "");

  function updateAt(index: number, char: string) {
    const clean = char.replace(/\D/g, "");
    if (!clean) {
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    // Handle multi-digit paste or autofill inside a single box
    if (clean.length > 1) {
      const pasted = clean.slice(0, length);
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = digits.slice();
    next[index] = clean[0];
    onChange(next.join(""));
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = digits.slice();
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join(""));
        inputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    onChange(text);
    const focusIdx = Math.min(text.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          maxLength={6}
          disabled={disabled}
          autoFocus={autoFocus && idx === 0}
          value={digit}
          aria-label={`Digit ${idx + 1} of ${length}`}
          onChange={(e) => updateAt(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-13 w-11 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-xl font-semibold font-mono transition-all focus:outline-none ${
            digit
              ? "border-neutral-900 bg-white text-neutral-900 dark:border-white dark:bg-neutral-900 dark:text-white"
              : "border-neutral-200 bg-neutral-50/70 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
          } focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/10 dark:focus:border-white dark:focus:ring-white/15 disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
