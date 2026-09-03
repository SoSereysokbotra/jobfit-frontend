/**
 * Place lookup (backend module: `location`).
 *
 * WHY THIS EXISTS: the onboarding wizard hardcoded seven US cities plus "Remote" in a
 * REQUIRED field, so a user in Cambodia — or anywhere outside those seven — could not
 * enter their own city at all. The one value that did save split "San Francisco, CA" on
 * the comma and wrote the US state code "CA" into the country column.
 *
 * The lists come from the same table the backend's match scorer resolves against, so a
 * place offered here is one that will actually resolve when a job is scored.
 *
 * SUGGESTIONS, NOT A GATE. The dataset stops at towns of ~15,000 people, so the UI must
 * keep accepting free text; a smaller town has to be typeable, not blocked.
 */

import { apiClient } from "@/lib/api/client";

export interface CountryDto {
  /** ISO-3166 alpha-2, e.g. "KH". */
  code: string;
  name: string;
}

export interface CityDto {
  geonameId: number;
  name: string;
  /** Province/state. NULL for city-states (Singapore) — genuinely absent, not missing. */
  admin1Name: string | null;
  countryCode: string;
  countryName: string;
  population: number;
}

export const locationApi = {
  /** Every country the place dataset covers, alphabetical. */
  countries: () => apiClient.get<CountryDto[]>("/locations/countries"),

  /**
   * City suggestions. Matches display names, ASCII forms and alternate names, so Khmer
   * script and "PNH" both find Phnom Penh. Omit `q` for the country's largest cities.
   */
  cities: (params: { country?: string; q?: string; limit?: number }) => {
    const search = new URLSearchParams();
    if (params.country) search.set("country", params.country);
    if (params.q) search.set("q", params.q);
    if (params.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return apiClient.get<CityDto[]>(`/locations/cities${qs ? `?${qs}` : ""}`);
  },
};
