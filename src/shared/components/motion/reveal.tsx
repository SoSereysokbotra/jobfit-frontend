"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
  fade: "reveal-fade",
};

interface RevealProps {
  children: React.ReactNode;
  /** Direction / style of the entrance. Defaults to a subtle slide-up. */
  variant?: RevealVariant;
  /** Stagger delay in milliseconds before this element animates in. */
  delay?: number;
  /** Element tag to render. Defaults to a div. */
  as?: React.ElementType;
  /** Re-animate every time it enters the viewport (default: once). */
  repeat?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Scroll-triggered reveal wrapper. Starts hidden + offset, then toggles the
 * `.is-visible` class (see globals.css) once the element scrolls into view.
 * Stagger sibling elements by passing an increasing `delay`. Respects
 * `prefers-reduced-motion` — the CSS shows content immediately in that case.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  repeat = false,
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Guard for SSR / older browsers — reveal immediately if unsupported.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (!repeat) observer.unobserve(entry.target);
        } else if (repeat) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat]);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", VARIANT_CLASS[variant], visible && "is-visible", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
