import React from "react";

interface AuthHeadingProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Optional icon rendered in a circular badge above the title. */
  icon?: React.ReactNode;
}

/** Title + subtitle block used at the top of each auth form. */
export function AuthHeading({ title, subtitle, icon }: AuthHeadingProps) {
  return (
    <div>
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 border border-primary-100 mb-4">
          {icon}
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
}
