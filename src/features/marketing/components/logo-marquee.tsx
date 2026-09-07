import React from "react";
import { cn } from "@/shared/utils/cn";

export interface MarqueeLogo {
  src: string;
  /** Company/platform name shown beside the icon (omit for wordmark images). */
  label?: string;
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
          className="flex items-center gap-3 mx-8 select-none"
        >
          <img
            src={logo.src}
            alt={ariaHidden ? "" : logo.label ?? ""}
            className={logo.label ? "w-10 h-10   object-contain" : "h-10 w-auto object-contain"}
          />
          {logo.label && (
            <span
              className="text-base font-bold tracking-tight whitespace-nowrap"
              style={{ color: "var(--color-neutral-500)" }}
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

      {/* Edge fades */}
      <div
        className="absolute inset-y-0 left-0 w-16 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-16 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }}
      />
    </div>
  );
}
