# JobFit — Employer Flow & Business Logic (v2.1)

> **Document Type:** Product Logic & Architecture Specification
> **Scope:** Employer Registration, Authentication, Account Lifecycle, and Recruitment Posting
> **Last Updated:** 2026-08-28
> **Status:** Approved for Implementation — see `docs/EMPLOYER_ONBOARDING_PLAN.md`

> **What changed from v2.0.** Three decisions were taken after an audit of the existing
> code, and three details in v2.0 disagreed with what is already built. Both sets are
> applied throughout and summarised in §1.1. Where this document and v2.0 differ, **this
> one wins**.

---

## 1. Overview

JobFit is a resume-matching platform connecting job seekers with opportunities. The
platform serves two strictly separated user types, plus the platform operator.

| User Type | Primary Goal |
|-----------|-------------|
| **Job Seeker** (`JOB_SEEKER`) | Upload resume and get matched to suitable job listings |
| **Employer** (`EMPLOYER`) | Post job recruitment listings to attract matched candidates |
| **Admin** (`ADMIN`) | Operate the platform; gate employer access |

The employer is **a customer, not staff** — a recruiter at an outside company (say
TechCorp) who uses JobFit to fill TechCorp's roles. The admin is the JobFit side.

### 1.1 Changes applied in v2.1

| # | v2.0 said | v2.1 says | Why |
|---|---|---|---|
| 1 | Silent on company claim/verify | **Compose** — admin approval first, then the existing claim + domain verification at first login (§6) | The automated flow already exists and works; discarding it would leave a PDF review as the only trust signal |
| 2 | Hard limit of 1 active session | **Cancelled** — multi-session stays platform-wide | `RefreshToken` is a deliberate multi-session design with rotation-based theft detection. Better for HR teams on several devices, and stronger than a session cap |
| 3 | One-time secure **link** carrying a temporary password | **6-digit activation code** (§4.3) | No password is ever transmitted, and it reuses the platform's existing 6-digit code machinery |
| 4 | `force_password_reset = true` | **Removed** | Follows from #3 — the employer sets their own password at activation, so there is no temporary one to force a change from |
| 5 | Role enum `SEEKER` | **`JOB_SEEKER`** | Matches the existing Prisma enum |
| 6 | Lockout 15 minutes | **30 minutes**, plus an IP tier | Matches the existing Redis implementation (§5.3) |
| 7 | Telegram as a delivery channel | **Conversation only, no integration built** | No Telegram service exists; system mail goes through `EmailService`, alerts through Slack |

---

## 2. Core Architecture & Data Model

1. **Unified user table.** All credentials live in `users`, with a `UNIQUE` constraint on
   `email` and a `role` enum (`JOB_SEEKER`, `EMPLOYER`, `ADMIN`). Email conflict checking is
   therefore an atomic database operation, not an app-level check-then-write race.
2. **Profile separation.** Role-specific data lives in 1-to-1 tables (`profiles`,
   `employer_profiles`) linked by `userId`.
3. **Two separate state machines**, and they must not be conflated:
   * `employer_requests` — the onboarding ticket:
     `SUBMITTED → REVIEWING → PENDING_INFO / APPROVED / REJECTED`
   * `users.status` — the account: `ACTIVE → SUSPENDED → DEACTIVATED`

   **No account exists until a request is `APPROVED`.** The ticket outlives rejection; an
   account row must never be created for one.

---

## 3. Employer Account Rules

- **One company, one account.** Enforced by `EmployerProfile` — one profile per user, one
  claim per company.
- **Email exclusivity.** Enforced by the database. One address cannot be both a seeker and
  an employer.
- **No self-registration.** Already true today: the public signup DTO has no role field, so
  it can only ever produce a `JOB_SEEKER`.
- **Credentials are non-transferable**, bound to the verified company.
- **Channel security.** Email and Telegram may be used for *conversation*. Activation codes
  and any account link are sent **only** to the verified official company email address.

---

## 4. Employer Registration Flow

### 4.1 Employer Contact (Registration Request)

The employer submits a request — through the public intake form, or by contacting the admin
by email or Telegram, in which case the admin directs them to the form so the details are
captured in one place.

**Required information:**
- Company / organisation name
- Official company email address (this becomes the login address)
- Company website or social media page
- Contact person's name and role
- Brief description of intended job postings
- Supporting documents (business registration, etc.)

### 4.2 Admin Review & SLA

The admin reviews in the Admin Panel. Requests sitting in `SUBMITTED` or `REVIEWING` for
more than **48 hours** are highlighted so they cannot be quietly forgotten. The SLA is
computed from `createdAt` — nothing is stored or has to be kept in sync.

| Scenario | Behaviour |
|----------|-----------|
| **No conflict** | Admin approves. The system creates the account (§4.3). |
| **Email conflict** | Creation is refused by the unique constraint, surfaced as a typed conflict. The admin UI offers **Request different email** (→ `PENDING_INFO`) or **Reject**. |
| **Public domain** (e.g. `@gmail.com`) | Allowed, with a warning badge: *"Public domain detected — verify business documents thoroughly."* Computed at read time, never stored. |
| **Missing information** | **Request Info** → `PENDING_INFO`. |
| **Rejected** | A reason is required, and is shown to the employer. |

The conflict check happens **inside the same transaction as the account creation**, not
before it. A check-then-create pair is a race; the unique index is the only thing that can
answer atomically.

### 4.3 Approval, Account Creation and Activation

On approval the system, in one transaction:

1. Creates the `users` row — `role = EMPLOYER`, `status = ACTIVE`,
   **`emailVerified = false`**, empty password hash.
2. Generates a **6-digit activation code** with an expiry.
3. Marks the request `APPROVED` and records the reviewing admin and the approved company.

It then emails the code to the verified company address, including the clause:
*"By activating this account you agree to the JobFit Employer Terms of Service [link]."*

**Activation.** The employer enters their email, the code, and **a password of their own
choosing**. On success the system sets the password, sets `emailVerified = true`, clears the
code, and signs them in.

> ⚠️ **`emailVerified` stays false until the code is used.** Login refuses unverified
> accounts, and that refusal is the only thing standing between an approved-but-unactivated
> row — which has an empty password hash — and a login. Activation flips it; approval never
> does.

**Expired or lost code.** The admin opens the request and clicks **Resend**, which issues a
fresh code and invalidates the previous one.

---

## 5. Employer Login Flow

### 5.1 Routing & Portal Separation

- **Seeker portal:** `/login`
- **Employer portal:** `/employer/login`
- **Admin portal:** already separate, and the pattern the employer portal follows.

Each page cross-links to the other: *"Are you an employer? Log in here."*

### 5.2 Login Process & Role Enforcement

1. Employer submits email + password at `/employer/login`.
2. Credentials are validated against `users`.
3. **Role check:** a non-`EMPLOYER` account is refused with **403**, and the UI says
   *"This is a Job Seeker account. Please use the standard login portal,"* with a link —
   not a generic failure.
4. **Status check:** anything other than `ACTIVE` is refused, and suspended is distinguished
   from closed.

Role enforcement is **server-side**. The client-side layout guard stays, but it is no longer
the only check.

### 5.3 Security & Session Rules

| Rule | Implementation |
|------|----------------|
| **Sessions** | **Multi-session, no cap.** `RefreshToken` is one row per session with rotation; a replayed rotated token is detected as theft. This is deliberate and platform-wide. |
| **Account lockout** | 5 failures in a 15-minute window → **30-minute** lockout. Redis-backed, automatic time-based unlock. An admin can unlock early. |
| **IP lockout** | 20 failures in a 15-minute window → 30-minute lockout. A second tier v2.0 did not describe. |
| **Audit logging** | Login attempts, password changes and status changes are recorded with actor, action, IP and timestamp. |

---

## 6. Company Profile Setup — how approval and verification compose

Admin approval is the **trust anchor**; the automated domain check is a second, narrower
signal. Both are kept, and they must never be able to contradict each other.

At first login the employer claims their company and the domain check runs, but:

- The claimed company is checked against the company the admin approved. A mismatch is a
  **403** — they were approved for a different company.
- On a match, the company is marked verified **on the strength of the approval**, recording
  which signal did it (`ADMIN_REVIEW` vs `EMAIL_DOMAIN`) so an audit never has to guess.
- The domain check still runs as a **soft signal**. A mismatch is recorded and flagged to
  the admin. **It does not block the employer.**

> ⚠️ Why the check cannot be authoritative here: it answers **400 "Domain mismatch or no
> website"** when the company row has no website — which is true of many seeded and ingested
> companies — and when a recruiter's address sits on a subsidiary or regional domain. Either
> would block an employer a human has already verified against a business registration.

Self-service claim by an employer with **no** approved request keeps the current strict
behaviour: the domain check is authoritative and a mismatch is a 400.

---

## 7. Employer Dashboard & Core Features

### 7.1 Post a job
Title, description, required skills, experience level, employment type, location, salary
range, application deadline, number of openings. Jobs are drafted and then explicitly
published, so a half-written posting never reaches candidates.

### 7.2 Manage postings
View, edit, close, repost. **Reposting an expired job clears its previous matches and
triggers a fresh matching run**, so candidates are scored against the updated description.

### 7.3 Matched candidates
The system surfaces candidates ranked by match score; employers do not search the candidate
database. An employer can open a candidate's match detail and download **the CV that
candidate applied with** via a signed, time-limited URL scoped to their own company.

> Access is a **checked relationship** — an application linking the employer's job to the
> candidate. `role === 'EMPLOYER'` alone must never grant candidate access, or the whole
> candidate table is open to anyone who registers as an employer.

### 7.4 Account settings
Company name, logo, website, description; password change.

> **Email changes are not self-service.** Changing the login address requires a new request
> ticket and admin approval, to prevent account hijacking.

---

## 8. Account Lifecycle

| Stage | Description | Who can change it |
|-------|-------------|-------------------|
| **Active** | Live; can log in and post. | Admin, on approval |
| **Suspended** | Temporarily disabled — policy violation, suspicious activity. Reversible. | Admin only |
| **Deactivated** | Permanently closed. | Admin only |

Employers cannot self-suspend or self-deactivate. Every transition is audit-logged.

---

## 9. Admin Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Review requests** | Decide within the 48-hour SLA |
| **Resolve conflicts** | Handle email collisions via the conflict dialog |
| **Approve & issue** | Trigger account creation and the activation email |
| **Resend codes** | Reissue for employers whose code expired |
| **Manage lifecycle** | Suspend / deactivate on evidence |
| **Monitor security** | Review audit logs for suspicious patterns |

---

## 10. Key Differentiators: Employer vs Seeker

| Feature | Job Seeker | Employer |
|---------|-----------|----------|
| **Registration** | Self-service | Admin-gated via a request ticket |
| **Login portal** | `/login` | `/employer/login` |
| **Account creation** | Instant on signup | After admin approval |
| **First credential** | Self-set via email verification | Self-set at activation, using a 6-digit code sent to the verified company email |
| **Sessions** | Multi-device | Multi-device (same policy) |
| **Email changes** | Self-managed | Requires a new request and admin approval |

---

*End of Document v2.1*
