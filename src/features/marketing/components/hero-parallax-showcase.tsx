"use client";

import React from "react";
import { HeroParallax, type ProductItem } from "@/components/ui/hero-parallax";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const JOBFIT_PRODUCTS: ProductItem[] = [
  {
    title: "Senior Frontend Engineer",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Stripe · SF / Remote",
    salary: "$165K – $210K",
    match: 94,
  },
  {
    title: "Machine Learning Engineer",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Nexus AI · Seattle, WA",
    salary: "$175K – $230K",
    match: 88,
  },
  {
    title: "React Specialist Developer",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Airbnb · Remote (US)",
    salary: "$150K – $195K",
    match: 89,
  },
  {
    title: "Software Engineer – Platforms",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Figma · New York, NY",
    salary: "$140K – $185K",
    match: 85,
  },
  {
    title: "Multi-factor Scoring Engine",
    link: "/signup",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    category: "AI Intelligence",
    company: "Skills & Compensation Alignment",
    salary: "94% Accuracy",
  },
  {
    title: "Instant ATS Resume Scanner",
    link: "/signup",
    thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200&auto=format&fit=crop",
    category: "Resume AI",
    company: "18+ Skills Extracted",
    salary: "ATS Score: 98/100",
  },
  {
    title: "Application Pipeline Tracker",
    link: "/tracker",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    category: "Pipeline",
    company: "Applied → Interview → Offer",
    salary: "15 Active Roles",
  },
  {
    title: "Role-Specific AI Interview Coach",
    link: "/signup",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    category: "Interview Simulation",
    company: "STAR Talking Points",
    salary: "Real-time Feedback",
  },
  {
    title: "Market Compensation Intel",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop",
    category: "Compensation",
    company: "3,400+ Verified Offers",
    salary: "Median: $175K",
  },
  {
    title: "Curated Daily Role Feed",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
    category: "Discovery Feed",
    company: "Zero Spam / Ghost Jobs",
    salary: "24 New Matches",
  },
  {
    title: "Staff Cloud Architect",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Datadog · Remote",
    salary: "$190K – $250K",
    match: 93,
  },
  {
    title: "Senior Full Stack Engineer",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Vercel · Remote",
    salary: "$160K – $215K",
    match: 91,
  },
  {
    title: "Staff Design Systems Lead",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Linear · San Francisco",
    salary: "$180K – $230K",
    match: 95,
  },
  {
    title: "Principal AI Systems Engineer",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Anthropic · San Francisco",
    salary: "$220K – $310K",
    match: 90,
  },
  {
    title: "Lead Mobile Engineer",
    link: "/jobs",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop",
    category: "AI Match",
    company: "Cash App · Remote",
    salary: "$170K – $225K",
    match: 87,
  },
];

function ShowcaseHeader() {
  return (
    <div className="max-w-7xl relative mx-auto pt-2 pb-4 md:pt-4 md:pb-6 px-6 lg:px-8 w-full left-0 top-0 z-20">

      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl"
        style={{ color: "var(--color-text-primary)" }}
      >
        A live, intelligent feed of <br className="hidden sm:inline" />
        <span className="text-gradient-animated">matched opportunities</span>
      </h2>
      <p
        className="max-w-2xl text-sm sm:text-base mt-3 leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Scroll through the live ecosystem: transparent scoring breakdowns, verified market salaries, instant ATS resume extraction, and multi-stage pipeline tracking.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          Explore Live Matches <ArrowRight size={15} />
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 hover:-translate-y-0.5"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text-primary)",
          }}
        >
          Browse All Roles
        </Link>
      </div>
    </div>
  );
}

export function HeroParallaxShowcase() {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <HeroParallax products={JOBFIT_PRODUCTS} header={<ShowcaseHeader />} />
    </section>
  );
}
