# Employer onboarding — handoff

> Written 2026-08-30 for whoever picks this up next, human or model.
> Read this before touching anything under `employer-request`, `admin/companies`,
> `employer/auth`, or `company-identity`.
>
> **Spans two repos.** `d:/Year2/Jobfit/jobfit-backend` (NestJS + Prisma) and
> `d:/Year2/Jobfit/jobfit-frontend` (Next.js App Router).

---

## 1. What this work was

The employer half of JobFits — company claim, job posting, the applicant pipeline,
analytics, the offer round-trip — was **fully built and completely unreachable**.

`grep` for anything assigning `role = EMPLOYER` outside guards returned nothing in
`jobfit-backend/src`. The public signup DTO has no role field, so registration can only
produce a `JOB_SEEKER`. The admin panel could search, view, reset a password, unlock and
soft-delete a user — but not create one or change a role. **Every employer that existed
came from `prisma/seed.ts`.**

This work built the way in, plus the things that turned out to be missing once it existed.

Two related terms, kept distinct throughout:

| Term | Means |
|---|---|
| **Request** | `EmployerRequest` — the onboarding ticket. Exists before any account. |
| **Account** | the `users` row. Only ever created by an admin approving a request. |

They have separate state machines. **A rejected request must leave no account behind.**

---

## 2. The flow, end to end

```
Employer fills /employer/register        (or emails/Telegrams the admin, who
        │                                 records it via "New request")
        ▼
Admin queue  /admin/employer-requests    SUBMITTED
        │                                 REVIEWING / PENDING_INFO / REJECTED
        ▼
Admin clicks Approve, picks a company
        │   creates users row: role EMPLOYER, status ACTIVE,
        │   emailVerified FALSE, passwordHash ''
        │   emails a 6-digit code (24h)
        ▼
Employer /employer/activate              code + password of their choosing
        │   sets password, emailVerified TRUE, clears code
        ▼
Employer /employer/login                 403 for a non-EMPLOYER account
        ▼
First claim → company verified (ADMIN_REVIEW), domain check recorded as advisory
```

---

## 3. Decisions that are not obvious, and why

Change these only with a reason better than the one recorded here.

**Approval creates an account with an empty password hash.** The `emailVerified: false`
flag is the *only* thing stopping a login against that row. Flipping it anywhere but
activation opens a hole. Pinned by a test.

**The email conflict is decided by the unique index, inside the approval transaction.** A
check-then-create pair is a race. `users.email @unique` is the only thing that can answer
atomically; `P2002` is translated into the 409 the admin UI has a dialog for.

**Public intake reveals nothing about existing accounts.** Saying "that email is taken" to
an anonymous caller turns the form into an account-enumeration oracle. The conflict surfaces
at approval instead, where only an admin sees it.

**A bounced activation email does not roll back approval.** The account exists and the code
is stored, so Resend recovers it. Throwing would report failure for work that succeeded and
invite a retry into the unique constraint.

**Activation answers identically for a wrong code, an expired code and an unknown address.**
Distinguishing them lets anyone probe which company addresses were approved.

**Role is checked AFTER the password.** A 403 at that point reveals nothing the caller had
not already proved. It also lets the message name the other portal, which is a real
wrong-door case.

**Sessions are multi-device.** v2.0 specified one active session; it was cancelled.
`RefreshToken` is a deliberate multi-session design with rotation-based theft detection,
which is stronger than a cap.

**`SecurityEvent` is a sibling of `AuditLog`, not an extension.** `AuditLog.adminId` is
non-nullable; widening it destroys the guarantee that every audit row has an accountable
admin. Volumes differ by orders of magnitude and need different retention.

**Company name is a display attribute, not an identity.** See §5 — this is the subtlest
part of the whole system.

---

## 4. Where things live

### Backend — `jobfit-backend`

```
src/modules/employer-request/            the onboarding ticket
  application/services/
    employer-request.service.ts          intake + admin review
    employer-approval.service.ts         approve, activate, resend  ← only place
                                         that assigns role = EMPLOYER
  presentation/controllers/
    employer-request.controller.ts       POST / (public), POST /activate (public)
    admin-employer-request.controller.ts the admin queue

src/modules/admin/
  application/services/
    admin-company.service.ts             company search, match, create + conflict rules
    admin-user.service.ts                #setStatus — account lifecycle
  presentation/controllers/
    admin-company.controller.ts          GET /, GET /match, POST /

src/modules/employer/
  application/services/
    employer-auth.service.ts             portal login, mirrors AdminAuthService
    employer-company.service.ts          claim + verifyEmail (the composition, §5)

src/shared/
  utils/company-identity.ts              normalizeDomain / domainFromEmail /
                                         buildIdentityKey  ← read this first
  services/security-event.service.ts     auth history, fails open
  services/email.service.ts              activation mail + the link
```

### Frontend — `jobfit-frontend`

```
src/app/admin/employer-requests/         queue + detail (approve/reject/info/resend)
src/app/employer/register/               public intake
src/app/employer/login/                  portal sign-in
src/app/employer/activate/               code + choose password
src/features/employer-request/           api, hooks, portal shell, status maps
```

### Docs

| File | |
|---|---|
| `employer_logic.md` | **v2.1 — the spec.** Product rules. Where this and code disagree, ask. |
| `EMPLOYER_ONBOARDING_PLAN.md` | the 8-phase plan, all delivered |
| `EMPLOYER_INTAKE_PLAN.md` | public intake, delivered |
| `SRS.md` | `EMPLOYER-001…008` with testable acceptance criteria |
| `EMPLOYER_E2E_FINDINGS.md` | **2026-08-30 end-to-end run.** 6 defects found and fixed, verified live. §6 lists what is still open; finding 3 explains why a dead Redis silently disables logout revocation and lockout. |

---

## 5. Company identity — the part most likely to be broken by accident

`companies.name` **used to be `@unique`**. That asserted two businesses cannot share a name.
They can: "Acme Robotics" in Phnom Penh and in Siem Reap are different companies. The
constraint meant the second could not be onboarded at all, and the approve dialog then
offered the admin the *first* one — silently binding a recruiter to someone else's company.

Identity now lives in `companies.identityKey`, which records **which signal it came from**:

```
domain:acme-kh.com     strong — from a website, or from a work email
name:acme robotics     weak   — the only signal a scraped company has
```

The prefix is load-bearing: it keeps a scraped "Acme Robotics" and an employer's
`acme-robotics.com` in separate namespaces so they never fight over one row.

Resolution order in `buildIdentityKey`:

1. **stated website** — the company's own claim about itself
2. **work email domain** — `hr@github-kh.com` → `github-kh.com`. The website is optional on
   the form and routinely skipped; the email is required. Consumer providers
   (`gmail.com` and ~18 others) are refused, because `me@gmail.com` identifies a person and
   would merge every gmail-using employer into one row.
3. **normalized name** — last resort

Rules that follow:

| Case | Behaviour |
|---|---|
| Same name, different domain | two companies, allowed. Name match shown as an advisory candidate. |
| Same name, same domain | refused, 409 carries the existing company |
| Different name, same domain | refused, surfaced for review — no automatic merge |
| Same IP | **never consulted.** IP is not identity. |
| Same name, no domain on either | refused — "add the website to tell them apart" |

> ⚠️ **INGESTION DEPENDS ON `identityKey` BEING UNIQUE.** `ingestion.service.ts` upserts a
> company per scraped job. No source in `ingestion.types.ts` publishes a company website —
> the scrapers give a name and nothing else — so those rows use the weak key. Removing that
> unique index without a replacement makes **every scraped job create a new company**.

---

## 6. Current state

**Backend** `feat/employer-onboarding` — 8 commits pushed, then **uncommitted work**:

```
M  prisma/schema.prisma                       Company: name no longer unique,
                                              + domain, + identityKey
M  admin/admin.module.ts                      registers AdminCompanyService
M  admin/.../admin-company.controller.ts      + GET /match, service extracted
M  company/.../company.repository.ts          computes identity on save
M  employer-request/.../employer-request.service.ts   provider list moved out
M  ingestion/ingestion.service.ts             upsert on identityKey, not name
?? prisma/migrations/20260829160000_company_identity/
?? admin/application/services/admin-company.service.ts (+ spec)
?? ingestion/ingestion.company-dedupe.spec.ts
?? shared/utils/company-identity.ts (+ spec)
?? match-labels-backup-20260829.json          ⚠️ DO NOT COMMIT — see §8
```

**Frontend** `refactor/employer` — 6 commits pushed, then uncommitted:

```
M  admin/employer-requests/[id]/page.tsx      conflict panel + create fallback
M  features/employer-request/api + hooks      match/create, contactEmail
M  lib/api/query-keys.ts                      companyMatch key
```

**Verification at handoff:** `tsc` clean both repos · `nest build` clean · eslint clean ·
**101 suites / 1160 backend tests passing.**

**Migrations — 5 written. The first four are applied; `20260829160000_company_identity` is
NOT.**

```
20260828120000_employer_onboarding      applied
20260828140000_employer_domain_check    applied
20260829100000_user_lifecycle_audit     applied
20260829140000_security_events          applied
20260829160000_company_identity         ⚠️ NOT APPLIED
```

`DATABASE_URL` points at a **live Supabase instance**. Do not run destructive SQL without
asking. `npx prisma migrate deploy` applies the pending one.

---

## 7. Test accounts

```
Admin      admin@jobfit.com / Admin123!
Employer   employer@stripe.com / Employer123   (8 seeded, all same password)
```

Non-admin users were deleted on 2026-08-29 (see §8), so **re-seed if you need employers**:
`npx prisma db seed`. 257 companies and 367 jobs were kept.

Activation codes go to real inboxes — SMTP is configured. For a fake address, read the code
from the database:

```sql
SELECT "companyEmail", "activationCode" FROM employer_requests WHERE status = 'APPROVED';
```

---

## 8. Landmines

**`match-labels-backup-20260829.json`** sits untracked in the backend repo. It is the only
copy of 50 hand-labelled evaluation pairs, exported before a delete cascaded them away, and
it contains a user's email address. **Do not commit it.** Move it somewhere safe or gitignore
it. The schema records that the same 50 labels were destroyed once before by a hard delete.

**Two `refresh-token` suites are load-flaky**, not broken — they fail under a loaded full
run and pass in isolation. Same for `ai.client.spec.ts` and `http-cache.interceptor.spec.ts`.
Don't chase them.

**`/admin/companies` (the sidebar page) is still mock data** — a hardcoded array, no API.
Only the company picker inside the approve dialog is real. Wiring the page up is a small job
now that `GET /admin/companies` exists.

**The repo moves under you.** Files changed mid-session more than once. Re-read before
editing rather than trusting a description — including this one.

**Windows shell.** Heredocs and bash-style `curl` do not work in PowerShell. Use
`Invoke-RestMethod`, and `git commit -m "subject" -m "body"` rather than `-F -` with a
heredoc.

---

## 9. What is not done

> Superseded in part by `EMPLOYER_E2E_FINDINGS.md` (2026-08-30). The first live end-to-end
> run found six real defects — including drafts being publicly applicable and every failed
> employer/admin login answering 500 — all now fixed and re-verified. Its §6 lists what
> remains; repost is the only piece of the employer spec still unbuilt.

- **Seeker FRs have no acceptance criteria.** `SRS.md` now has `EMPLOYER-001…008`, but the
  33 seeker requirements the scorecard grades still resolve to nothing. The employer block
  is the format to copy.
- **The login refusal does not distinguish suspended from closed.** `liveOnly` filters
  before the password check, so a suspended account looks identical to a nonexistent one.
  Making it specific needs a lookup path around a cached repository method — deliberately
  deferred rather than done casually on the auth path.
- **No company creation for employers**, only admins. An employer whose company is not in
  the database depends on the admin creating it from the request.
- **No retention policy** for `SecurityEvent.email` / `.ipAddress` or `User.deletedEmail` —
  personal data, mostly about people who are not users.
- **`FRONTEND_URL` must be set in production**, or the activation email links point at
  localhost. It falls back to `CORS_ORIGIN`, then localhost.
- **Pending migration** (§6). Nothing in company identity is live until it runs.

---

## 10. If you change one thing, check these

| Touching | Also check |
|---|---|
| `company-identity.ts` | ingestion dedupe — it is the biggest consumer |
| `companies` schema | `ingestion.service.ts` upsert needs a unique key |
| `liveOnly` in `user.repository.ts` | it gates login, refresh, verify and reset |
| approval transaction | the four invariants in `employer-approval.service.spec.ts` |
| `AuthProvider` / token handling | `/employer/login` clears the query cache on purpose — `/auth/me` is cached 5 minutes and a stale identity routes to the wrong dashboard |
| any `page.tsx` | Next.js allows only the route's own exports; shared components must live in `features/` |
