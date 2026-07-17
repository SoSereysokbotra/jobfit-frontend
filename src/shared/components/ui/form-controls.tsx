"use client";

import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

/** Shared label styling so every control lines up with TextField. */
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
    >
      {children}
    </label>
  );
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string>
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  label?: string;
  options: readonly SelectOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
}

/** Labeled native select — matches TextField's height, border and focus ring. */
export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  id,
  className,
  ...props
}: SelectProps<T>) {
  return (
    <div>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <div className="relative rounded-md shadow-sm">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-invalid={error ? true : undefined}
          className={cn(
            "block w-full appearance-none py-2.5 pl-3 pr-10 border bg-white rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200",
            error ? "border-error-500" : "border-neutral-200",
            !value && "text-neutral-400",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-neutral-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
      </div>
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Labeled textarea (bio, descriptions). */
export function Textarea({ label, error, hint, id, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          "block w-full py-2.5 px-3 border bg-white rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200 resize-y",
          error ? "border-error-500" : "border-neutral-200",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-error-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

interface PillMultiSelectProps<T extends string> {
  label?: string;
  options: readonly SelectOption<T>[];
  /** Currently selected values. */
  value: T[];
  onChange: (value: T[]) => void;
  hint?: string;
}

/**
 * Multi-select as a row of toggleable pills. Used for the work preferences,
 * which are arrays on the backend (desiredJobLevels, desiredRemoteTypes, …).
 */
export function PillMultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
}: PillMultiSelectProps<T>) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200",
                selected
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50",
              )}
            >
              {selected && <Check className="w-3.5 h-3.5" />}
              {option.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
