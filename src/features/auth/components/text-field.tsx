/**
 * Moved to src/shared/components/ui/text-field.tsx — it is used by the profile
 * forms too, and dev rules §5 keeps shared components in src/shared/components.
 * Re-exported here so the existing `@/features/auth/components` imports keep working.
 */
export { TextField } from "@/shared/components/ui/text-field";
