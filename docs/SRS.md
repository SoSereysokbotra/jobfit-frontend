# Software Requirements Specification

> **Status:** partial. The `EMPLOYER-00x` block below is real; the 33 seeker-side FRs it
> sits beside are still only ids in a scorecard, with no acceptance criteria anywhere.
> See "What is still missing" at the end.

---

## Why this file exists

For the life of the project this file was empty (0 bytes), while
`jobfit-backend/docs/Missing and Not Start feature/01-scorecard.md` graded **"All 33
Functional Requirements"** — `AUTH-001`, `RESUME-004`, `RECS-003` and the rest —
*"against the SRS acceptance criteria"*. Those criteria did not exist. Every id in that
scorecard was a dangling reference (external review finding #18).

That is not merely untidy. The scorecard's own summary names the consequence:

> **The structural gap: there are no employer-side requirements.** All 33 FRs are written
> from the job seeker's perspective. Consequently nothing in this scorecard records that
> an employer cannot see a candidate's résumé, profile or cover letter anywhere in the API.

An employer who could not read a CV — the single thing an employer does — went unrecorded
for months, because no requirement existed for it to fail. That endpoint now exists
(`GET /employer/applications/:id/resume`), but the structural cause did not go away: the
audit still had no employer half.

This block is that half.

---

## EMPLOYER — Onboarding, access and lifecycle

Implements `docs/employer_logic.md` v2.1. Each requirement states the actor, what must be
true, criteria that can be checked, and the code that satisfies them.

> **Vocabulary.** *Request* is the onboarding ticket (`EmployerRequest`), which exists
> before any account. *Account* is the `users` row. They have separate state machines and
> a rejected request must leave no account behind.

---

### EMPLOYER-001 — Registration request

**Actor:** a prospective employer, unauthenticated.
**Statement:** a company can ask to join without an account, and cannot create one.

**Acceptance criteria**

1. `POST /employer-requests` succeeds without authentication and stores company name,
   contact name and role, company email, description, and optional website and documents.
2. The public signup form cannot produce an `EMPLOYER`: `RegisterDto` has no role field, so
   registration always yields `JOB_SEEKER`.
3. The response reveals nothing about whether the address already has an account. A second
   *open* request for the same address is refused (409); an address that merely exists as a
   user is not distinguishable through this endpoint.
4. A rejected request does not block the address from applying again.

**Satisfied by:** `employer-request.controller.ts`, `employer-request.service.ts#submit`,
`register.dto.ts` (absence of a role field is the control).

**Why (3) is a criterion, not a nicety:** answering "that email is taken" to an anonymous
caller turns the intake form into an account-enumeration oracle.

---

### EMPLOYER-002 — Admin review

**Actor:** admin.
**Statement:** every request reaches a human decision, and the queue makes an overdue one
visible.

**Acceptance criteria**

1. `GET /admin/employer-requests` lists requests oldest-first, filterable by status and
   searchable by company name or contact email. `ADMIN` role required.
2. Each row carries `hoursAwaitingDecision`, `breachesSla` (> 48 h) and `isPublicDomain`,
   all computed per request — none of them stored, so none can go stale.
3. `PATCH :id/review` moves a request to `REVIEWING`, `PENDING_INFO` or `REJECTED`.
4. A rejection without `adminNotes` is refused (400). The note is emailed verbatim.
5. A request that is already `APPROVED` or `REJECTED` cannot be re-decided (409).
6. A free-provider contact address (gmail and similar) is flagged, not blocked.

**Satisfied by:** `admin-employer-request.controller.ts`,
`employer-request.service.ts#review`, `src/app/admin/employer-requests/`.

---

### EMPLOYER-003 — Approval and account creation

**Actor:** admin.
**Statement:** approval is the only way an `EMPLOYER` account comes into existence, and it
is atomic.

**Acceptance criteria**

1. `POST :id/approve` creates a `users` row with `role: EMPLOYER`, `status: ACTIVE`,
   `emailVerified: false` and an **empty password hash**, and marks the request `APPROVED`
   — in one transaction.
2. `approvedCompanyId` records which company the approval was for.
3. An address that already belongs to an account produces a typed **409** decided by the
   unique index *inside* that transaction, never by a prior read.
4. The account cannot authenticate until activation: login refuses unverified accounts.
5. A failure to deliver the activation email does **not** roll back the approval.
6. The action is attributable — an `AuditLog` row with the acting admin.

**Satisfied by:** `employer-approval.service.ts#approve`,
`employer-approval.service.spec.ts` (invariants 1, 3, 5 are pinned by tests).

**Why (3) is a criterion:** a check-then-create pair is a race. `users.email @unique` is
the only thing that can answer atomically.

**Why (4) is a criterion:** between approval and activation a row exists with no password.
The unverified-account refusal is the only thing guarding it.

---

### EMPLOYER-004 — Activation

**Actor:** an approved employer.
**Statement:** the employer proves control of the company inbox and sets their own
password. No password is ever transmitted.

**Acceptance criteria**

1. Approval emails a 6-digit code with a 24-hour expiry to the company address only.
2. `POST /employer-requests/activate` takes email, code and a new password; on success it
   sets the password, sets `emailVerified: true` and clears the code — in one transaction.
3. An invalid code, an expired code and an unknown address produce the **same** message.
4. A used code cannot be reused.
5. `POST /admin/employer-requests/:id/resend-activation` issues a fresh code and
   invalidates the previous one; it is refused for a request that is not approved.

**Satisfied by:** `employer-approval.service.ts#activate`, `#resendActivation`,
`src/app/employer/activate/`.

**Why (3) is a criterion:** distinguishing them lets anyone probe which company addresses
have been approved.

---

### EMPLOYER-005 — Portal separation

**Actor:** employer; job seeker at the wrong door.
**Statement:** the employer area is enforced server-side, and a wrong-portal arrival is
directed rather than refused.

**Acceptance criteria**

1. `POST /employer/auth/login` authenticates and requires `EMPLOYER`; any other role gets
   **403**, and a `JOB_SEEKER` is told to use the main sign-in.
2. The role check happens **after** the password check, so it reveals nothing the caller
   had not already proved.
3. `/login` and `/employer/login` link to each other.
4. Lockout applies identically to both portals: 5 account failures / 15 min → 30 min, plus
   an IP tier of 20 / 15 min → 30 min. Unlock is automatic; an admin can unlock early.
5. Sessions are multi-device. There is no session cap.

**Satisfied by:** `employer-auth.service.ts`, `employer-auth.controller.ts`,
`account-lockout.service.ts`, `src/app/employer/login/`.

**Note on (5):** v2.0 specified a hard limit of one active session. It was cancelled —
`RefreshToken` is a deliberate multi-session design with rotation-based theft detection,
which is stronger than a cap and better for a hiring team on several devices.

---

### EMPLOYER-006 — Company claim and verification

**Actor:** employer, first login.
**Statement:** an employer manages exactly the company they were approved for, and the two
verification signals never contradict each other.

**Acceptance criteria**

1. Claiming a company other than `approvedCompanyId` is refused (**403**).
2. On a matching claim the company is marked verified with method `ADMIN_REVIEW` — even
   when the email domain also matches, because the approval is what carried it.
3. The automated domain check still runs and its result is recorded as `MATCH`,
   `MISMATCH` or `NO_WEBSITE`. It **never blocks**, and a non-match is surfaced to the
   admin.
4. A failure to record that signal does not block a verification the admin authorised.
5. Self-service claim by an employer with **no** approved request is unchanged: the domain
   match is authoritative and a mismatch is still a 400.
6. One employer per company; a claimed company cannot be claimed again (409).

**Satisfied by:** `employer-company.service.ts#claim`, `#verifyEmail`,
`employer-company.approval.spec.ts`.

**Why (3) cannot be authoritative:** the check answers "no website" for the many seeded and
ingested company rows that have none, and `MISMATCH` for a recruiter on a subsidiary or
regional domain. Either would refuse an employer a human already verified against a
business registration.

---

### EMPLOYER-007 — Account lifecycle

**Actor:** admin.
**Statement:** an account can be stopped reversibly or permanently, and the stop takes
effect at once.

**Acceptance criteria**

1. `POST /admin/users/:id/status` sets `ACTIVE`, `SUSPENDED` or `DEACTIVATED`.
2. Anything other than `ACTIVE` stops authentication — the login gate reads `status`.
3. The change takes effect immediately: the auth cache (entity + email→id lookup, 300 s) is
   invalidated with the write.
4. `status` and the legacy `isActive` are always written together while the boolean still
   has readers.
5. An admin cannot change their own status (400) — there is no self-service reactivation.
6. A soft-deleted account is not eligible (404).
7. Each transition records a distinct audit action (`USER_SUSPENDED`, `USER_REACTIVATED`,
   `USER_DEACTIVATED`) **and** a `SecurityEvent` on the account's own history.

**Satisfied by:** `admin-user.service.ts#setStatus`,
`admin-user.repository.ts#setStatus`, `admin-user.status.spec.ts`.

**Known gap:** the login refusal does not yet distinguish suspended from closed. `liveOnly`
filters before the password check, so a suspended account is currently indistinguishable
from one that does not exist. Making it specific needs a lookup path that bypasses a cached
repository method — deliberately deferred rather than done casually on the auth path.

---

### EMPLOYER-008 — Security history

**Actor:** admin investigating; the system.
**Statement:** authentication facts are recorded where an account takeover can be
reconstructed.

**Acceptance criteria**

1. `SecurityEvent` records `LOGIN_SUCCEEDED`, `LOGIN_FAILED`, `LOGIN_BLOCKED`,
   `PASSWORD_CHANGED`, `PASSWORD_RESET_REQUESTED` and `ACCOUNT_STATUS_CHANGED` with email,
   optional user, IP and timestamp.
2. A failed login against an address with **no** account is still recorded, against the
   email — that pattern is what credential stuffing looks like.
3. Recording never breaks the operation it describes: every write fails open and logs.
4. The trail outlives the account (`ON DELETE SET NULL`).
5. It is a table separate from `AuditLog`.

**Satisfied by:** `security-event.service.ts`, `login.handler.ts`, `SecurityEvent` model.

**Why (5):** `AuditLog.adminId` is non-nullable, and widening it would destroy the one thing
that table guarantees — every row has an accountable admin. Volume differs by orders of
magnitude, and the two need different retention.

⚠️ **Retention is unresolved.** `SecurityEvent.email` and `.ipAddress` are personal data,
mostly concerning people who are not users. A production deployment needs a purge policy
with a stated horizon. So does `User.deletedEmail`. Neither exists.

---

## What is still missing

- **The 33 seeker-side FRs have no acceptance criteria.** The scorecard grades them against
  a document that, for those ids, still does not exist. The `EMPLOYER-00x` block above is
  the format to copy; doing the same for `AUTH-001` … `SALARY-002` is the remaining work,
  and writing the criteria is what surfaces gaps like the résumé one.
- **No public intake page.** `POST /employer-requests` works and nothing in the frontend
  posts to it, so EMPLOYER-001 is satisfied by the API but not reachable by a real company.
- **No company creation from the admin panel.** An employer whose company is not already in
  the database cannot be approved (EMPLOYER-003).
- **Retention policy** for `SecurityEvent` and `User.deletedEmail`.

Once the seeker FRs are written, re-run
`jobfit-backend/docs/Missing and Not Start feature/01-scorecard.md` against this file so
its ids resolve.
