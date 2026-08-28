# Employer onboarding — building the front door to a product that already exists

> Created 2026-08-28. Implements the decisions taken on `employer_logic.md` v2.0.
> Spans **both repos**: `jobfit-backend` (schema, endpoints, email) and `jobfit-frontend`
> (admin screen, employer portal). Phases 1–4 are backend; 5–6 are frontend; 7–8 are both.
>
> **No code until this plan is agreed.**

---

## Why now

The employer feature set is built and unreachable.

`grep` for anything assigning `role = EMPLOYER` outside guards returns **nothing** in
`jobfit-backend/src`. `RegisterDto` has no role field, so public signup always yields
`JOB_SEEKER`. The admin panel can search, view, reset a password, unlock and soft-delete a
user — it **cannot create one or change a role**. Every employer that exists came from
`prisma/seed.ts:221`.

So company claim, job posting, the applicant pipeline, analytics and the offer round-trip
are all finished work behind a door with no handle. This plan builds the handle.

| # | What is missing | Phase |
|---|---|---|
| 1 | No `EmployerRequest` model — the whole onboarding ticket | 1 |
| 2 | No runtime path to create an `EMPLOYER` user | 2–3 |
| 3 | No activation / credential delivery | 3 |
| 4 | No `/employer/login`; role checks are client-side only | 6 |
| 5 | Account status is two booleans, not three states | 7 |
| 6 | No employer-side requirements to audit any of it against | 8 |

---

## Decisions locked

Taken 2026-08-28. These close the open questions in v2.0 and **supersede the document
where they disagree**.

1. **Claim/verify — compose, not replace.** Admin review is the trust anchor; the existing
   automated domain verification runs *after* first login, as part of company profile
   setup. Because the admin already verified the company, that step must not be able to
   contradict them (see Phase 4 — this is the subtlest part of the plan).
2. **No session limit.** v2.0 §5.3's "hard limit of 1 active session" is **cancelled**.
   `RefreshToken` stays multi-session with rotation-based theft detection, platform-wide.
   Better for HR teams on several devices, and the rotation design is already stronger
   than a session cap.
3. **New Admin Panel screen.** An "Employer Requests" area, backed by a real
   `EmployerRequest` state machine, with a 6-digit code emailed on approval.

**Corrections carried into every phase:** the enum member is `JOB_SEEKER`, not `SEEKER`;
lockout stays at **30 minutes** (the existing Redis implementation — v2.0 said 15); no
Telegram integration is built, admin conversation stays manual and system notifications use
the existing email and Slack services.

---

## Phase 0 — Reconcile the spec before writing any code

`employer_logic.md` v2.0 is the source of truth and currently contradicts three decisions
above plus the codebase. Fix the document first, so nobody implements from the stale copy.

- Apply the three decisions and the three corrections.
- **Replace §4.3's "one-time secure link containing the temporary password"** with the
  6-digit activation code (Phase 3). This is not a downgrade — it means **no password is
  ever transmitted**, and it reuses machinery the platform already has
  (`verificationCode` / `passwordResetCode`, both 6-digit with expiry).
- Consequently **drop `force_password_reset`** from §4.3. The employer sets their own
  password at activation, so there is no temporary one to force a change from. One less
  column, one less screen, one less state.
- Note in §5.3 that lockout is 30 minutes and also has an **IP tier** (20 failures /
  15 min → 30 min) that v2.0 never mentioned.

---

## Phase 1 — Data model

One new model, one new enum, one changed field. Backend only.

**`EmployerRequest`** — the onboarding ticket. Deliberately **separate from `User`**: it
exists before any account does, and it must survive rejection, which an account row must
not.

```
id, companyName, contactName, contactRole, companyEmail, companyWebsite,
description, supportingDocsUrl?, status, adminNotes?, reviewedByAdminId?,
approvedCompanyId?, createdAt, updatedAt, reviewedAt?
```

**`EmployerRequestStatus`**: `SUBMITTED | REVIEWING | PENDING_INFO | APPROVED | REJECTED`.

**Account status.** v2.0 §7 wants `ACTIVE → SUSPENDED → DEACTIVATED`; `User` has
`isActive: Boolean` + `deletedAt: DateTime?` — two booleans expressing three states badly
(nothing distinguishes "suspended for a policy violation" from "closed forever"). Add a
`UserStatus` enum and backfill: `deletedAt != null → DEACTIVATED`, else
`isActive === false → SUSPENDED`, else `ACTIVE`. Keep `deletedAt` — it is the GDPR
soft-delete and has its own meaning.

**Do not add** `force_password_reset` (see Phase 0) and **do not add** a session-count
column (decision 2).

⚠️ **`approvedCompanyId` is what makes Phase 4 work.** The admin decides *which* company
this request is for at approval time. Without it, first-login claim is a free-text search
and the employer can claim the wrong company after being approved for a different one.

---

## Phase 2 — Request intake and admin review

Backend. New `employer-request` module, or a controller inside `admin`.

- `POST /employer-requests` — **public**. The intake form. Rate-limited; it is unauthenticated.
- `GET /admin/employer-requests` — list with status filter and search.
- `GET /admin/employer-requests/:id`
- `PATCH /admin/employer-requests/:id/status` — `REVIEWING`, `PENDING_INFO`, `REJECTED`
  (with `adminNotes`; a rejection reason is required).

**Conflict check.** v2.0 §4.2 wants the email conflict resolved at approval. Do the check
in the same transaction as the account creation, not before it — a check-then-create pair
is a race, and `User.email @unique` is the only thing that can answer atomically. Surface
the constraint violation as a typed 409 the admin UI can render.

**Public-domain warning.** Computed, not stored — compare the email domain against a list
of free providers. A stored flag would go stale if the list changes.

**48-hour SLA.** Also computed (`createdAt` vs now, for `SUBMITTED`/`REVIEWING`). Nothing
to persist, nothing to keep in sync.

---

## Phase 3 — Approval, account creation and activation

The heart of it. One transaction, then one email.

**On approve:**

1. Create `User` — `role: EMPLOYER`, `status: ACTIVE`, **`emailVerified: false`**,
   `passwordHash: ''`.
2. Generate a 6-digit activation code + expiry, mirroring the existing verification-code
   pattern.
3. Mark the request `APPROVED`, stamp `reviewedByAdminId` and `approvedCompanyId`.
4. Send the approval email through the existing `EmailService` (nodemailer/SMTP).

⚠️ **`emailVerified` must be false until the code is used.** Login refuses unverified
accounts (`login.handler.ts`), and that refusal is the *only* thing standing between an
approved-but-unactivated row and a login with an empty password hash. Entering the code is
what proves inbox control, so activation is what flips it — never approval.

**Activation endpoint** — `POST /employer/auth/activate` `{ email, code, newPassword }`:
validates the code and expiry, sets the password, sets `emailVerified: true`, clears the
code, and issues a session. This replaces v2.0's temp-password-in-a-link entirely.

**Resend** — `POST /admin/employer-requests/:id/resend-credentials`, per v2.0's expired-link
flow. Generates a fresh code and invalidates the old one.

The ToS clause from v2.0 §4.3 goes in the approval email body.

---

## Phase 4 — Compose approval with the existing claim/verify

This is the phase most likely to be got wrong, because it is the one place two sources of
truth meet.

Today `POST /employer/companies/:id/verify-email` answers **400 "Domain mismatch or no
website"** when `company.website` is empty or the domains differ. That check is good and
stays. But after this plan, an employer arriving at it has **already been approved by a
human who checked their business registration** — so the automated check must never be able
to overturn the admin.

Two concrete failure cases, both reachable today:

- The seeded or ingested company row has **no website**, so the check 400s on data the
  employer cannot supply and the admin was never asked for.
- The employer's verified contact address is on a subsidiary or regional domain that does
  not literally match the company website.

**Resolution.** Treat the admin approval as a satisfied verification:

- At claim time, check the claimed company against `approvedCompanyId`. A mismatch is a
  **403** — they were approved for a different company.
- When it matches, mark the company verified on the strength of the approval, recording
  *which* signal verified it (`ADMIN_APPROVAL` vs `DOMAIN_MATCH`) so the two are never
  confused later in an audit.
- Keep the domain check running as a **soft signal**: on mismatch, record it and flag it in
  the admin panel. Do not block the employer.

Self-service claim without an approved request stays available for the automated path and
keeps its current strict 400 behaviour.

---

## Phase 5 — Admin Panel: Employer Requests

Frontend, `jobfit-frontend`.

- New route `src/app/admin/employer-requests/` (+ `/[id]`), and a nav entry. **Note the
  admin sidebar is not yet on the shared `NAVIGATION_GROUPS` config** — it is defined in
  `src/app/admin/layout.tsx`. Add it there, or lift admin nav into
  `shared/config/navigation.tsx` first for consistency with the seeker side.
- **List** — status filter, search, and the SLA rule: rows in `SUBMITTED`/`REVIEWING` for
  more than 48 hours render in the error tone.
- **Detail** — the submitted information, supporting documents, admin notes, and the
  yellow public-domain badge.
- **Actions** — Approve / Reject (reason required) / Request Info.
- **Conflict modal** — on the typed 409 from Phase 2: *"Conflict: email exists as
  {role}"*, offering **Request different email** (→ `PENDING_INFO`) or **Reject**.
- **Resend credentials** on an approved request.

Reuse `Modal`, `Alert`, `Badge`, `EmptyState`, `Skeleton` and the toast store rather than
building new primitives. Follow `docs/rule_for_develop_frontend.md`: tokens only, no
hardcoded colours.

---

## Phase 6 — Employer portal

Frontend + one backend endpoint. **Copy `admin-auth.controller.ts` — it already solves
exactly this**: a `@Public()` login that returns **403 when the account is not the expected
role**, with its own cookie handling.

- `POST /employer/auth/login` — same shape, 403 for non-`EMPLOYER`.
- `src/app/employer/login/` — the portal. `src/app/employer/` has routes for applications,
  dashboard, imported-jobs, jobs and settings, but **no login**.
- `src/app/employer/activate/` — email + 6-digit code + set password (Phase 3).
- Cross-links both ways, per v2.0 §5.1: *"Are you an employer? Log in here"* on `/login`,
  and the reverse.
- On a 403 role mismatch, render *"This is a Job Seeker account — please use the standard
  login portal"* with a link, rather than a generic failure.

This also closes a real gap: role enforcement for the employer area is currently
**client-side only** (`useRequireAuth({ roles: ["EMPLOYER"] })` in
`src/app/employer/layout.tsx`). The layout guard stays, but it stops being the only check.

---

## Phase 7 — Lifecycle and audit

- Admin suspend / reactivate / deactivate against the Phase 1 `UserStatus`, and a login
  refusal for anything but `ACTIVE` with a message that distinguishes suspended from closed.
- **Extend audit logging.** `AuditLog` exists but is scoped to admin actions
  (`adminId`, `actionType`, `resourceType`, `resourceId`). v2.0 §5.3 wants every login
  attempt, password change and status change with `ip_address`. Either widen `AuditLog` to
  allow a non-admin actor, or add a sibling `SecurityEvent` table. **Widening is cheaper;
  a sibling keeps admin-accountability records separate from high-volume auth noise** —
  worth deciding explicitly rather than by accident, because these two tables grow at very
  different rates.
- Add the new admin actions to `AuditActionType`.

---

## Phase 8 — Write the requirements that would have caught all this

`docs/SRS.md` records that **all 33 functional requirements are seeker-side**, and that this
is *"how whole requirements go missing silently"* — the example it gives is finding #9, an
employer who could not see a candidate's résumé. (That endpoint now exists —
`GET /employer/applications/:id/resume`, signed and company-scoped — but the structural
cause was never fixed.)

Add an `EMPLOYER-00x` block covering: request intake, admin review, conflict handling,
activation, portal separation, company claim composition, and the lifecycle states. Format
per SRS.md's own recommendation — id, actor, statement, testable acceptance criteria, and
the endpoints that satisfy it — then re-run the scorecard.

Cheap now, because Phases 1–7 define exactly what the criteria are.

---

## Sequencing

```
Phase 0  ─── spec        (blocks everything)
Phase 1  ─── schema      (blocks 2,3,4,7)
Phase 2 ── Phase 3 ── Phase 4        backend chain
              │
              ├── Phase 5  admin UI      ┐ can run in parallel
              └── Phase 6  employer UI   ┘ once Phase 3 endpoints exist
Phase 7  ─── after 1
Phase 8  ─── last: writes down what was built
```

Phase 4 must not ship before Phase 3 — an employer who reaches claim/verify without an
approved request falls back to the strict automated path and gets a 400 they cannot fix.

---

## Risks

- **Two verification signals for one fact.** Phase 4 is where a subtle authorization bug
  would live. Record *which* signal verified a company; never let an audit have to guess.
- **The approved-but-never-activated row.** A `User` with an empty password hash exists
  between approval and activation. `emailVerified: false` is the guard, and a test must pin
  that a login attempt in that window is refused.
- **The repo moves under you.** `main` gained PWA, i18n, dark mode and a command palette
  during a single working session on 2026-08-24. Re-read `navigation.tsx` and
  `admin/layout.tsx` before Phase 5 rather than trusting this document's description of them.

---

## Out of scope

- **Telegram integration** (decision). Admin conversation stays manual; system mail goes
  through `EmailService`, alerts through the existing Slack notifier.
- **Any session limit** (decision 2). `RefreshToken` is untouched.
- **Changing the lockout policy.** 30 minutes stays; only the document changes.
- **Renaming `JOB_SEEKER`.** The enum wins; the document changes.
- **Employer self-registration.** Already impossible, and stays that way by design.
- **Billing for employers.** Not investigated. `PROJECT_OVERVIEW.md` has not been read on
  this point, so nothing here assumes a paid tier.
