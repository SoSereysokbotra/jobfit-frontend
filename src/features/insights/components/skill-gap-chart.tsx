"use client";

import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { SkillGapDto } from "@/features/matching/api/matching.api";

interface SkillGapChartProps {
  data: SkillGapDto;
}

/**
 * Radar chart showing how a user's résumé covers each stated job requirement.
 *
 * Each axis = one requirement. Two series:
 *   - "Required"  — always 100 (the full bar, giving context)
 *   - "You cover" — 100 if matched, 0 if missing
 *
 * This is a second view of the same data `skill-gap-panel` shows as a list.
 * Using recharts `RadarChart` from the existing recharts dependency (already
 * used on dashboard/page.tsx with AreaChart).
 */
export function SkillGapChart({ data }: SkillGapChartProps) {
  // Build radar data: one datum per requirement (max 10 to keep the chart readable)
  const chartData = data.requirements.slice(0, 10).map((req) => {
    const covered = req.matchedSkills.length > 0 ? 100 : 0;
    // Truncate long requirement text so axis labels don't overlap
    const label =
      req.text.length > 22 ? req.text.slice(0, 20).trimEnd() + "…" : req.text;
    return {
      skill: label,
      "Your résumé": covered,
      Required: 100,
    };
  });

  if (chartData.length === 0) return null;

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} outerRadius="70%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{
              fontSize: 11,
              fill: "var(--color-text-secondary)",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
            tickCount={3}
          />
          {/* Required ring — subtle background reference */}
          <Radar
            name="Required"
            dataKey="Required"
            stroke="#DCC8F5"
            fill="#DCC8F5"
            fillOpacity={0.25}
            strokeWidth={1}
          />
          {/* User coverage — bold primary */}
          <Radar
            name="Your résumé"
            dataKey="Your résumé"
            stroke="#7B2CBF"
            fill="#7B2CBF"
            fillOpacity={0.45}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--color-text-primary)",
              boxShadow: "var(--shadow-md)",
            }}
            formatter={(value: number, name: string) => [
              name === "Required"
                ? "Required"
                : value === 100
                ? "✓ Covered"
                : "✗ Missing",
              name,
            ]}
          />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
