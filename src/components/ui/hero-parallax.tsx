"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Sparkles, MapPin, DollarSign } from "lucide-react";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";

export type ProductItem = {
  title: string;
  link: string;
  thumbnail: string;
  category?: string;
  company?: string;
  salary?: string;
  match?: number;
};

export const HeroParallax = ({
  products,
  header,
  className,
}: {
  products: ProductItem[];
  header?: React.ReactNode;
  className?: string;
}) => {
  const half = Math.ceil(products.length / 2);
  const firstRow = products.slice(0, half);
  const secondRow = products.slice(half);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 750]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -750]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.25], [6, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.15], [0.5, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.25], [4, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [-80, 0]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-[100dvh] h-[130vh] md:h-[150vh] pt-6 md:pt-10 pb-12 md:pb-20 overflow-hidden antialiased relative flex flex-col justify-center self-auto [perspective:1200px] [transform-style:preserve-3d]",
        className
      )}
    >
      {header || <Header />}
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="w-full flex-1 flex flex-col justify-center"
      >
        {/* Row 1: Auto moves right-to-left, pauses on hover */}
        <div className="mb-4 sm:mb-6 md:mb-8 overflow-hidden">
          <ParallaxMarqueeRow
            items={firstRow}
            translate={translateXReverse}
            speed={38}
            direction="left"
          />
        </div>

        {/* Row 2: Auto moves right-to-left, pauses on hover */}
        <div className="overflow-hidden">
          <ParallaxMarqueeRow
            items={secondRow}
            translate={translateX}
            speed={42}
            direction="left"
          />
        </div>
      </motion.div>
    </div>
  );
};

function ParallaxMarqueeRow({
  items,
  translate,
  speed = 38,
  direction = "left",
}: {
  items: ProductItem[];
  translate?: MotionValue<number>;
  speed?: number;
  direction?: "left" | "right";
}) {
  const [isHovered, setIsHovered] = useState(false);
  // Duplicate for seamless loop
  const loopItems = [...items, ...items, ...items];

  return (
    <motion.div
      style={translate ? { x: translate } : undefined}
      className="w-full overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex space-x-6 md:space-x-10 w-max",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
        )}
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isHovered ? "paused" : "running",
        }}
      >
        {loopItems.map((product, idx) => (
          <ProductCard product={product} key={`${product.title}-${idx}`} />
        ))}
      </div>
    </motion.div>
  );
}

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-8 md:py-12 px-6 w-full left-0 top-0 z-20">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 border border-primary-200 dark:border-primary-800 mb-3">
        <Sparkles size={13} /> The Intelligent Career Ecosystem
      </span>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
        Everything you need to <br className="hidden sm:inline" />
        <span className="text-gradient-animated">land your next breakthrough</span>
      </h1>
      <p className="max-w-2xl text-sm sm:text-base md:text-lg mt-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        Explore live matching models, resume intelligence, pipeline tracking, and compensation benchmarks built to turn career progression into an unfair advantage.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: ProductItem;
  translate?: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={translate ? { x: translate } : undefined}
      key={product.title}
      className="h-48 w-72 sm:h-56 sm:w-84 md:h-64 md:w-96 lg:h-72 lg:w-[27rem] xl:h-76 xl:w-[30rem] relative shrink-0 rounded-2xl md:rounded-3xl overflow-hidden border border-border/60 bg-card shadow-lg cursor-pointer"
    >
      <Link
        href={product.link}
        className="block h-full w-full relative overflow-hidden"
      >
        <Image
          src={product.thumbnail}
          height="600"
          width="800"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 z-10 flex flex-col justify-end">
          {product.category && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-600/90 text-white backdrop-blur-md shadow-sm w-fit mb-1.5">
              {product.category}
            </span>
          )}

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug drop-shadow-md truncate">
                {product.title}
              </h3>
              {(product.company || product.salary) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs sm:text-sm text-neutral-200 mt-1 font-medium">
                  {product.company && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {product.company}
                    </span>
                  )}
                  {product.salary && (
                    <span className="flex items-center gap-1 text-success-400 font-bold">
                      <DollarSign size={12} /> {product.salary}
                    </span>
                  )}
                </div>
              )}
            </div>

            {product.match && (
              <div className="shrink-0">
                <MatchScoreBadge score={product.match} size="sm" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const products = [
  {
    title: "Moonbeam",
    link: "https://gomoonbeam.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/moonbeam.png",
  },
  {
    title: "Cursor",
    link: "https://cursor.so",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/cursor.png",
  },
  {
    title: "Rogue",
    link: "https://userogue.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/rogue.png",
  },
  {
    title: "Editorially",
    link: "https://editorially.org",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/editorially.png",
  },
  {
    title: "Editrix AI",
    link: "https://editrix.ai",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/editrix.png",
  },
  {
    title: "Pixel Perfect",
    link: "https://app.pixelperfect.quest",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/pixelperfect.png",
  },
  {
    title: "Algochurn",
    link: "https://algochurn.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/algochurn.png",
  },
  {
    title: "Aceternity UI",
    link: "https://ui.aceternity.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/aceternityui.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/smartbridge.png",
  },
  {
    title: "Renderwork Studio",
    link: "https://renderwork.studio",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/renderwork.png",
  },
  {
    title: "Creme Digital",
    link: "https://cremedigital.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/cremedigital.png",
  },
  {
    title: "Golden Bells Academy",
    link: "https://goldenbellsacademy.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png",
  },
  {
    title: "Invoker Labs",
    link: "https://invoker.lol",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/invoker.png",
  },
  {
    title: "E Free Invoice",
    link: "https://efreeinvoice.com",
    thumbnail:
      "https://www.aceternity.com/images/products/thumbnails/new/efreeinvoice.png",
  },
];

export function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}
