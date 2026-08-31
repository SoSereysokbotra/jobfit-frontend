# Employer end-to-end test — findings

> Written 2026-08-30. Companion to `EMPLOYER_HANDOFF.md`; read that one first for how the
> employer half is meant to work. **Spans two repos** — nearly every fix here landed in
> `d:/Year2/Jobfit/jobfit-backend`.
>
> This is the record of the first full end-to-end run of the employer workflow against a
> live server, with real accounts, after the employer dashboard was finished. Eight issues
> were found. **Six were real defects and all six are fixed and re-verified live.** One was
> not a defect at all (finding 3 — a dead Redis). One is a missing feature left undone on
> purpose (repost).

---

## 1. What was actually exercised

One unbroken chain, against `localhost:4000/api/v1` with the frontend on `:3000`:

```
employer login → claim company → create draft job → publish
  → seeker applies → automatic screening
  → employer reads CV → adds notes → advances to INTERVIEW
  → employer extends offer
  → seeker negotiates → employer replies → employer re-extends revised terms
  → seeker accepts → terminal-state guards
```

| | |
|---|---|
| Employer | `bot50856@gmail.com` — company **Celonis** `67025ecf-1e87-49dc-95b7-30a9310eaaba` |
| Seeker | `so.sereysokbotra25@kit.edu.kh` |
| Job | `444b9893-adc6-4621-bf9c-e5f02e3545c8` "E2E Backend Engineer (Test)" |
| Application | `a8a19fc7-8d07-400e-96d0-04692ac1d311` |
| Offer | `3813d75a-d6ee-4735-a2b3-5397f2b6043c` — accepted, $26,000 base + $1,500 signing |

**What worked, and is not repeated below:** company claim marking the company verified via
`ADMIN_REVIEW` per `employer_logic.md` §6; job creation auto-scoped to the employer's
company; automatic screening (match 30, 0-of-2 requirements evidenced, missing ones named);
the resume signed URL serving the real 207 KB PDF; notes; the full status pipeline;
archive/unarchive via `?includeArchived=true`; analytics; company profile update; the
seeker's application timeline; the duplicate-application guard; every terminal-state guard
on the offer (double-accept, decline-after-accept, withdraw-after-accept and
edit-after-accept all correctly refused); cross-company isolation on jobs and applications;
portal separation with the wrong-door message; and all ten employer/admin frontend routes
rendering.

---

## 2. Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Draft jobs are publicly listable, readable and applicable | **Critical** | Fixed |
| 2 | Every failed login on the employer and admin portals returns 500 | **High** | Fixed |
| 3 | Logout appeared not to revoke the access token | — | **Not a defect** — Redis was down |
| 4 | §7.2 close was unreachable; repost does not exist | Medium | Close fixed · repost open |
| 5 | Employer job list reports the wrong currency and drops the salary period | Medium | Fixed |
| 6 | `publish` answers 400 for an ownership refusal that is a 403 | Low | Fixed |
| 7 | `views` is a hardcoded `0`, shown in the UI as fact | Low | API by design · UI fixed |
| 8 | `candidateBands` counts recommendations, not applicants | Low | By design — see below |

---

### Finding 1 — Draft jobs were public, and applicable · **Critical · Fixed**

`employer_logic.md` §7.1: *"Jobs are drafted and then explicitly published, so a
half-written posting never reaches candidates."* They reached candidates.

**Reproduction (before the fix)**

```bash
# every unpublished posting on the platform, unauthenticated
curl 'http://localhost:4000/api/v1/jobs?status=DRAFT'      # 200 + the drafts
curl 'http://localhost:4000/api/v1/jobs'                   # drafts mixed into normal results
curl 'http://localhost:4000/api/v1/jobs/<draft-id>'        # 200, no auth
curl -X POST .../applications -d '{"jobId":"<draft-id>"}'  # 201 Created
```

During the run the seeker applied to the job **before it was ever published**, and the
application was accepted, screened, and entered the employer's pipeline normally.

**Root cause — three separate holes on one path**

1. `status` was an accepted parameter on the *public* `SearchJobQueryDto`, and its enum
   included `DRAFT`.
2. `SearchJobsUseCase` passed it straight through, and `PrismaJobRepository.findMany`
   applies the status filter only when one is given — so an omitted status meant *no filter
   at all*, not "published only".
3. Neither `JobService.findById` nor `ApplicationService.submitApplication` checked status
   at all.

**Fix**

| File | Change |
|---|---|
| `job/presentation/dto/search-job.query.dto.ts` | `status` removed from the public contract entirely, with the reason recorded in a header comment. `?status=DRAFT` is now a 400. |
| `job/application/use-cases/search-jobs.use-case.ts` | Browse is hardcoded to `status: 'PUBLISHED'`. The caller gets no say. |
| `job/application/job.service.ts` | `findById` answers **404** for a DRAFT — worded identically to a nonexistent job, so an anonymous caller cannot use it to confirm which ids are real. CLOSED stays readable, because a candidate who applied must still be able to open what they applied to. |
| `application/application.service.ts` | `submitApplication` refuses any job that is not PUBLISHED, alongside the existing external-job guard. This is the integrity guard behind the listing change: a guessed id must not create a row the listing refuses to show. |

> Employers were never affected: `GET /employer/jobs` is scoped by company and still returns
> drafts, and the employer job-detail page reads from that list, not from the public
> endpoint.

---

### Finding 2 — Every failed login on employer and admin returned 500 · **High · Fixed**

A recruiter who mistyped their password saw **"Internal server error."** The employer login
page renders `err.message` straight through
([login/page.tsx:81](../src/app/employer/login/page.tsx#L81)).

**Reproduction (before the fix)**

```
POST /employer/auth/login   wrong password                    → 500
POST /employer/auth/login   approved-but-never-activated       → 500
POST /admin/login           wrong password                    → 500
POST /auth/login            wrong password                    → 401   (correct)
```

**Root cause.** `AuthExceptionFilter` was registered on `AuthController` only
(`@UseFilters` at `auth.controller.ts:106`). `EmployerAuthController` and
`AdminAuthController` reuse the same `LoginCommand`, which throws `InvalidCredentialsError`,
`EmailNotVerifiedError` and `LoginBlockedError` — plain `AuthError` subclasses, not
`HttpException`s. With no filter on those controllers they fell through to the global
handler as 500s.

Three consequences, not one:

- a wrong password answered 500 instead of 401;
- the approved-but-unactivated case — the invariant `employer_logic.md` §4.3 is built
  around, and which `EmployerAuthController` documents as a 401 in its own `@ApiResponse` —
  answered 500;
- a lockout answered 500 instead of **429**, so a locked-out employer was never told they
  were locked out.

**Fix.** `@UseFilters(AuthExceptionFilter)` on both controllers, with the reasoning recorded
above each. The filter already maps the whole family correctly: 401 for invalid credentials,
403 for unverified, 429 for a lockout.

---

### Finding 3 — Logout revocation · **NOT A DEFECT — Redis was down**

**This was a false alarm, and the code is correct.** Recorded in full because the symptom is
alarming, the cause is invisible, and the next person to see it should recognise it in
seconds rather than going looking for a bug in the auth module.

**What was observed** — on both portals, reproducibly: log in, log out (200), and the same
bearer token still returned 200 instead of 401. The §5.3 account lockout also never fired,
through more than five failed logins in a minute.

**What it actually was.** Redis here is not a local install — `docker-compose.yml` runs it as
the `jobfit-redis` container, and **Docker Desktop had stopped**. `docker ps` could not reach
the daemon, the backend would not restart (`ECONNREFUSED ::1:6379 / 127.0.0.1:6379`), and the
frontend, backend and Redis had all left the port list at the same moment.

Token revocation and the lockout are both Redis-backed, and `TokenBlacklistService`,
`JwtAuthGuard` and the lockout all **fail open by design** — a deliberate choice so a Redis
outage cannot lock every valid user out of the platform. With Redis gone they silently
no-op, and the only trace is a `logger.warn`.

**Re-verified once Docker was started**, with the backend logging `Redis connection ready`:

```
jti written to redis:  docker exec jobfit-redis redis-cli GET blacklist:<jti>  ->  1
token after logout:                                                            ->  401
6 failed logins:       401 401 401 401 401 429                                 ->  lockout fires
```

Both behaviours are correct and always were.

**The real lesson, and it is worth acting on.** A dead Redis silently downgrades two security
controls — no session revocation and no brute-force lockout — while the API keeps answering
200 and looks perfectly healthy. Fail-open is the right default, but it currently fails
*quietly*. Consider a health-check signal or an alarm on the "failing open" warn path, so this
degradation is visible rather than something that has to be rediscovered by a confusing test
run. **A misleading symptom like this is the expected cost of the design, so recognise it
early: before debugging any auth-revocation or lockout oddity, check that Redis is alive.**

---

### Finding 4 — Close was unreachable; repost does not exist · Medium · **Close fixed**

`employer_logic.md` §7.2 lists *"View, edit, close, repost."* View and edit worked. Close and
repost were both unreachable: `PATCH /employer/jobs/:id` rejects `status` (`UpdateJobDto
extends PartialType(CreateJobDto)`, and `CreateJobDto` has no status field), and
`POST /employer/jobs/:id/close` was a 404. **A published job could not be taken down by the
employer who posted it.** The UI has a "Closed" badge that nothing could ever produce.

**Close is fixed, and it was only ever a wiring gap.** The whole lifecycle already existed
and was simply never routed: `JobService.close` → `CloseJobUseCase`, with the
company-ownership check and the domain event already in place. Added
`POST /employer/jobs/:id/close` → `EmployerJobService.close` → the existing use case.
Existing applications are untouched by a close and stay in the pipeline.

The endpoint alone would not have fixed the reported problem — an employer still could not
take a posting down from the dashboard — so the frontend is wired through too:
`employerApi.closeJob`, a `useCloseJob` mutation that invalidates the jobs query, and a
**Close Job** button on the job detail page, shown only for a Published posting. It confirms
first, and the confirm text says the close cannot be undone, because reposting does not
exist yet.

**Repost is genuinely not built** — `grep -ri repost src/` returns nothing. It is a real
feature rather than a wiring gap, because §7.2 attaches a rule to it: *"Reposting an expired
job clears its previous matches and triggers a fresh matching run."* That means clearing
`recommendations` for the job and re-running matching, so it needs a decision about the
matching pipeline, not just an endpoint. **Left undone deliberately** — building it
unprompted was outside a bug-fix pass.

---

### Finding 5 — Employer job list reported the wrong currency · Medium · Fixed

`GET /employer/jobs` has its own local mapper, which **hardcoded `currency: 'USD'`** and
omitted `period` altogether — while `POST /employer/jobs` and both public endpoints returned
both correctly, from the same columns.

```
POST /employer/jobs     {"min":1200,"max":2500,"currency":"USD","period":"MONTHLY"}
GET  /employer/jobs     {"min":1200,"max":2500,"currency":"USD"}          ← period gone
GET  /jobs/:id          {"min":1200,"max":2500,"currency":"USD","period":"MONTHLY"}
database                minSalary 1200 · maxSalary 2500 · USD · MONTHLY
```

So a job posted in KHR displayed to its own employer as dollars, and every posting rendered
"1200–2500" with no way to tell monthly from annual — precisely the defect
`CreateJobDto.salaryPeriod` was added to remove ("500 monthly and 500 annual are
indistinguishable without this"). Fixed by reading `row.salaryCurrency` and
`row.salaryPeriod` in `toJobResponse`. An absent period still means unknown and is still
never defaulted to ANNUAL.

---

### Finding 6 — `publish` answered 400 for an ownership refusal · Low · Fixed

```
PATCH /employer/jobs/<foreign-id>            403 Forbidden           correct
GET   /employer/jobs/<foreign-id>/analytics  403 "another company"   correct
POST  /employer/jobs/<foreign-id>/publish    400 "Forbidden"         wrong status
```

`PublishJobUseCase` and `CloseJobUseCase` report ownership and existence failures as plain
`Result.fail` strings, and `JobService` blanket-converted every failure into a 400 — so the
status contradicted its own message and a client had nothing to branch on. Added
`JobService.failResult`, mapping `'Forbidden'` → 403 and `'Job not found'` → 404, leaving 400
for genuine rule violations such as "a closed job cannot be published". Applied to both
`publish` and `close`.

---

### Findings 7 and 8 — two things that look like bugs and are not

**`views` is always `0`.** The API side is a declared placeholder —
`job-analytics-response.dto.ts` sets `this.views = 0` in the constructor and documents it as
*"no view tracking exists yet"*. Nothing writes it. That is not a defect.

**The UI was a defect, and is fixed.** The job detail page rendered the placeholder as a
fact: a "Views" tile reading **0** and an "Apply Rate" tile reading **0%**, which tells an
employer nobody looked at their posting. The API had not said that — it had said it does not
know. Both tiles now read "—" until view tracking exists, matching how Strong Matches
already renders an absent value. (The dashboard's Applications & Views chart was already
honest: it is `EMPLOYER_TREND_PLACEHOLDER` and carries a visible "Sample" badge.)

**`candidateBands` was `{strong: 0, possible: 0, weak: 0}` with a real applicant.** It counts
`recommendations` for the job, not applicants — a different population, deliberately so, and
the reasoning is recorded at length in `employer-job.repository.ts` (an average match score
would be a magnitude claim the ρ 0.662 calibration does not support). It stays zero until the
matching pipeline has run for the job. Correct as built; worth knowing before someone
"fixes" it.

---

## 3. State of the fixes

All in `jobfit-backend`, uncommitted at the time of writing:

```
M src/modules/job/presentation/dto/search-job.query.dto.ts                   finding 1
M src/modules/job/application/use-cases/search-jobs.use-case.ts              finding 1
M src/modules/job/application/job.service.ts                                 findings 1, 6
M src/modules/application/application.service.ts                             finding 1
M src/modules/employer/presentation/controllers/employer-auth.controller.ts  finding 2
M src/modules/admin/presentation/controllers/admin-auth.controller.ts        finding 2
M src/modules/employer/presentation/controllers/employer-job.controller.ts   finding 4
M src/modules/employer/application/services/employer-job.service.ts          findings 4, 5
M src/modules/application/application.service.spec.ts                        finding 1 (fixture + new test)
M src/modules/application/application.service.resume.spec.ts                 finding 1 (fixture)
```

And in `jobfit-frontend`:

```
M src/features/employer/api/employer.api.ts        finding 4 — closeJob
M src/features/employer/hooks/use-employer.ts      finding 4 — useCloseJob
M src/app/employer/jobs/[jobId]/page.tsx           findings 4, 7 — Close Job button, honest tiles
```

**Backend:** `tsc --noEmit` clean · `nest build` clean · **101 suites / 1161 tests passing**
(1160 before, plus one new test pinning finding 1: a job that is not published is refused and
stores nothing — no application row, no timeline event, no screening).
**Frontend:** `tsc --noEmit` clean · eslint clean.

> The two `refresh-token` suites and `ai.client` / `http-cache.interceptor` are load-flaky
> under a full run and pass in isolation — `EMPLOYER_HANDOFF.md` §8 says not to chase them.
> They failed on the first run of this pass and passed on the second, unchanged. Not related
> to anything here.

✅ **All fixes were re-verified against a running server** once Docker was started — every
check in §4 passed, plus a regression pass confirming the original accepted application,
offer thread, resume URL, analytics and public browse are all unaffected. The throwaway
draft created for the draft-visibility check was deleted afterwards.

---

## 4. Verification checklist — all passing

Every line below was run against a live server on 2026-08-30 and passed. Re-run it after any
change to the job read path, the auth controllers, or the employer job routes.

**Start Docker Desktop first** — the backend will not boot without the `jobfit-redis`
container, and a Redis that is merely *reachable* is not enough for the auth checks (see
finding 3).

```bash
API=http://localhost:4000/api/v1

# 1 — drafts are private
curl -s -o /dev/null -w '%{http_code}\n' "$API/jobs?status=DRAFT"   # 400 (param is gone)
curl -s "$API/jobs" | grep -c '"status":"DRAFT"'                    # 0
curl -s -o /dev/null -w '%{http_code}\n' "$API/jobs/<a-draft-id>"   # 404
# ...and applying to a draft is refused:
#   400 "This job is not accepting applications."

# 2 — failed logins are honest
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$API/employer/auth/login" \
  -H 'Content-Type: application/json' -d '{"email":"bot50856@gmail.com","password":"wrong"}'
#   401, not 500.  Unactivated account -> 401.  6th attempt -> 429.
#   Same for POST /admin/login.

# 3 — logout revocation + lockout (both correct; need Redis alive)
#   docker exec jobfit-redis redis-cli GET blacklist:<jti>   -> 1
#   reusing the token after logout                           -> 401
#   6 failed logins                                          -> 401 x5 then 429

# 4 — close works, repost still absent
#   POST /employer/jobs/<own-id>/close   -> 200, status CLOSED
#   the closed job then leaves GET /jobs but stays readable by id

# 5 — employer list carries currency and period
curl -s "$API/employer/jobs" -H "Authorization: Bearer $T" | grep -o '"salaryRange":{[^}]*}'
#   includes "period":"MONTHLY"

# 6 — publish refuses a foreign job with 403, not 400
```

---

## 5. Test data left on the live database

`DATABASE_URL` is a **live Supabase instance**, so this is real data, not a fixture:

- job `444b9893…` "E2E Backend Engineer (Test)", **published** under Celonis, with a real
  accepted application and offer attached. Safe to delete once nobody needs the worked
  example in the UI — delete the offer and application first, or the foreign keys will
  complain.
- the employer's `EmployerProfile` claim on Celonis. **Keep it** — it is how that account
  logs in and reaches a dashboard at all.
- Celonis gained `description`, `website`, `industry`, `city` and `country`, all previously
  null, while exercising §7.4. Harmless, and more accurate than the blank row, but it was
  not there before.

---

## 6. Still open after this pass

1. **Repost** (finding 4), including the match-clearing rule §7.2 attaches to it. The only
   piece of the employer spec still unbuilt after this pass.
2. **`views`** (finding 7) — the UI no longer lies about it, but there is still no view
   tracking. Either build it or drop the tile.
3. **Make the Redis fail-open visible** (finding 3) — it silently disables session
   revocation and brute-force lockout while the API looks healthy.
4. Everything already listed in `EMPLOYER_HANDOFF.md` §9, which this pass did not touch: the
   suspended-vs-closed login refusal, seeker acceptance criteria, the retention policy,
   `FRONTEND_URL` in production, and the pending `20260829160000_company_identity` migration.
