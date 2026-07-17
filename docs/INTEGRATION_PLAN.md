# JobFits — Frontend ⇄ Backend Integration Plan

> **Goal:** Replace the fully-built-but-mocked frontend with real calls to the NestJS backend, phase by phase.
> Each phase is self-contained: complete it, verify it, commit it, then move to the next.

---

## 0. Context & Decisions (read first)

### Current state
- **Frontend** (`jobfit-frontend`): Next.js 15 App Router + React 19 + Tailwind. **UI is complete but runs on mock data.** Auth is faked via `localStorage` (`jobfits_user`, `jobfits_token = "mock-jwt-session-token-30-day"`). The whole integration layer is **empty stub files** (`src/lib/api/client.ts`, `src/lib/api/query-keys.ts`, all `src/providers/*`, all `src/stores/*`, `src/lib/supabase/*`, most `src/features/*/api/*.api.ts` and `src/features/*/hooks/*`).
- **Backend** (`jobfit-backend`): NestJS, global prefix **`/api/v1`**, JWT **access token (bearer) + httpOnly refresh cookie**, self-managed auth (roles `JOB_SEEKER`/`EMPLOYER`/`ADMIN`). CORS: `CORS_ORIGIN` (default `http://localhost:3000`) with `credentials: true`. Authoritative endpoint list: `jobfit-backend/docs/API_ENDPOINTS_REFERENCE.md` (81 endpoints).

### Locked decisions
| Decision | Choice |
|---|---|
| Data fetching / server state | **TanStack React Query** (fills the existing `query-provider`/`query-keys` stubs) |
| Auth tokens | **Access token in memory (React context) + httpOnly refresh cookie**; silent refresh on 401 |
| Features with no backend endpoint yet | **Keep on mock behind the real api/hook interface**; swap to live endpoints when backend adds them |

### Backend endpoint coverage vs. frontend features
| Frontend feature | Backend endpoints? | Plan |
|---|---|---|
| auth, user-profile, resume, job, application | ✅ Yes | Wire live (Phases 2–6) |
| employer, admin | ✅ Yes | Wire live (Phases 7–8) |
| analytics (insights `my-stats`), learning | ✅ Yes | Wire live (Phase 9) |
| **notification, saved-jobs, matching/recommendations, payment/billing, insights charts, seeker company view** | ❌ **No endpoint** | **Mock behind interface** (Phase 10) — flagged as `TODO(backend)` |

### ⚠️ Port conflict (resolve in Phase 0)
Both Next dev and the backend default to **port 3000**. Resolution used throughout this plan:
- **Frontend** stays on `http://localhost:3000` (Next default).
- **Backend** runs on **`http://localhost:4000`** via `PORT=4000`.
- Frontend calls `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`.
- Backend `CORS_ORIGIN=http://localhost:3000` (already the default) — leave as is.

### Data-shape note
Frontend domain types (e.g. `Job` in `src/shared/types/shared.types.ts` with `logo`, `logoBg`, `match`, `$K` salaries, `postedDaysAgo`) **do not match** backend DTO shapes. Every feature gets a small **mapper** (`src/features/<f>/api/<f>.mappers.ts`) that adapts backend DTO → frontend view type, so components stay untouched.

---

## Phase 0 — Foundations & Environment

**Goal:** Backend reachable from the browser; frontend has deps, env, and a clean baseline (no Supabase).

**Tasks**
1. Backend: run with `PORT=4000` (add to `jobfit-backend/.env`); confirm `CORS_ORIGIN=http://localhost:3000`.
2. Frontend `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   ```
3. Install deps in `jobfit-frontend`:
   ```
   npm i @tanstack/react-query
   npm i -D @tanstack/react-query-devtools
   ```
   (Optional, only if a global client store is needed later: `zustand`. `clsx` already present; add `tailwind-merge` if the dev rules' `cn` helper needs it.)
4. Remove dead Supabase path: delete `src/lib/supabase/` (client.ts + server.ts are empty stubs) and drop `@supabase/*` usage — auth is self-managed JWT. Confirm nothing imports it (`grep -r supabase src`).
5. Fill `src/lib/utils/cn.ts` (or reconcile with existing `src/shared/utils/cn.ts` — keep one) and `src/lib/utils/format.ts` (salary/date formatting helpers used by mappers).

**Acceptance**
- Backend up on `:4000`, Swagger at `http://localhost:4000/api/docs`.
- `curl http://localhost:4000/api/v1/jobs` returns JSON from the browser origin without CORS error.
- Frontend still builds (`npm run build`) with no Supabase references.

---

## Phase 1 — API Client, React Query, Auth Infrastructure

**Goal:** One typed HTTP client + query infrastructure that every later phase reuses.

**Files to implement**
- `src/lib/api/client.ts` — `fetch` wrapper: base URL from `NEXT_PUBLIC_API_URL`, `credentials: "include"` (sends refresh cookie), JSON helpers, injects `Authorization: Bearer <accessToken>` from the auth context, unwraps the backend's `TransformInterceptor` envelope, throws a typed `ApiError` on non-2xx.
- `src/lib/api/query-keys.ts` — central query-key factory (`qk.jobs.list(filters)`, `qk.auth.me()`, …).
- `src/providers/query-provider.tsx` — `QueryClientProvider` + devtools; sensible defaults (retry off for 4xx, staleTime).
- `src/providers/auth-provider.tsx` — holds access token in memory, exposes `user`, `login`, `logout`, `refresh`; on 401 from client, attempts one silent `POST /auth/refresh-token`, then retries or logs out.
- `src/providers/theme-provider.tsx` — fill stub if theme state is used.
- Wire all providers into `src/app/layout.tsx` (currently bare).

**Acceptance**
- A throwaway component calling `apiClient.get("/jobs")` renders live job data.
- 401 triggers exactly one refresh attempt; failure redirects to `/login`.

---

## Phase 2 — Authentication

**Goal:** Real register → verify → login → session → logout, replacing the localStorage mock.

**Backend endpoints:** `POST /auth/register`, `/auth/verify-email`, `/auth/resend-email-verification`, `/auth/login`, `/auth/logout`, `/auth/refresh-token`, `GET /auth/me`, plus password-reset set (`request-password-reset`, `verify-password-reset`, `reset-password`, `resend-password-reset-verification`).

**Frontend files**
- Fill `src/features/auth/api/auth.api.ts` (all calls above) and `src/features/auth/hooks/use-session.ts`.
- Rewrite pages to use them: `login/page.tsx`, `signup/page.tsx`, `verify-email/page.tsx`, `forgot-password/page.tsx` — remove `MOCK_ACCOUNTS`, `setTimeout`, and the fake `persistSession`.
- **Route protection:** replace the `localStorage.getItem("jobfits_user")` check in `src/app/(seeker)/layout.tsx` (and `admin`, `employer` layouts) with `useSession()` backed by `GET /auth/me`. Redirect to `/login` when unauthenticated; enforce role.
- Google OAuth modal (`google-oauth-modal.tsx`) has **no backend** → keep visually, disable or hide the flow, mark `TODO(backend)`.

**Acceptance**
- Register a real user → receive/verify email code → login → `/auth/me` populates the session → protected routes accessible → logout clears session and refresh cookie.
- Hard refresh keeps the user logged in via silent refresh.

---

## Phase 3 — User Profile & Onboarding

**Goal:** Onboarding and profile pages read/write real profile data.

**Backend endpoints:** `POST /profiles`, `GET/PATCH /profiles/{userId}`, `PATCH /profiles/{userId}/preferences`, `/salary`; skills `GET/POST /profiles/{userId}/skills`, `DELETE …/{skillId}`, `PATCH …/endorse`; experience & education `GET/POST/PATCH/DELETE` sets.

**Frontend files**
- Fill `src/features/user-profile/api/profile.api.ts` + `hooks/use-profile.ts`.
- Wire `onboarding/profile/page.tsx` (large — 22 KB), `(seeker)/profile/page.tsx`, and components `profile-form`, `skills-editor`, `experience-list`, `career-preferences-form`.
- On successful onboarding, set the real profile-complete state (drives the redirect logic that previously read `user.onboardingComplete`).

**Acceptance**
- Create/edit profile, add/remove skills, add experience/education → persisted and reflected after refresh.

---

## Phase 4 — Resumes

**Goal:** Real resume upload, listing, scoring.

**Backend endpoints:** `GET/POST /resumes` (multipart, PDF/DOCX ≤5 MB), `GET/DELETE /resumes/{id}`, `/{id}/ats-score`, `/parsing-status`, `/quality-score`, `POST /{id}/score`, `GET /{id}/scores`, `PATCH /{id}/set-default`.

**Frontend files**
- Fill `src/features/resume/api/resume.api.ts` + `hooks/use-resumes.ts`, `hooks/use-resume-upload.ts`.
- Wire `resume-uploader` (real multipart upload + progress), `resume-card`, `ats-score-badge`, `parsed-data-view`; pages `(seeker)/resumes/page.tsx`, `resumes/[resumeId]/page.tsx`, and `onboarding/resume/page.tsx` (68 KB — the heaviest; budget time).
- Poll `parsing-status` after upload; show scores when ready.

**Acceptance**
- Upload a real PDF → parsing status resolves → ATS/quality scores render → set-default works.

---

## Phase 5 — Jobs (public search & detail)

**Goal:** Replace `MOCK_JOBS` with live search.

**Backend endpoints:** `GET /jobs` (params: `q, status, remoteType, location, skillIds, minSalary, maxSalary, limit, offset`), `GET /jobs/{id}`. **Public — no auth.**

**Frontend files**
- Replace mock body of `src/features/job/api/job.api.ts` with live calls; add `job.mappers.ts` (backend job DTO → frontend `Job` view type: derive `logo`/`logoBg`, map salary to `$K`, compute `postedDaysAgo`; `match` only when authenticated + profile complete, else omit).
- Fill `hooks/use-job.ts`; adapt `hooks/use-job-search.ts` (currently mock/local) to query params + pagination.
- Wire pages `(seeker)/jobs/page.tsx`, `jobs/[jobId]/page.tsx`; components `job-card`, `job-detail`, `job-filters`, `job-search-bar`.

**Acceptance**
- Search/filter/paginate hit the backend; detail page loads by real id; empty & loading states use `EmptyState`/`Skeleton`.

---

## Phase 6 — Applications (seeker)

**Goal:** Apply to jobs and track applications live.

**Backend endpoints:** `GET/POST /applications`, `GET /applications/{id}`, `POST /{id}/contact-person`, `PATCH /{id}/status`, `GET /{id}/timeline`.

**Frontend files**
- Fill `src/features/application/api/application.api.ts` + `hooks/use-applications.ts`.
- Wire `(seeker)/applications/page.tsx`, `applications/[applicationId]/page.tsx`; components `application-card`, `application-kanban`, `application-timeline`, `interview-scheduler`.

**Acceptance**
- Submit an application from a job detail page → appears in list → status/timeline reflect backend.

---

## Phase 7 — Employer Module

**Goal:** Employer dashboard, jobs, and applicant pipeline on live data.

**Backend endpoints:** company `GET/PATCH /employer/companies/{id}`, `/verify-email`, `POST /employer/companies/claim`; jobs `POST /employer/jobs`, `PATCH /{id}`, `GET /{id}/analytics`, `POST /{id}/publish`; applications `GET /employer/applications`, `POST /{id}/notes`, `PATCH /{id}/status`.

**Frontend files**
- `src/features/employer/api/employer.api.ts` already has content (4.6 KB, likely mock) — refit to live endpoints; add `company.api.ts` fill for the seeker/company forms as needed.
- Wire `employer/dashboard`, `employer/jobs`, `employer/jobs/new`, `employer/jobs/[jobId]`, `employer/jobs/[jobId]/applicants`, `employer/applications`, `employer/company`, `employer/settings`.

**Acceptance**
- Create draft job → publish → view analytics; move an applicant through pipeline stages; edit company profile.

---

## Phase 8 — Admin Module

**Goal:** Admin console on live data (separate admin login).

**Backend endpoints:** `POST /admin/login`, `/admin/logout`; users `GET /admin/users`, `GET/DELETE /admin/users/{id}`, `POST /{id}/reset-password`, `/{id}/unlock`; system `GET /admin/system/health`, `/metrics`, `/alerts`, `POST /alerts/{id}/acknowledge`; email `GET /admin/email/metrics`, `/bounces`, `POST /admin/email/suppress`; audit `GET /admin/audit-logs`.

**Frontend files**
- `src/features/admin/api/admin.api.ts` already has content (5.5 KB, likely mock) — refit to live endpoints.
- Wire `admin/page.tsx`, `admin/users`, `admin/companies`, `admin/jobs`, `admin/reports`, `admin/system`, `admin/email`. Note: **admin login is a distinct endpoint** — handle its token/role separately from seeker auth.

**Acceptance**
- Admin login → user search/detail/unlock/reset → system health & metrics render → email metrics & suppression → audit log lists.

---

## Phase 9 — Analytics & Learning

**Goal:** Live seeker stats and skill-gap learning paths.

**Backend endpoints:** `GET /analytics/my-stats`; `GET /learning-paths/{userId}`, `GET /skills/{skillId}/learning-resources`.

**Frontend files**
- Fill `src/features/insights/api/insights.api.ts` (wire the *funnel/engagement* portion to `my-stats`) and `src/features/learning/api/learning.api.ts`.
- Wire `(seeker)/insights/page.tsx` (stats parts only — chart-specific series without endpoints stay mock, see Phase 10), `(seeker)/learning/page.tsx`; components `learning-path-card`, `progress-tracker`.
- Feed `(seeker)/dashboard/page.tsx` (27 KB) real stats where available.

**Acceptance**
- Dashboard/insights show real `my-stats`; learning page shows real skill-gap path & resources.

---

## Phase 10 — Gap Features (mock behind interface) & Hardening

**Goal:** Everything without a backend endpoint stays functional and swap-ready; final polish.

**Mock-behind-interface (add `TODO(backend)` + query-key so a later swap is 1 file):**
- `notification/` (bell, list, `use-notifications`) — no endpoint.
- `saved-jobs/` (list, folders, `use-saved-jobs`) — no endpoint.
- `matching/` (recommendations, swipe-deck, match feedback/breakdown) — depends on the **AI service** (sibling `jobfits-ai-service`, not yet wired to backend).
- `payment/` (billing-settings, pricing-table) + `src/app/api/webhooks/stripe/route.ts` — no billing backend.
- `insights/` chart series (`applications-chart`, `salary-insights-chart`, `skill-gap-chart`) beyond `my-stats`.

**Hardening**
- Every list/table has `EmptyState`; every async view has `Skeleton` (per `docs/rule_for_develop_frontend.md`).
- Central error toast/`Alert` on `ApiError`; 401→refresh→login path verified.
- Remove all remaining `setTimeout` fake calls and `MOCK_*` exports that now have live sources.
- End-to-end smoke: register → onboard → upload resume → search jobs → apply → track; employer publish+pipeline; admin console.

**Acceptance**
- No mock data on any live-backed feature; gap features work and are clearly flagged; full smoke passes against `:4000`.

---

## Execution checklist (per phase)
1. Implement the `api` + `hooks` for the phase.
2. Swap the pages/components from mock → hooks.
3. Add mappers where shapes differ.
4. Verify against the running backend (`:4000`) with a real account.
5. `npm run build` clean; commit `feat(integration): phase N — <name>`.

## Environment quick reference
```
# jobfit-backend/.env
PORT=4000
CORS_ORIGIN=http://localhost:3000

# jobfit-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```
Run backend: `npm run start:dev` (in jobfit-backend) · Run frontend: `npm run dev` (in jobfit-frontend)
