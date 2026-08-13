"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ApplicationView } from "@/features/application/api/application.mappers";

interface ApplicationsChartProps {
  applications: ApplicationView[];
}

/**
 * Applications submitted over time — bucketed by the month of `appliedAt`.
 *
 * Data decision (per UI_ENHANCEMENT_PLAN.md §2c): derived client-side by
 * bucketing the user's applications list by `appliedAt`. Honest, works today,
 * limited to applications the client can fetch. No new backend endpoint needed.
 *
 * Chart style mirrors dashboard/page.tsx AreaChart with recharts.
 * Colors from the design system: primary-600 (#7B2CBF) stroke, primary-500
 * (#9D4EDD) fill at 15% opacity — matching the UI reference Area chart pattern.
 */
export function ApplicationsChart({ applications }: ApplicationsChartProps) {
  const chartData = useMemo(() => {
    if (applications.length === 0) return [];

    // Bucket by "YYYY-MM" key, count per month
    const buckets: Record<string, number> = {};
    for (const app of applications) {
      const date = new Date(app.appliedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = (buckets[key] ?? 0) + 1;
    }

    // Sort by date ascending
    const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));

    // Format month key to a short label: "Jan '25"
    return sorted.map(([key, count]) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString(
        "en-US",
        { month: "short", year: "2-digit" }
      );
      return { month: label, Applications: count };
    });
  }, [applications]);

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
        No application history yet.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9D4EDD" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#9D4EDD" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--color-text-tertiary)", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--color-text-tertiary)", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
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
            cursor={{ stroke: "var(--color-primary-300)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="Applications"
            stroke="#7B2CBF"
            strokeWidth={2}
            fill="url(#appGradient)"
            dot={{ r: 4, fill: "#7B2CBF", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#5A189A", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
