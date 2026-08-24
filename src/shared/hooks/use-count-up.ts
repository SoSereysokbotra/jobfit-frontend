"use client";

import { useEffect, useState } from "react";

/**
 * Smoothly animates a numeric value from 0 to `target` using requestAnimationFrame
 * with an ease-out curve. Respects `prefers-reduced-motion`.
 */
export function useCountUp(target: number, durationMs = 800): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If reduced motion is preferred, jump straight to target
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurrent(target);
      return;
    }

    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-out cubic: 1 - (1 - progress)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * easeOut));

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    const handle = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(handle);
  }, [target, durationMs]);

  return current;
}
