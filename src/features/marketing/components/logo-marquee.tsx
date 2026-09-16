import React from "react";
import { cn } from "@/shared/utils/cn";

export interface MarqueeLogo {
  src: string;
  /** Platform name shown beside the mark. */
  label: string;
  /**
   * The asset is a wordmark on an opaque background (Indeed ships dark blue,
   * Khmer24 ships white) rather than a transparent square icon. Those render
   * as a rounded chip at a wider box, and with no text label — the image
   * already spells the platform out.
   */
  wordmark?: boolean;
}

interface LogoMarqueeProps {
  logos: MarqueeLogo[];
  /** Scroll right-to-left (default) or left-to-right. */
  direction?: "left" | "right";
  /** Color the edge fades blend into — match the section background. */
  fadeColor?: string;
  className?: string;
}

/**
 * Infinite auto-scrolling logo strip. The row is rendered twice inside a
 * w-max track so the -50% keyframe loops seamlessly. Pauses on hover;
 * static under prefers-reduced-motion.
 *
 * Every entry renders in an identically sized box so mixed square icons and
 * wordmarks still align optically, and the marks sit desaturated until
 * hover — full-color third-party logos otherwise pull more attention than
 * the hero itself.
 */
export function LogoMarquee({
  logos,
  direction = "left",
  fadeColor = "var(--color-bg)",
  className,
}: LogoMarqueeProps) {
  const row = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} className="flex items-center shrink-0">
      {logos.map((logo) => (
        <div
          key={`${logo.src}${ariaHidden ? "-dup" : ""}`}
          className="flex items-center gap-2.5 mx-7 select-none opacity-70 transition-opacity duration-200 hover:opacity-100"
        >
          {/* Fixed-height box keeps 512² icons and the wordmarks on one
              baseline; opaque-background wordmarks get clipped to a rounded
              chip so they read as deliberate rather than as stray boxes. */}
          <span
            className={cn(
              "flex items-center justify-center h-8 shrink-0",
              logo.wordmark ? "w-auto rounded-md overflow-hidden" : "w-8"
            )}
          >
            <img
              src={logo.src}
              alt={ariaHidden ? "" : logo.label}
              className={cn(
                "object-contain",
                logo.wordmark ? "h-8 w-auto max-w-none" : "h-8 w-8"
              )}
            />
          </span>
          {/* A wordmark already spells the platform out — a text label
              beside it would print the name twice. */}
          {!logo.wordmark && (
            <span
              className="text-sm font-bold tracking-tight whitespace-nowrap"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {logo.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden w-full", className)}>
      {/* Moving track: two identical rows = seamless -50% loop */}
      <div
        className={cn(
          "flex w-max",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse",
        )}
      >
        {row(false)}
        {row(true)}
      </div>

      {/* Edge fades — wide enough that marks dissolve rather than clip. */}
      <div
        className="absolute inset-y-0 left-0 w-24 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }}
      />
    </div>
  );
}
