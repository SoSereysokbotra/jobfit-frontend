"use client";

import React, { useRef } from "react";
import { cn } from "@/shared/utils/cn";

interface OtpInputProps {
  /** Current code value (digits only). */
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Stretch the boxes to fill the container width (e.g. to match a full-width button). */
  fullWidth?: boolean;
}

/**
 * Segmented one-time-code input (matches the OTP pattern in ui-reference).
 * Handles auto-advance, backspace, arrow navigation, and full-code paste.
 */
export function OtpInput({ value, onChange, length = 6, disabled = false, autoFocus = false, fullWidth = false }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => {
    const el = inputsRef.current[i];
    el?.focus();
    el?.select();
  };

  const commit = (next: string[]) => onChange(next.join("").slice(0, length));

  const fillFrom = (index: number, raw: string) => {
    const chars = raw.replace(/\D/g, "").split("");
    if (!chars.length) return;
    const next = [...digits];
    let i = index;
    for (const c of chars) {
      if (i >= length) break;
      next[i] = c;
      i += 1;
    }
    commit(next);
    focus(Math.min(i, length - 1));
  };

  const handleChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      commit(next);
      return;
    }
    fillFrom(index, clean);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (digits[index]) {
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        e.preventDefault();
        next[index - 1] = "";
        commit(next);
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focus(index + 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(index, e.clipboardData.getData("text").slice(0, length - index));
  };

  return (
    <div className={cn("flex gap-2", fullWidth ? "w-full" : "justify-center")}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "text-center text-lg font-bold rounded-md border-2 outline-none transition-all duration-200 text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed",
            fullWidth ? "flex-1 min-w-0 aspect-square" : "w-12 h-12",
            digit ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white",
          )}
        />
      ))}
    </div>
  );
}
