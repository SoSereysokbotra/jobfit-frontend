"use client";

import React from "react";
import { Reveal } from "@/shared/components/motion/reveal";
import { Sparkles, ShieldCheck, Zap, TrendingUp, CheckCircle2 } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  subtext: string;
  icon: React.ElementType;
  badge?: string;
}

const STATS: StatItem[] = [
  {
    value: "94.8%",
    label: "Match Precision",
    subtext: "Multi-factor semantic scoring across skills & culture",
    icon: Sparkles,
    badge: "Audited",
  },
  {
    value: "15,000+",
    label: "Verified Tech Roles",
    subtext: "Zero ghost listings or stale job board reposts",
    icon: ShieldCheck,
    badge: "Live Feed",
  },
  {
    value: "3.4x",
    label: "Faster Interviews",
    subtext: "First interview invites landed in under 7 days",
    icon: Zap,
    badge: "Accelerated",
  },
  {
    value: "$175K",
    label: "Median Placement",
    subtext: "Verified salary intelligence & equity insights",
    icon: TrendingUp,
    badge: "Market Intel",
  },
];

export function StatsBanner() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Reveal variant="scale" delay={80}>
        <div
          className="relative rounded-2xl sm:rounded-3xl border border-border/80 p-6 sm:p-8 md:p-9 shadow-xl overflow-hidden backdrop-blur-xl bg-surface"
        >
          {/* Subtle ambient gradient mesh behind cards */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--color-primary-500) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Top proof indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-success-600 dark:text-success-500">
                Live AI Engine Benchmarks
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-content-tertiary">
              <CheckCircle2 size={13} className="text-primary-600 dark:text-primary-400" />
              <span>Calibrated against 120,000+ real tech candidate applications</span>
            </div>
          </div>

          {/* 4-Stat Grid with Divider lines on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-6">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              const isLast = idx === STATS.length - 1;
              return (
                <div
                  key={stat.label}
                  className={`relative flex flex-col justify-between group ${
                    !isLast ? "lg:border-r lg:border-border/60 lg:pr-8" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-800/40 group-hover:scale-105 transition-transform duration-200">
                        <Icon size={17} />
                      </div>
                      {stat.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-secondary text-content-secondary border border-border">
                          {stat.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gradient font-mono">
                      {stat.value}
                    </div>
                    <div className="text-sm font-bold mt-1 text-content">
                      {stat.label}
                    </div>
                  </div>
                  <p className="text-xs text-content-secondary mt-2 leading-relaxed">
                    {stat.subtext}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
