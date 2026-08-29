# Public employer intake — moving the typing off the admin

> Created 2026-08-29. Frontend + one endpoint change in `jobfit-backend`.
> Depends on the employer onboarding work already shipped (Phases 0–8 of
> `EMPLOYER_ONBOARDING_PLAN.md`).
>
> **Blocked on a product decision — see "The rule this changes". No code until that is
> settled.**

---

## Why now

Employer onboarding works end to end, and was tested end to end: request → review →
approve → activation code → employer signs in. Every step is real.

Except the first one. **There is no way for an employer to reach that queue.** The flow
today is:

```
Employer emails admin@jobfit.com
        ↓
It sits in the admin's inbox. The panel knows nothing about it.
        ↓
The admin reads it and retypes six fields into "New request"
        ↓
Queue → Approve → account → activation      (all automatic)
```

The admin is the integration. That is fine for five employers and a real job at fifty —
and it is a job that produces nothing except transcription errors.

Everything downstream of the request already exists. This plan builds only the front door.

---

## The rule this changes

`employer_logic.md` §3.1:

> **No self-registration.** Employers **cannot register via the public website**. The
> process is entirely admin-controlled.

Whether a public form breaks that rule depends on what the rule means, and the two readings
give different answers:

| Reading | Public form? |
|---|---|
| **"No public page exists for employers"** | Breaks the rule |
| **"Nobody gets an employer account without an admin"** | Fine — approval is still the only path to an account |

**The distinction that matters:** *registering* gets you an account. *Requesting* gets you a
row in a queue and a wait.

With this plan, an employer who submits the form has **no account, no password, no login,
and no way to get one** until an admin clicks Approve and picks their company. The gate does
not move. The only thing that changes is **who types the six fields — the employer or the
admin.**

⚠️ **This plan assumes the second reading.** If that is wrong, stop here: the alternative is
to keep the manual step, and this document should be deleted rather than half-built.

If it is right, §3.1 should be reworded so nobody misreads it again — including me, who
already did once:

> **No self-registration.** Submitting a request never creates an account. An employer
> account exists only after an admin approves the request and selects the company. The
> public form collects the request; it grants nothing.

---

## What is already built

Most of this exists. Listing it so the work is not overestimated:

| Piece | Status |
|---|---|
| `POST /employer-requests` + `CreateEmployerRequestDto` (6 fields) | **Exists.** Currently `@Roles('ADMIN')` |
| Duplicate-open-request refusal (409 per email) | **Exists** |
| No account-enumeration in the response | **Exists** — the receipt says nothing about whether the address has an account |
| Admin queue, approve, activation | **Exists**, tested |
| `ThrottlerGuard` | **Exists** in the codebase, used elsewhere |

**Missing: the page, the links, and a rate limit.**

---

## Phase 1 — Reopen the endpoint, with a limit

Backend. `employer-request.controller.ts`.

- `@Roles('ADMIN')` → `@Public()` on `POST /employer-requests`.
- Add throttling. It is the only unauthenticated write in the employer module, so it is the
  only one a script can hammer. Use the existing `ThrottlerGuard` with a tight per-IP limit
  — a handful of submissions per hour is generous for a form a company fills in once.
- Keep the admin path working. The "New request" button in the queue posts to the same
  endpoint, and the conversational channel (§4.1) does not go away just because a form
  exists — some employers will still email.

⚠️ **The throttle must not be the only defence.** Rate limiting slows one IP; it does not
stop a script with a proxy pool. The real containment is that a request grants nothing —
the worst outcome is junk rows an admin rejects. Say so in the code comment, so nobody
later mistakes the throttle for a security boundary.

**Do not add a CAPTCHA in this phase.** It is a dependency, a privacy question and a
third-party script on a public page, for a threat whose worst case is queue noise. Revisit
if noise actually appears.

---

## Phase 2 — The page

Frontend. `src/app/employer/register/page.tsx`.

The six fields `employer_logic.md` §4.1 already specifies, and no others:

```
Company name              required
Official company email    required   ← becomes their login address
Contact person            required
Their role                required
Website or social page    optional
What jobs will you post?  required
Supporting documents URL  optional
```

- Reuse `PortalFrame` and `Field` from `features/employer-request/components/portal-frame.tsx`
  — the same shell as `/employer/login` and `/employer/activate`, so the three pages read as
  one portal.
- On success, replace the form with the receipt the API already returns: *"Thanks — we
  review new employers within two business days and will email you at the address you gave
  us."* Do not redirect; there is nowhere to send them.
- On 409, say plainly that a request for that address is already under review. That is safe
  to reveal — it concerns a request the caller themselves submitted, not whether an account
  exists.
- **Set the expectation about the email address.** It becomes the login, and the activation
  code goes there and nowhere else. An employer who types a personal address here will be
  confused later; one line under the field prevents it.

---

## Phase 3 — The links

Nobody can use a page they cannot find. Four entry points, in priority order:

1. **Footer** — `site-footer.tsx` has three link groups (Product / Company / Resources). Add
   a fourth, **FOR EMPLOYERS**: *Post a job* → `/employer/register`, *Employer sign-in* →
   `/employer/login`. This is where people look for the business side, and it appears on
   every marketing page for free.
2. **`/employer/login`** — one line: *"Not registered yet? Request employer access."*
   It already cross-links to activation; this completes the set.
3. **`/pricing`** — worth checking where its CTAs point. **Every marketing CTA currently
   goes to `/signup`, which can only create a job seeker.** If employers are meant to pay,
   the pricing page sends them to the wrong place today.
4. **Homepage hero** — optional, and I would leave it out initially. The hero is aimed at
   candidates and splitting its message costs more than the link gains.

---

## Phase 4 — Reword §3.1 and note it in the SRS

- `employer_logic.md` §3.1 → the wording under "The rule this changes", so the rule states
  what it protects (accounts) rather than what it forbids (pages).
- `docs/SRS.md` **EMPLOYER-001** currently has as an acceptance criterion:
  *"`POST /employer-requests` succeeds without authentication"* — written when the endpoint
  was public, then contradicted when it was locked down. Whichever way this decision goes,
  that criterion needs to match reality.

---

## Sequencing

```
Decision on §3.1   ← blocks everything
      ↓
Phase 1  endpoint + throttle
      ↓
Phase 2  the page        ┐ Phase 3 can start once the route exists
Phase 3  the links       ┘
      ↓
Phase 4  docs
```

Phase 2 before Phase 3: a link to a 404 is worse than no link.

---

## Risks

- **Spam.** Contained by design rather than by the throttle: a request grants nothing, and
  the duplicate-email rule stops one address flooding. Worst case is queue noise. If it
  becomes real, the next step is a CAPTCHA, not a tighter limit.
- **Employers using a personal address.** `gmail.com` already raises the public-domain badge
  for the admin, but the employer will not know why they were rejected. The field hint in
  Phase 2 is the cheap fix.
- **The manual path rotting.** Once the form exists, "New request" in the admin queue gets
  used rarely and will break unnoticed. It stays supported — §4.1 still describes the email
  and Telegram channel — so it needs to keep working, not just keep existing.

---

## Out of scope

- **IMAP inbox parsing.** Considered and rejected. Reading `admin@jobfit.com` and turning
  free-text mail into requests is guesswork: a real email rarely states the company name
  outright, names two different people, and sends from an address that is not the one they
  want to log in with. Making it reliable needs a rigid template — which has to be published
  somewhere public, at which point a form is simpler and exact.
- **CAPTCHA** (see Phase 1).
- **Any change to approval, activation or the queue.** They work; this plan does not touch
  them.
- **Employer billing.** Phase 3 notes that `/pricing` points at the seeker signup, but
  whether employers pay, and how, is not investigated here.
