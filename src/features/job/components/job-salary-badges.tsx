import React from "react";

interface JobSalaryBadgesProps {
  baseMin: number;
  baseMax: number;
  bonus?: number;
}

export function JobSalaryBadges({ baseMin, baseMax, bonus }: JobSalaryBadgesProps) {
  // Simple calculation for mock total comp
  const baseAvg = (baseMin + baseMax) / 2;
  const bonusVal = bonus || 15;
  const totalComp = Math.round(baseAvg * (1 + bonusVal / 100));

  return (
    <div className="flex flex-wrap gap-3 my-4">
      <div
        className="px-4 py-2 rounded-lg border"
        style={{
          borderColor: "var(--color-success-100)",
          background: "var(--color-success-50)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--color-success-600)" }}>
          Base Salary
        </p>
        <p className="text-lg font-bold" style={{ color: "var(--color-success-600)" }}>
          ${baseMin}K–${baseMax}K
        </p>
      </div>
      <div
        className="px-4 py-2 rounded-lg border"
        style={{
          borderColor: "var(--color-primary-100)",
          background: "var(--color-primary-50)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--color-primary-600)" }}>
          Total Comp (est.)
        </p>
        <p className="text-lg font-bold" style={{ color: "var(--color-primary-700)" }}>
          ~${totalComp}K
        </p>
      </div>
      <div
        className="px-4 py-2 rounded-lg border"
        style={{
          borderColor: "var(--color-warning-100)",
          background: "var(--color-warning-50)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--color-warning-600)" }}>
          Bonus
        </p>
        <p className="text-lg font-bold" style={{ color: "var(--color-warning-600)" }}>
          {bonusVal}%
        </p>
      </div>
    </div>
  );
}
