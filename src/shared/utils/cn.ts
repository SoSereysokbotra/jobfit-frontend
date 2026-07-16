import { clsx, type ClassValue } from "clsx";

/**
 * Merge conditional class names. Thin wrapper around clsx so every component
 * composes classes the same way (see docs/rule_for_develop_frontend.md §2.1).
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
