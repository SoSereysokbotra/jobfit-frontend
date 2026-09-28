import type { SupportedLocale } from "@/stores/locale-store";
import { en, type MessageKey } from "./messages/en";

export * from "./messages/en";

const CATALOGUES: Record<SupportedLocale, Record<MessageKey, string>> = {
  en,
};

export function translate(
  key: MessageKey,
  locale: SupportedLocale = "en",
  fallback?: string
): string {
  const catalogue = CATALOGUES[locale] || CATALOGUES.en;
  return catalogue[key] || CATALOGUES.en[key] || fallback || key;
}
