"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check, Plus, Sliders, Zap, MapPin } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";

interface RoleOption {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  baseReqs: string[];
  skillsList: string[];
  experienceReq: number;
  salaryTarget: number;
}

const DEMO_ROLES: RoleOption[] = [
  {
    id: "frontend",
    title: "Senior Frontend Architect",
    company: "Stripe",
    location: "San Francisco / Remote",
    salary: "$165K – $210K",
    baseReqs: ["React", "TypeScript", "Next.js"],
    skillsList: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind CSS", "Design Systems", "Web Performance", "Testing / Vitest"],
    experienceReq: 5,
    salaryTarget: 180,
  },
  {
    id: "ai",
    title: "Machine Learning / AI Engineer",
    company: "Anthropic",
    location: "Remote (Global)",
    salary: "$190K – $260K",
    baseReqs: ["Python", "PyTorch", "LLM APIs"],
    skillsList: ["Python", "PyTorch", "LLM APIs", "LangChain", "Vector DBs", "Docker", "Kubernetes", "Fine-tuning"],
    experienceReq: 4,
    salaryTarget: 210,
  },
  {
    id: "fullstack",
    title: "Staff Full-Stack Engineer",
    company: "Vercel",
    location: "Remote (US/EU)",
    salary: "$170K – $225K",
    baseReqs: ["TypeScript", "Node.js", "PostgreSQL"],
    skillsList: ["TypeScript", "Node.js", "PostgreSQL", "React", "Next.js", "Redis", "Cloudflare Workers", "CI/CD"],
    experienceReq: 6,
    salaryTarget: 195,
  },
];

export function InteractiveMatchDemo() {
  const [selectedRoleId, setSelectedRoleId] = useState("frontend");
  const activeRole = useMemo(
    () => DEMO_ROLES.find((r) => r.id === selectedRoleId) || DEMO_ROLES[0],
    [selectedRoleId]
  );

  // User's selected skills in the simulator
  const [userSkills, setUserSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "Tailwind CSS",
  ]);

  // Experience level slider (years)
  const [experience, setExperience] = useState(4);

  // Toggle skill
  const toggleSkill = (skill: string) => {
    setUserSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Calculate live score
  const { totalScore, skillScore, expScore, compScore, roleVerdict, verdictColor } = useMemo(() => {
    // 1. Skill alignment (45% weight)
    const matchingSkills = userSkills.filter((s) => activeRole.skillsList.includes(s));
    const skillRatio = Math.min(matchingSkills.length / Math.max(activeRole.skillsList.length * 0.75, 3), 1);
    const calculatedSkillScore = Math.round(50 + skillRatio * 50);

    // 2. Experience alignment (30% weight)
    const expDiff = experience - activeRole.experienceReq;
    let calculatedExpScore = 70;
    if (expDiff >= 0) {
      calculatedExpScore = Math.min(85 + expDiff * 4, 100);
    } else {
      calculatedExpScore = Math.max(60 + expDiff * 8, 40);
    }

    // 3. Comp / Culture alignment (25% weight)
    const calculatedCompScore = 95;

    const calculatedTotal = Math.round(
      calculatedSkillScore * 0.45 + calculatedExpScore * 0.3 + calculatedCompScore * 0.25
    );

    let verdict = "Solid Match";
    let color = "bg-info-50 text-info-600 border-info-200";

    if (calculatedTotal >= 92) {
      verdict = "Exceptional Fit · Top 5% Candidate";
      color = "bg-success-50 text-success-600 border-success-200";
    } else if (calculatedTotal >= 80) {
      verdict = "Strong Match · High Interview Odds";
      color = "bg-primary-50 text-primary-600 border-primary-200";
    } else if (calculatedTotal < 70) {
      verdict = "Skill Gap Identified";
      color = "bg-warning-50 text-warning-600 border-warning-200";
    }

    return {
      totalScore: calculatedTotal,
      skillScore: calculatedSkillScore,
      expScore: calculatedExpScore,
      compScore: calculatedCompScore,
      roleVerdict: verdict,
      verdictColor: color,
    };
  }, [userSkills, activeRole, experience]);

  return (
    <section id="simulator" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Background glow flares */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-primary-100) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-primary-200) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal variant="up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 mb-3">
              <Sparkles size={13} />
              Interactive AI Sandbox
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              See how your match score{" "}
              <span className="text-gradient-animated">dynamically changes</span>
            </h2>
            <p
              className="mt-4 text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Select a target role, toggle your technical capabilities, and watch how
              JobFits evaluates your profile against real hiring thresholds in real time.
            </p>
          </Reveal>
        </div>

        {/* Interactive Workspace Card */}
        <Reveal variant="scale" delay={150}>
          <div
            className="rounded-2xl sm:rounded-3xl border p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Top: Role Selection Segmented Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-6 border-b border-border/70">
              <span className="text-xs font-bold uppercase text-content-tertiary tracking-wider shrink-0">
                Target Role Benchmark:
              </span>
              <div className="p-1 rounded-2xl bg-bg-secondary border border-border flex flex-wrap gap-1">
                {DEMO_ROLES.map((role) => {
                  const isSelected = role.id === selectedRoleId;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setUserSkills(role.baseReqs);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                        isSelected
                          ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                          : "text-content-secondary hover:text-content hover:bg-surface"
                      }`}
                    >
                      {role.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Grid: Controls (Left) vs Real-Time Gauge (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
              {/* Left Column: Toggles & Sliders (7 cols) */}
              <div className="lg:col-span-7 space-y-7">
                {/* Active Job Meta Banner */}
                <div
                  className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3"
                  style={{
                    background: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-content">{activeRole.title}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                        {activeRole.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-content-tertiary mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {activeRole.location}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-content-secondary">
                        {activeRole.salary}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-surface text-content-secondary border border-border">
                    Min Req: {activeRole.experienceReq}+ yrs exp
                  </span>
                </div>

                {/* Skill Toggle Pills */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-content flex items-center gap-1.5">
                      <Sliders size={13} className="text-primary-600" />
                      Toggle Candidate Skills (Tap to add/remove):
                    </label>
                    <span className="text-xs text-content-tertiary">
                      {userSkills.length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeRole.skillsList.map((skill) => {
                      const hasSkill = userSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
                            hasSkill
                              ? "bg-primary-600 text-white shadow-sm ring-1 ring-primary-500"
                              : "bg-surface hover:bg-surface-hover text-content-secondary border border-border hover:border-primary-300"
                          }`}
                        >
                          {hasSkill ? <Check size={12} /> : <Plus size={12} />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-content uppercase tracking-wider">
                      Relevant Experience:
                    </span>
                    <span className="font-extrabold text-sm text-primary-600 dark:text-primary-400">
                      {experience} {experience === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full accent-primary-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-content-tertiary">
                    <span>1 yr (Junior)</span>
                    <span>5 yrs (Senior)</span>
                    <span>10+ yrs (Staff/Lead)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-dashed border-primary-300 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-950/20 text-xs text-content-secondary leading-relaxed flex items-center gap-3">
                  <Zap size={16} className="text-primary-600 shrink-0" />
                  <span>
                    Our semantic AI parser automatically extracts these signals directly from your PDF
                    resume without requiring any manual entry.
                  </span>
                </div>
              </div>

              {/* Right Column: Live Calculated Score Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-primary-200/70 dark:border-primary-800/60 bg-gradient-to-br from-primary-50/50 via-surface to-surface shadow-md">
                <div>
                  {/* Gauge Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
                      Calculated Match Score
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${verdictColor}`}>
                      {roleVerdict}
                    </span>
                  </div>

                  {/* Big Circular Score Display */}
                  <div className="my-6 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="9"
                          className="text-neutral-200 dark:text-neutral-800"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          fill="transparent"
                          stroke="var(--color-primary-600)"
                          strokeWidth="9"
                          strokeDasharray={301.6}
                          strokeDashoffset={301.6 - (301.6 * totalScore) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-content tracking-tight">
                          {totalScore}%
                        </span>
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-0.5">
                          Match Index
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Progress Bars */}
                  <div className="space-y-3 pt-2">
                    {/* Tech Skills */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-content">Technical Skills (45%)</span>
                        <span className="text-primary-600 font-bold">{skillScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 transition-all duration-500 rounded-full"
                          style={{ width: `${skillScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-content">Experience Match (30%)</span>
                        <span className="text-primary-600 font-bold">{expScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 transition-all duration-500 rounded-full"
                          style={{ width: `${expScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Salary / Location */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-content">Compensation & Culture (25%)</span>
                        <span className="text-primary-600 font-bold">{compScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success-500 transition-all duration-500 rounded-full"
                          style={{ width: `${compScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA within card */}
                <div className="mt-8 pt-4 border-t border-border/70">
                  <Link
                    href="/signup"
                    className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Upload Your Resume For Real Score</span>
                    <ArrowRight size={14} />
                  </Link>
                  <p className="text-[11px] text-center text-content-tertiary mt-2">
                    Takes 30 seconds · No credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
