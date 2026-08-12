# Frontend UI enhancement — making the app feel finished

> Created 2026-08-10. Frontend only, no backend work required except where a phase
> says otherwise (Phase 3 and Phase 4 each name one missing endpoint and both have a
> client-side fallback).
>
> The UI is built: 43 pages, a full design system, and a component library. `tsc --noEmit`
> passes clean and `npm run lint` reports 0 errors. This plan is not about fixing a broken
> app — it is about the gap between "every screen exists" and "this feels like a product".

---

## Why now

Three things showed up when reading the codebase that are worth naming together, because
they have the same shape: **the scaffolding was laid and never filled in.**

| # | What | Evidence |
|---|---|---|
| 1 | The top-bar search does nothing | `topnav.tsx:45` — an `<input>` with no `value`, no `onChange`, no form |
| 2 | "Career Insights" has no charts | `insights/page.tsx` uses hand-rolled `<div>` bars; 3 chart components are 0-byte files |
| 3 | Two differentiating features are empty files | `job-compare-store.ts`, `swipe-deck.tsx` — both 0 bytes |
| 4 | Entrance motion stops at the marketing site | `Reveal` is used in 4 files, all under `features/marketing/` |

None of these are bugs. Everything renders, nothing throws. But #1 is the most prominent
control on every logged-in page and it is decorative, and #2 is a page named *Insights*
that shows no insight beyond four counters.

The ordering below is by **payoff per unit of work**, not by how broken something is.

---

## Phase 1 — Make the search bar real, as a command palette

**The problem.** `topnav.tsx:45-62` renders a search input with the placeholder
*"Search jobs, companies, skills…"*. It has an `onFocus` and an `onBlur` that change its
border colour, and that is the entire behaviour. No `value`, no `onChange`, no `onSubmit`,
no wrapping `<form>`. A user types their dream job into the most prominent control on the
page and presses Enter, and nothing happens. The mobile overlay at `topnav.tsx:92` has the
same dead input.

**Why a palette instead of just wiring it to `/jobs`.** Wiring it to a redirect is thirty
minutes and fixes the lie. A ⌘K palette is about a day and changes how the app feels — and
every piece it needs already exists:

| Need | Already built |
|---|---|
| Live job search | `useJobs(params)` → `GET /jobs`, and `SearchJobsParams.q` is already the free-text field (`job.api.ts:72`) |
| Debouncing keystrokes | `useDebounce` (`shared/hooks/use-debounce.ts`) |
| The route list | `sidebar.tsx:56-88` — already grouped and labelled with icons |
| Overlay + scrim | `modal.tsx`, `--color-scrim`, `--z-modal` |

**Build:**

- `src/shared/components/ui/command-palette.tsx` — overlay, input, grouped results,
  arrow-key navigation, Enter to activate, Escape to close.
- Bind ⌘K / Ctrl+K globally; make the `topnav` input a button that opens the palette
  rather than an input that pretends to be one. Show the `⌘K` hint inside it.
- Three result groups: **Jobs** (live, debounced, via `useJobs({ q })`), **Go to** (the
  sidebar routes, fuzzy-matched), **Actions** (Upload résumé, Sign out, and — once Phase 6
  lands — Toggle theme).
- Persist recent searches to `localStorage`. Follow the `useSyncExternalStore` +
  `localStorage` pattern already established in `stores/ui-store.ts` rather than inventing
  a second one.

**Note.** Lift the route list out of `sidebar.tsx` into a shared module first, so the
sidebar and the palette read from one source. Two copies of the nav tree will drift.

**Depends on:** nothing.

---

## Phase 2 — Give the Insights page its charts

**The problem.** `insights/page.tsx` is 125 lines and imports no chart library. It renders
four `StatCard`s and then a `FunnelBar` (`insights/page.tsx:103`) that is a hand-rolled
`<div>` with an animated `width`. Meanwhile `recharts` is a dependency, it is already used
properly on `dashboard/page.tsx:240` (an `AreaChart` with a custom tooltip), and three
component files exist for exactly this purpose and are **all 0 bytes**:

- `features/insights/components/applications-chart.tsx`
- `features/insights/components/salary-insights-chart.tsx`
- `features/insights/components/skill-gap-chart.tsx`

**Build, in this order:**

**2a — Skill-gap radar** (`skill-gap-chart.tsx`). The highest-impact chart on the list. A
radar overlaying the user's skill levels against a role's requirements communicates the
product's entire value proposition in one glance. `useSkillGap(jobId)` already exists
(`matching/hooks/use-skill-gap.ts`) and is backed by a real endpoint, and
`skill-gap-panel.tsx` already renders the same data as a list — the radar is a second view
of data you already have.

**2b — Funnel chart** (replacing `FunnelBar`). Straight swap of the hand-rolled bars for a
real recharts funnel, fed by the same `useMyStats()` fields.

**2c — Applications over time** (`applications-chart.tsx`). **Blocked on data, not on UI.**
`GET /analytics/my-stats` returns point-in-time totals only — there is no time series in
`MyStatsDto` (`insights.api.ts`). Two options, and the choice should be deliberate:
   - Derive the series client-side by bucketing the user's applications list by
     `appliedAt`. Honest, works today, limited to applications the client can fetch.
   - Ask the backend for `GET /analytics/my-stats/timeseries`. Better, but it is a new
     endpoint.

   Recommendation: derive client-side now, because it ships this phase.

**Do not** build `salary-insights-chart.tsx` yet. There is no salary benchmark source —
`insights.api.ts` says so, `insights/page.tsx:84` already renders an honest "coming soon"
card, and `offer.api.ts:154` has the same gap. A chart there would be fabricated data.
Leave the placeholder until the endpoint exists.

**Depends on:** nothing. 2c has a data decision inside it.

---

## Phase 3 — Job comparison

**The problem.** `stores/job-compare-store.ts` is a 0-byte file. Someone planned this and
stopped.

**Why it is worth building.** Side-by-side job comparison is rare and genuinely useful, and
JobFits is unusually well-placed to do it well because it has a *match score* to compare on
— which is the one column a generic job board cannot fill.

**Build:**

- `job-compare-store.ts` — a small selection store (max 3 jobs). Copy the
  `useSyncExternalStore` + `localStorage` shape from `ui-store.ts`; it already solves SSR
  hydration correctly with `getServerSnapshot`, and that is the part that is easy to get
  wrong.
- A compare checkbox on `job-card.tsx`, and a docked bar showing selected jobs with a
  **Compare** action once ≥2 are picked.
- `/jobs/compare` — a table across: match score, salary range, location / remote type,
  employment type, experience level, skills matched, skills missing, posted date.
- Highlight the winning cell per row. That is what makes the table feel considered rather
  than dumped.

**Note on data.** Per-job match scores come from `useJobMatch(jobId)`
(`matching/hooks/use-job-match.ts`), which is per-job — comparing 3 jobs means 3 queries.
That is fine at this size; react-query will cache them and most will already be warm from
the cards. Do not build a batch endpoint for three rows.

**Depends on:** nothing.

---

## Phase 4 — Swipe deck

**The problem.** `features/matching/components/swipe-deck.tsx` is 0 bytes, and so is
`hooks/use-match-feedback.ts` next to it.

**Why.** This is the most demo-able feature in the plan. Card-stack job triage — swipe right
to save, left to dismiss — is immediately understandable, it is fun, and it fits mobile,
where the bottom tab bar already gives the app a native feel.

**Build:**

- `swipe-deck.tsx` — pointer-event drag with rotation and opacity tied to displacement,
  snap-back under threshold, fly-out over it. Keyboard equivalents (← / →) are not optional;
  a mouse-and-keyboard user on the desktop site must be able to use it.
- Wire right-swipe to the **existing, working** saved-jobs mutation (per `MEMORY.md`,
  saved-jobs is fully backend-integrated) — not to a new endpoint.
- Left-swipe feeds `use-match-feedback.ts`. **There is no endpoint for this** — `matching.api.ts`
  exposes exactly three methods (`matchForJob`, `skillGap`, `recommendations`) and none of them
  record feedback. So: keep dismissals client-side for the session and mark it `TODO(backend)`
  in the visible UI, matching the pattern `parsed-data-view` established (per
  `docs/continue.md`). Right-swipe still persists properly, because saved-jobs is real.
- Surface it as a view toggle on `/recommendations`, not a replacement — deck vs. list.
- Respect `prefers-reduced-motion`: fall back to buttons, no fly-out animation.

**Depends on:** nothing. Ships half-persistent by design; the dismiss half needs a backend
decision eventually.

---

## Phase 5 — Internationalisation

**The scale, honestly.** 43 pages of hardcoded English strings, no i18n library, and `Intl`
is used exactly **once** in the whole codebase (`offer-thread-modal.tsx:20`). This is the
largest phase in the plan by a wide margin. It should be staged, and it should not be
started in the middle of another phase.

**5a — Locale-correct formatting (do this regardless of whether i18n ships).** These are
small, they improve the app on their own, and they are the groundwork:

- `formatPostedDate` (`shared/types/shared.types.ts:88`) hardcodes `"Posted today"`,
  `"Posted yesterday"`, `` `Posted ${daysAgo} days ago` ``. Replace with
  `Intl.RelativeTimeFormat`.
- Route every salary and date through `Intl.NumberFormat` / `Intl.DateTimeFormat`. They are
  currently formatted by hand everywhere except that one offer modal.

**5b — Library and infrastructure.** `next-intl` (App-Router native). Locale provider,
message catalogues, a language switcher in `topnav` beside the theme toggle.

**5c — Translate in stages, highest-traffic first.** Marketing + auth (~10 files) →
seeker app → employer → admin. A partial catalogue is fine; `next-intl` falls back to the
default locale per key.

**Note.** A visible language switcher makes the product read as international even with two
locales, so 5b delivers perceived value before 5c is finished.

**Depends on:** ideally lands after Phase 6, so the switcher and the theme toggle can be
built into the top bar together instead of touching it twice.

---

## Phase 6 — Dark mode

Kept in the plan because it belongs in the sequence, and because the groundwork is already
done — but see **Deferred** below for its current status.

**Why it is cheap here.** `globals.css:65-91` already defines semantic aliases
(`--color-bg`, `--color-surface`, `--color-card`, `--color-text-primary`, `--color-border`),
and `tailwind.config.ts:74-95` maps them to `bg-card`, `text-content`, `border-border`. Dark
mode is fundamentally **one CSS block redefining ~20 variables**. The 1062 inline
`style={{ color: "var(--color-…") }}` usages are *not* a problem — CSS variables re-resolve
automatically, so they theme for free.

**What actually stands in the way:**

- Those aliases exist only on `:root`. No `[data-theme="dark"]` block, no
  `prefers-color-scheme` fallback. `darkMode` is not set in `tailwind.config.ts`.
- `providers/theme-provider.tsx` is a **0-byte file**, imported nowhere. `layout.tsx` wraps
  only `QueryProvider` and `AuthProvider`.
- **157 hardcoded `bg-white` / `text-white` / `border-white` classes.** This is the real
  work — each becomes `bg-card` / `text-content`. Hardcoded hex is *not* an issue: only 3
  files contain any, and those are the swatch page and brand logos, which is correct.
- An inline anti-FOUC script must run in `<head>` before paint, or every load flashes white.

**Also:** add an **Appearance** section to `/settings`. It currently has only Account,
Security, and Connected Accounts (`settings/page.tsx:64-66`) — there is nowhere to put a
theme control.

---

## Phase 7 — Motion and polish

Small items, high visual return, safe to interleave with anything above.

- **Extend `Reveal` into the app.** It is used in 4 components, all marketing
  (`hero-section`, `features-section`, `how-it-works-section`, `cta-section`). The entire
  logged-in experience renders with no entrance motion. Wrap dashboard cards, job lists, and
  insight panels with a staggered `delay`. The component already handles
  `prefers-reduced-motion` via CSS, so this is nearly free.
- **Use the animations already defined.** `hover-lift` and `animate-grow-bar`
  (`globals.css:303`, `:331`) are declared and barely used.
- **Animate the match score.** `match-score-widget.tsx` prints a static number. A count-up
  plus an animating SVG ring arc makes the product's core metric feel computed rather than
  printed — and `ats-score-badge.tsx` already implements exactly this pattern, so it is a
  port, not an invention.
- **Profile completeness meter.** `MetricBar` is used in only 2 places. "Your profile is 72%
  complete — add 2 skills to improve your matches" drives real behaviour.
- **Illustrated empty states.** All 21 `EmptyState` usages pass a Lucide icon. Inline SVG
  illustrations would lift the screens a new user sees most.

---

## Production-readiness track

Independent of the phases above; can run in parallel. These do not make the app more
impressive — they stop it from looking unfinished at the exact moment something goes wrong.

- **No `error.tsx`, `not-found.tsx`, or `loading.tsx` anywhere in `src/app/`** (zero of
  them), and no React error boundary in the codebase. A thrown render error currently shows
  the Next.js overlay in dev and a blank page in production.
- **No toast system**, and four raw `alert()` calls: `settings/page.tsx:52`,
  `onboarding/resume/page.tsx:1515`, `google-oauth-modal.tsx:163`,
  `social-auth-buttons.tsx:18`. The password-mismatch one should be inline field validation,
  not a browser dialog. `--z-toast: 400` is already reserved in the token scale.
- **Modal accessibility.** `modal.tsx` sets `role="dialog"` and `aria-modal="true"` but has
  no Escape handler, no focus trap, and no body scroll lock.
- **Fake sidebar badges.** `sidebar.tsx:70` hardcodes `badge: 2` on Applications and
  `sidebar.tsx:86` hardcodes `badge: 3` on Notifications. The bell is wired to real data,
  so the sidebar contradicts it.
- **`/help` is linked from the sidebar** (`sidebar.tsx:87`) **and does not exist** → 404
  from primary navigation.
- **SEO.** 1 of 43 pages exports `metadata`; 35 are `"use client"`. No favicon, manifest,
  `robots.txt`, sitemap, or OG image in `public/`. The marketing pages are the ones that
  need this and the easiest to convert to server components.
- **10 lint warnings**, 8 of which are unoptimized `<img>` (`next/image` would help LCP on
  the hero and logo marquee).

---

## Deferred — by decision, 2026-08-10

**The six blank pages.** These render `export default function Page() { return null; }`:
`/about`, `/onboarding/recommendations`, `/admin/companies`, `/admin/jobs`, `/admin/reports`,
`/employer/settings`. Deferred at the user's request.

Worth re-raising when convenient: **`/onboarding/recommendations` sits inside the signup
flow**, so a new user hits a white screen mid-onboarding. That one is a different severity
from the other five.

**Dark mode (Phase 6).** Scoped and ready to build, deprioritised in favour of the
feature work above.

---

## Out of scope

- **Backend work.** Two gaps are named above and both have a client-side path: the analytics
  time series (Phase 2c) and the match-feedback endpoint (Phase 4, confirmed absent from
  `matching.api.ts`).
- **`salary-insights-chart.tsx`.** No benchmark source exists. The honest placeholder stays
  until one does.
- **The 20 dead 0-byte files** that this plan does *not* claim — e.g. `login-form.tsx`,
  `signup-form.tsx`, `job-form.tsx`, `billing-settings.tsx`, `company.api.ts`,
  `use-media-query.ts`. None are imported anywhere, so they are safe to delete, but deleting
  them is cleanup, not enhancement. Note that `login-form.tsx` and `signup-form.tsx` being
  empty means the auth pages inline their own forms — worth a look before deleting, in case
  the intent was extraction.
