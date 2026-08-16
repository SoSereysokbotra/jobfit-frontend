"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useLocaleStore, type SupportedLocale } from "@/stores/locale-store";
import { translate, type MessageKey } from "@/shared/i18n";
import {
  formatPostedDate as formatRelativeDateHelper,
  formatSalaryRange as formatSalaryRangeHelper,
  formatCurrency as formatCurrencyHelper,
  formatDate as formatDateHelper,
  formatNumber as formatNumberHelper,
} from "@/shared/utils/formatters";

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: MessageKey, fallback?: string) => string;
  formatPostedDate: (daysAgo: number) => string;
  formatSalaryRange: (job: { salaryMin: number; salaryMax: number }, currency?: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useLocaleStore();

  const t = useCallback(
    (key: MessageKey, fallback?: string) => translate(key, locale, fallback),
    [locale]
  );

  const formatPostedDate = useCallback(
    (daysAgo: number) => formatRelativeDateHelper(daysAgo, locale),
    [locale]
  );

  const formatSalaryRange = useCallback(
    (job: { salaryMin: number; salaryMax: number }, currency?: string) =>
      formatSalaryRangeHelper(job, locale, currency),
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currency?: string) => formatCurrencyHelper(amount, currency, locale),
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDateHelper(date, options, locale),
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumberHelper(value, options, locale),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      formatPostedDate,
      formatSalaryRange,
      formatCurrency,
      formatDate,
      formatNumber,
    }),
    [
      locale,
      setLocale,
      t,
      formatPostedDate,
      formatSalaryRange,
      formatCurrency,
      formatDate,
      formatNumber,
    ]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    // Graceful fallback outside provider
    return {
      locale: "en" as SupportedLocale,
      setLocale: () => {},
      t: (key: MessageKey, fallback?: string) => translate(key, "en", fallback),
      formatPostedDate: (daysAgo: number) => formatRelativeDateHelper(daysAgo, "en"),
      formatSalaryRange: (job: { salaryMin: number; salaryMax: number }) =>
        formatSalaryRangeHelper(job, "en"),
      formatCurrency: (amount: number) => formatCurrencyHelper(amount, "USD", "en"),
      formatDate: (date: Date | string | number) => formatDateHelper(date, undefined, "en"),
      formatNumber: (value: number) => formatNumberHelper(value, undefined, "en"),
    };
  }
  return context;
}

export const useLocale = useTranslation;
