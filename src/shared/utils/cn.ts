import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names. Thin wrapper around clsx so every component
 * composes classes the same way (see docs/rule_for_develop_frontend.md §2.1).
 * twMerge resolves conflicting Tailwind utilities, so a caller's `className`
 * wins over a component's own defaults.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
