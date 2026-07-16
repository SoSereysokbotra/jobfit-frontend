import React from "react";

export interface PasswordStrength {
  score: number; // 0–4
  label: string;
  /** Token-backed bar color class. */
  color: string;
  /** Tailwind width class for the fill. */
  width: string;
}

const LEVELS: Record<number, PasswordStrength> = {
  0: { score: 0, label: "Weak", color: "bg-error-500", width: "w-1/4" },
  1: { score: 1, label: "Weak", color: "bg-error-500", width: "w-1/4" },
  2: { score: 2, label: "Fair", color: "bg-warning-500", width: "w-2/4" },
  3: { score: 3, label: "Good", color: "bg-primary-400", width: "w-3/4" },
  4: { score: 4, label: "Strong", color: "bg-success-500", width: "w-full" },
};

/** Compute a 0–4 password strength score using the auth rules. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: "bg-neutral-200", width: "w-0" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return LEVELS[score] ?? LEVELS[1];
}

/** Strength bar + label. Renders nothing until a password is typed. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-neutral-500">Strength: {strength.label}</span>
        <span className="text-neutral-400">Min 8 chars, 1 upper, 1 num</span>
      </div>
    </div>
  );
}
