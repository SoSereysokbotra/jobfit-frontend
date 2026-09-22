# Page test inventory — jobfit-frontend

**Repo:** `jobfit-frontend` · **Date:** 2026-08-31 · **Verified at:** `44b7982`
**Purpose:** every route in the app, listed so each can be measured and tested one at a
time with Playwright. Test order starts with authentication, then the seeker dashboard.

> **Everything below was read out of the files, not inferred from folder names.** Where a
> page's visible text comes from a translation key, the actual English string is quoted
> from `src/shared/i18n/messages/en.ts`. Where a page has no static text to assert on,
> that is stated rather than guessed at.

---

## 0. Facts you need before running anything

**Framework:** Next.js 15 App Router, React 19, TanStack Query, Tailwind.
Tests run with `vitest` today (`npm run test`); there is no Playwright yet.

**Ports — these must match or nothing loads:**

| | Value | Source |
|---|---|---|
| Frontend dev server | `http://localhost:3000` | `next dev` default |
| Backend API | `http://localhost:4000/api/v1` | `jobfit-frontend/.env.local` → `NEXT_PUBLIC_API_URL` |
| Backend `PORT` | `4000` | `jobfit-backend/.env` line 3 |
| Backend CORS allows | `http://localhost:3000` | `jobfit-backend/.env` line 4 |

⚠️ `jobfit-backend/.env.example` says `PORT=3000`, but the real `.env` says `4000`. Anyone
setting up from the example file will get a frontend that cannot reach the backend.

**Route groups do not appear in the URL.** `(auth)`, `(marketing)` and `(seeker)` are
Next.js grouping folders. So `src/app/(seeker)/dashboard/page.tsx` serves `/dashboard`,
not `/seeker/dashboard`.

### How access control actually works

From `src/features/auth/hooks/use-session.ts` and the four layouts:

- `useRequireAuth({ roles })` backs every protected area. It reads the session from
  **`GET /auth/me`**.
- **Redirects are deferred while `isLoading` is true.** During the initial silent refresh
  the app genuinely does not know if there is a session. A test that asserts too early
  will see the loading state, not the redirect.
- Wrong role does **not** go to `/login` — it goes to that role's own home
  (`homeForRole`): `ADMIN` → `/admin`, `EMPLOYER` → `/employer/dashboard`,
  `JOB_SEEKER` → `/dashboard`.

### The onboarding gate — this will block dashboard tests

`src/app/(seeker)/layout.tsx` does more than check the role:

```
const needsOnboarding = isAllowed && isResolved && !hasProfile && pathname !== "/profile";
useEffect(() => { if (needsOnboarding) router.replace("/onboarding/resume"); }, ...);
```

**A logged-in seeker with no profile is redirected off `/dashboard` to
`/onboarding/resume`.** "Has a profile" means `GET /profiles/{userId}` returns one.
`/profile` is exempt, because it doubles as the create-profile form.

So the seeker test account **must have a profile already**, or every seeker page test will
measure a redirect instead of the page.

Until the check resolves, a full-screen overlay covers the content with the text
**"Loading your workspace…"**. That string is the reliable "not ready yet" signal for
Playwright to wait past.

---

## 1. Test order

1. **Authentication** (§2) — 9 pages, no session needed for most
2. **Seeker dashboard** (§3, first row) — the page you asked for
3. Remaining seeker pages (§3)
4. Marketing (§4) — cheap, unauthenticated, good sanity check
5. Employer (§5) and Admin (§6) — need their own accounts

---

## 2. Authentication pages — `src/app/(auth)/` · **9 routes**

No layout guard. `(auth)/layout.tsx` is a pass-through that renders `{children}` only.
All 9 are client components.

| # | Route | File | Verified text anchor | Network on load |
|---|---|---|---|---|
| 1 | `/login` | `(auth)/login/page.tsx` | "Welcome back" · "Sign in to continue to your JobFits account" | none until submit |
| 2 | `/signup` | `(auth)/signup/page.tsx` | "Create Account" · "Already have an account?" | none until submit |
| 3 | `/verify-email` | `(auth)/verify-email/page.tsx` | "Verify Email" · "Check your inbox" | reads `?email=` param |
| 4 | `/forgot-password` | `(auth)/forgot-password/page.tsx` | "Reset Your Password" | none until submit |
| 5 | `/forgot-password/verify` | `(auth)/forgot-password/verify/page.tsx` | "Verify Your Email" | none until submit |
| 6 | `/forgot-password/reset` | `(auth)/forgot-password/reset/page.tsx` | "Create New Password" | none until submit |
| 7 | `/onboarding/resume` | `(auth)/onboarding/resume/page.tsx` | *(no static heading)* | résumé upload, parsing status, parsed data, profile, create-profile, preferences |
| 8 | `/onboarding/profile` | `(auth)/onboarding/profile/page.tsx` | *(no static heading)* | none — immediately `router.replace("/onboarding/resume")` |
| 9 | `/onboarding/recommendations` | `(auth)/onboarding/recommendations/page.tsx` | *(no static heading)* | none found; contains hardcoded job objects |

### `/login` — details for writing the test

Form fields (labels and placeholders are translated; English values quoted from
`en.ts` lines 112-123):

- **Email** — label `"Email address"`, placeholder `"you@example.com"`, `type="email"`
- **Password** — label `"Password"`, placeholder `"••••••••"`, has a show/hide toggle
- **Remember me** checkbox — `id="remember-me"`, and it is `className="sr-only"`
  (visually hidden, styled by the sibling span). Playwright must click the **label**, not
  the input.
- Submit button — `"Sign In"`, becomes `"Signing in…"` while loading
- **The submit button is `disabled` until both email and password are non-empty.**

Links out: `/forgot-password` ("Forgot password?"), `/signup` ("Create an account").

Three distinct error states, worth testing separately — the page branches on the API's
status code:

| Condition | What renders |
|---|---|
| `403` | Whole form replaced by "Account Access Suspended" + a "Back to Login" button |
| `401` **and** message contains "verify" | Error alert plus a "Verify your email" link to `/verify-email?email=…` |
| anything else | Error alert, "Invalid email or password." |

On success: `router.push(homeForRole(user.role))` — so a seeker lands on `/dashboard`.

**Note:** the Google / LinkedIn buttons are rendered **`disabled`**. The file says
`TODO(backend): no OAuth endpoints exist.` Do not write a test that clicks them.

---

## 3. Seeker pages — `src/app/(seeker)/` · **22 routes**

**All 22 require:** a valid session, role `JOB_SEEKER`, **and an existing profile** (see
the onboarding gate above). All are client components except `/jobs/[jobId]`.

| # | Route | File | Anchor | Data hooks (each = network) |
|---|---|---|---|---|
| 1 | **`/dashboard`** | `(seeker)/dashboard/page.tsx` | "Welcome back, {firstName}!" · "Profile Score" | `useSession` `useMyStats` `useJobs` `useSavedJobIds` `useProfile` |
| 2 | `/jobs` | `(seeker)/jobs/page.tsx` | *(none static)* | `useJobs` `useJobSearch` `useSavedJobIds` `useJobCompare` `useSubmitApplication` `useExternalApply` `useToggleSavedJob` |
| 3 | `/jobs/[jobId]` | `(seeker)/jobs/[jobId]/page.tsx` | *(none static)* | **server component** |
| 4 | `/jobs/compare` | `(seeker)/jobs/compare/page.tsx` | *(none static)* | `useJobCompare` `useJobMatch` `useSkillGap` |
| 5 | `/recommendations` | `(seeker)/recommendations/page.tsx` | *(none static)* | `useRecommendations` `useJobSearch` `useSavedJobIds` `useDismissRecommendation` + 3 more |
| 6 | `/saved-jobs` | `(seeker)/saved-jobs/page.tsx` | *(none static)* | `useSavedJobs` `useSavedExternalJobs` `useSavedJobIds` + 2 mutations |
| 7 | `/applications` | `(seeker)/applications/page.tsx` | *(none static)* | `useApplications` |
| 8 | `/applications/[applicationId]` | `(seeker)/applications/[applicationId]/page.tsx` | *(none static)* | `useApplication` `useApplicationTimeline` + 2 mutations |
| 9 | `/tracker` | `(seeker)/tracker/page.tsx` | *(none static)* | `useTrackerBoard` `useArchivedTrackedJobs` + 4 mutations |
| 10 | `/offers` | `(seeker)/offers/page.tsx` | *(none static)* | `useOffers` |
| 11 | `/resumes` | `(seeker)/resumes/page.tsx` | **"Resumes"** | `useResumes` `useResumeUpload` `useParsingStatus` `useResumeMutations` |
| 12 | `/resumes/[resumeId]` | `(seeker)/resumes/[resumeId]/page.tsx` | *(none static)* | `useResume` `useParsedData` `useParsingStatus` `useResumeScores` |
| 13 | `/resume-builder` | `(seeker)/resume-builder/page.tsx` | *(none static)* | `useResumeDocuments` `useResumeTemplates` + 3 mutations |
| 14 | `/resume-builder/new` | `(seeker)/resume-builder/new/page.tsx` | *(none static)* | `useResumeTemplates` `useCreateResumeDocument` |
| 15 | `/resume-builder/[id]/edit` | `(seeker)/resume-builder/[id]/edit/page.tsx` | *(none static)* | `useResumeDocument` `useResumeTemplates` + 5 mutations |
| 16 | `/match-report/[id]` | `(seeker)/match-report/[id]/page.tsx` | *(none static)* | `useMatchReport` |
| 17 | `/insights` | `(seeker)/insights/page.tsx` | *(none static)* | `useMyStats` `useApplications` |
| 18 | `/learning` | `(seeker)/learning/page.tsx` | *(none static)* | `useSkillGaps` |
| 19 | `/notifications` | `(seeker)/notifications/page.tsx` | *(none static)* | `useNotifications` `useUnreadCount` `useNotificationActions` |
| 20 | `/profile` | `(seeker)/profile/page.tsx` | **"Create your profile"** | 13 hooks — the heaviest page in the app |
| 21 | `/settings` | `(seeker)/settings/page.tsx` | **"Settings"** | `useTheme` only — no API calls found |
| 22 | `/help` | `(seeker)/help/page.tsx` | *(none static)* | `useState` only — no API calls found |

### `/dashboard` — details for writing the test

**Five network calls fire on load.** This is the page to measure:

| Hook | Endpoint (per the file's own comments) | Feeds |
|---|---|---|
| `useSession` | `GET /auth/me` | the greeting |
| `useMyStats` | `GET /analytics/my-stats` | the stat tiles |
| `useSavedJobIds` | saved jobs | "Saved Jobs" count |
| `useJobs` | published jobs | "Recent openings" (top 3) |
| `useProfile` | profile | completeness score + checklist |

Assertable text:
- **"Welcome back, {firstName}!"** — falls back to **"Welcome back, there!"** when the
  user has no `name` (name is optional at registration and defaults to `""`).
- **"Profile Score"** — the only other static heading in the file.
- Numeric tiles render **`"—"`** (em dash) while a stat is undefined. Useful: it
  distinguishes "loaded, empty" from "still loading".

⚠️ **Parts of this page are hardcoded, not from the API.** The file has a
`/* ─── MOCK DATA ─── */` block containing `applicationTrendData` (Jan-Jul figures) and
`quickActions`. There is also a `SamplePill` component whose comment reads *"Small
'Sample' pill for sections with no backend endpoint yet."* **Do not measure the chart as
if it were a network-driven feature — it is static.**

---

## 4. Marketing pages — `src/app/(marketing)/` · **4 routes**

No guard; `(marketing)/layout.tsx` is a pass-through.

| # | Route | File | Notes |
|---|---|---|---|
| 1 | `/` | `(marketing)/page.tsx` | **server component**, no metadata export |
| 2 | `/about` | `(marketing)/about/page.tsx` | **server component**; the only page with a real `metadata.title`: `"About Us \| JobFits AI Job Matching Platform"` |
| 3 | `/pricing` | `(marketing)/pricing/page.tsx` | client; `usePlans` |
| 4 | `/ui-reference` | `(marketing)/ui-reference/page.tsx` | client; a component showcase, not a product page |

---

## 5. Employer pages — `src/app/employer/` · **8 routes**

Guarded by `useRequireAuth({ roles: ["EMPLOYER"] })`. While resolving, the layout renders
**only a spinner** — no page content at all. A seeker or admin who opens these is
redirected to their own home, not to `/login`.

| # | Route | Anchor | Data hooks |
|---|---|---|---|
| 1 | `/employer/dashboard` | "Analytics" | `useEmployerJobs` `useEmployerApplications` `useIngestJobs` |
| 2 | `/employer/jobs` | "My Jobs" | `useEmployerJobs` `useEmployerApplications` |
| 3 | `/employer/jobs/new` | "Create New Job" | `useCreateJob` `usePublishJob` |
| 4 | `/employer/jobs/[jobId]` | *(none static)* | `useEmployerJobs` `useEmployerApplications` `useJobAnalytics` `usePublishJob` |
| 5 | `/employer/jobs/[jobId]/applicants` | "Applicants" | `useEmployerApplications` |
| 6 | `/employer/imported-jobs` | "Imported Jobs" | `useImportedJobs` |
| 7 | `/employer/applications` | "Applications" | `useEmployerApplications` `useEmployerJobs` `useUpdateApplicantStatus` |
| 8 | `/employer/settings` | "Company Settings" | `useEmployerCompany` `useUpdateCompany` `useVerifyCompanyEmail` |

---

## 6. Admin pages — `src/app/admin/` · **7 routes**

Guarded by `useRequireAuth({ roles: ["ADMIN"] })`; spinner-only while resolving.

The layout carries a live note: *"This area was previously unguarded — anyone who knew the
URL could open it."* and `TODO(phase-8): admin sign-in is a separate endpoint
(POST /admin/login), so an admin with no session is sent to /login until that page
exists.* — **there is no admin login page in this repo.** Getting an admin session for a
test needs the backend endpoint directly.

| # | Route | Anchor | Data hooks |
|---|---|---|---|
| 1 | `/admin` | "Dashboard" | `useSystemHealth` `useAlerts` `useAcknowledgeAlert` |
| 2 | `/admin/users` | "User Management" | `useAdminUsers` `useAdminUser` `useDeleteUser` `useResetUserPassword` `useUnlockUser` |
| 3 | `/admin/companies` | "Company Management" | **none found** — local `AdminCompany` interface, `useState`/`useMemo`/`useDebounce` only |
| 4 | `/admin/jobs` | *(none static)* | **none found** — `useState`/`useMemo`/`useDebounce` only |
| 5 | `/admin/reports` | *(none static)* | **none found** — Recharts + local data |
| 6 | `/admin/system` | "System Health" | `useSystemHealth` `useSystemMetrics` `useAlerts` `useAcknowledgeAlert` |
| 7 | `/admin/email` | "Email Delivery Tracking" | `useEmailBounces` `useEmailMetrics` `useSuppressEmail` |

> Rows 3-5 contain no API hooks. They will not produce network traffic, so there is
> nothing to measure on them — only render time.

---

## 7. Other routes

| Route | File | Notes |
|---|---|---|
| `/offline` | `src/app/offline/page.tsx` | server component; `metadata.title` = `"Offline — JobFits"`; PWA fallback |
| `/api/webhooks/stripe` | `src/app/api/webhooks/stripe/route.ts` | the only route handler — POST endpoint, not a page |

**App-level boundaries** (not routes, but they render): `src/app/error.tsx`,
`global-error.tsx`, `not-found.tsx`, `loading.tsx`.

---

## 8. Totals

| Area | Routes |
|---|---|
| Authentication | 9 |
| Seeker | 22 |
| Marketing | 4 |
| Employer | 8 |
| Admin | 7 |
| Other | 1 (`/offline`) |
| **Total pages** | **51** |

Plus 1 API route handler, 6 layouts, 4 app-level boundary files.

---

## 9. Open questions before testing starts

These need answers from you — I have not assumed values for any of them:

1. **Test accounts.** Is there a seeker account with a completed profile? Without one,
   every seeker test measures the `/onboarding/resume` redirect. Same question for an
   employer account, and an admin (which has no login page in this repo).
2. **Is the backend seeded?** An empty database means `/jobs`, `/recommendations` and the
   dashboard tiles all render empty states — which is a valid thing to measure, but it is
   not what a real user sees.
3. **Résumé parsing needs the AI service.** `/onboarding/resume` and `/resumes` depend on
   `jobfits-ai-service`. Should it be running during the tests?
4. **The database is remote.** `jobfit-backend/.env` has `DATABASE_URL` pointing at a
   hosted Supabase instance (`postgresql://postgres.enkyyjn…`), not a local Postgres. So
   even "local" timings include an internet round trip per query. Worth knowing before
   reading any number as "local performance" — and it means an N+1 query costs far more
   here than it would against a database on the same machine.
