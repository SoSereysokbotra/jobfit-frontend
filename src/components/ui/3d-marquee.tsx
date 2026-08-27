"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useTransform,
  useScroll,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/shared/utils/cn";

const COLUMN_COUNT = 4;

/**
 * Per-column parallax multipliers. Signs alternate and magnitudes differ so
 * scrolling pulls the columns apart from each other, instead of sliding the
 * whole plane as one rigid block.
 */
const COLUMN_DEPTH = [0.8, -0.5, 0.6, -1.0];

type MarqueeColumnProps = {
  tiles: ReactNode[];
  columnIndex: number;
  progress: MotionValue<number>;
  travel: number;
};

/**
 * One column of the plane.
 */
function MarqueeColumn({
  tiles,
  columnIndex,
  progress,
  travel,
}: MarqueeColumnProps) {
  const prefersReducedMotion = useReducedMotion();
  const depth = COLUMN_DEPTH[columnIndex % COLUMN_DEPTH.length] * travel;
  const parallaxY = useTransform(progress, [0, 1], [-depth, depth]);

  return (
    <motion.div
      style={prefersReducedMotion ? undefined : { y: parallaxY }}
      className="flex w-full flex-col gap-6 md:gap-8"
    >
      {tiles.map((tile, tileIndex) => (
        <div key={tileIndex} className="w-full">
          {tile}
        </div>
      ))}
    </motion.div>
  );
}

export type ThreeDMarqueeProps = {
  /**
   * Rendered in reading order and split evenly across four columns.
   */
  tiles?: ReactNode[];
  /**
   * Alternative image URLs array for standard demo compatibility.
   */
  images?: string[];
  /**
   * Scroll progress, 0 → 1, driving the parallax.
   */
  progress?: MotionValue<number>;
  /** Peak parallax travel in px, for the deepest column. */
  travel?: number;
  className?: string;
};

/**
 * A grid of tiles laid on a plane tilted back in 3D, parallaxing with scroll.
 */
export function ThreeDMarquee({
  tiles: userTiles,
  images,
  progress: userProgress,
  travel = 300,
  className,
}: ThreeDMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: defaultScrollProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothDefaultProgress = useSpring(defaultScrollProgress, {
    stiffness: 300,
    damping: 45,
    restDelta: 0.001,
  });

  const progress = userProgress ?? smoothDefaultProgress;

  // Build tiles from images if tiles prop wasn't provided directly
  const tiles =
    userTiles ??
    (images
      ? images.map((src, i) => (
          <div
            key={i}
            className="aspect-[3/2] w-full overflow-hidden rounded-xl border border-border/40 bg-card/60 p-2 shadow-sm backdrop-blur-xs"
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`Tile ${i}`}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
          </div>
        ))
      : []);

  const chunkSize = Math.ceil(tiles.length / COLUMN_COUNT);
  const columns = Array.from({ length: COLUMN_COUNT }, (_, columnIndex) =>
    tiles.slice(columnIndex * chunkSize, columnIndex * chunkSize + chunkSize)
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative size-full overflow-hidden", className)}
    >
      <div className="flex size-full items-center justify-center">
        <div className="marquee-3d-stage shrink-0 scale-60 sm:scale-75 lg:scale-90">
          <div className="marquee-3d-plane relative grid size-full origin-center grid-cols-4 gap-6 md:gap-8">
            {columns.map((column, columnIndex) => (
              <MarqueeColumn
                key={columnIndex}
                tiles={column}
                columnIndex={columnIndex}
                progress={progress}
                travel={travel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThreeDMarqueeDemo() {
  const images = [
    "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
    "https://assets.aceternity.com/animated-modal.png",
    "https://assets.aceternity.com/animated-testimonials.webp",
    "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
    "https://assets.aceternity.com/github-globe.png",
    "https://assets.aceternity.com/glare-card.png",
    "https://assets.aceternity.com/layout-grid.png",
    "https://assets.aceternity.com/flip-text.png",
    "https://assets.aceternity.com/hero-highlight.png",
    "https://assets.aceternity.com/carousel.webp",
    "https://assets.aceternity.com/placeholders-and-vanish-input.png",
    "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
    "https://assets.aceternity.com/signup-form.png",
    "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
    "https://assets.aceternity.com/spotlight-new.webp",
    "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
    "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
    "https://assets.aceternity.com/tabs.png",
    "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
    "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
    "https://assets.aceternity.com/glowing-effect.webp",
    "https://assets.aceternity.com/hover-border-gradient.png",
    "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
    "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
    "https://assets.aceternity.com/macbook-scroll.png",
    "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
    "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
    "https://assets.aceternity.com/multi-step-loader.png",
    "https://assets.aceternity.com/vortex.png",
    "https://assets.aceternity.com/wobble-card.png",
    "https://assets.aceternity.com/world-map.webp",
  ];
  return (
    <div className="mx-auto my-10 max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}
