import type { SupportedLocale } from "@/stores/locale-store";
import { en, type MessageKey } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { de } from "./messages/de";
import { km } from "./messages/km";

export * from "./locales";
export * from "./messages/en";

const CATALOGUES: Record<SupportedLocale, Record<MessageKey, string>> = {
  en,
  es,
  fr,
  de,
  km,
};

export function translate(
  key: MessageKey,
  locale: SupportedLocale = "en",
  fallback?: string
): string {
  const catalogue = CATALOGUES[locale] || CATALOGUES.en;
  return catalogue[key] || CATALOGUES.en[key] || fallback || key;
}
