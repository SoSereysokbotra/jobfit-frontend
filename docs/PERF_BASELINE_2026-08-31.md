# Performance baseline — login → seeker dashboard

**Date:** 2026-08-31 · **Measured locally** · frontend `44b7982`, backend `8d576ee`
**Account:** the seeker test account (verified, `JOB_SEEKER`, has a profile)

## Environment at the time of measurement

| | |
|---|---|
| Frontend | `next dev` on `:3000` — **dev mode, not a production build** |
| Backend | `nest start --watch` on `:4000` |
| Database | **remote** Supabase, `aws-0-ap-northeast-1` (Tokyo) |
| Redis | running locally — `jobfit-redis` container, healthy, "Redis connection ready" |
| AI service | running on `:8000`, Ollama on `:11434` |
| Browser | Playwright Chromium, 1 worker, no retries |

> **Dev mode inflates these numbers.** Next.js compiles routes on demand, so first-visit
> figures include compilation a real user never pays. The *API* timings are unaffected by
> that and are the reliable part.

---

## 1. The headline finding

Two endpoints, measured five times each with `curl`:

| Endpoint | What it does | Time |
|---|---|---|
| `/health/live` | no database access at all | **1–25 ms** |
| `/health/ready` | one trivial database query | **620–700 ms** |

**Your server is fast. Your database is 600 ms away.**

The NestJS app answers in about a millisecond. Every single database query adds ~0.6 s
because Supabase is in Tokyo. Nothing else in this report comes close to mattering as
much — most other numbers below are just *this number, multiplied by how many queries an
endpoint makes*.

---

## 2. API timings (direct, warm, 5 runs each)

| Endpoint | Runs (seconds) | Notes |
|---|---|---|
| `GET /auth/me` | 0.003 0.003 0.004 0.003 0.004 | **Redis cache hit** — proof the cache works |
| `GET /profiles/:id` | 0.53 0.52 0.52 0.55 0.54 | ≈ 1 query |
| `GET /analytics/my-stats` | 0.64 0.53 0.53 0.52 0.51 | ≈ 1 query |
| `GET /saved-jobs` | 0.53 0.53 0.83 0.51 0.56 | ≈ 1 query |
| **`GET /jobs`** | **2.46 2.13 1.68 2.42 2.15** | **≈ 3 queries, 46 KB, 20 jobs** |
| `POST /auth/login` | 2.11 (cold) / 1.85–2.90 in browser | 3 queries + bcrypt |

`/auth/me` at 3 ms next to `/profiles/:id` at 530 ms is the clearest possible
demonstration of what caching is worth here: **~170× faster.**

---

## 3. Browser measurements

### Cold: open `/login`, sign in, reach the dashboard

| Step | Time |
|---|---|
| `/login` HTML → "Welcome back" visible | **395 ms** |
| `/login` → network idle | 1 103 ms |
| click "Sign In" → `POST /auth/login` answered | **2 608 ms** |
| click → URL is `/dashboard` | 3 165 ms |
| click → auth overlay gone | 3 173 ms |
| click → greeting visible | 3 690 ms |
| click → "Profile Score" visible (page usable) | **3 700 ms** |

**From clicking Sign In to a usable dashboard: 3.7 seconds — and 2.6 s of that is the
single `POST /auth/login` call.**

### Warm: reload `/dashboard` with a session already established

| Step | Time |
|---|---|
| reload → auth overlay gone | 2 512 ms |
| reload → greeting visible | 2 525 ms |
| reload → "Profile Score" visible | **2 531 ms** |

---

## 4. Why login takes 2–3 seconds

From reading `login.handler.ts`, one login performs, **sequentially**:

1. `lockout.isLocked` — Redis (fast)
2. `userRepo.findByEmail` — **database round trip** ≈ 0.6 s
3. bcrypt compare — `SALT_ROUNDS = 12` in `password.value-object.ts`, ≈ 0.3 s of CPU
4. `lockout.clearAttempts` — Redis (fast)
5. `userRepo.save(user)` — **database write** (updates `lastLogin`) ≈ 0.6 s
6. `refreshTokenRepo.save(...)` — **database write** ≈ 0.6 s

0.6 + 0.3 + 0.6 + 0.6 ≈ **2.1 s**, which matches what was measured. Nothing here is a
bug — it is three sequential trips to Tokyo plus deliberate password-hashing cost.

---

## 5. Findings, worst first

### 5.1 `GET /jobs` — 2.5 s and 46 KB to display 3 jobs

The dashboard calls `useJobs()` and then does `jobs.slice(0, 3)`. It downloads all
**20 jobs with all 17 fields each** (descriptions, requirements, responsibilities,
benefits) and throws away 17 of them.

It is also **not cached**. `job.controller.ts` puts `HttpCacheInterceptor` on
`GET /jobs/:id` — with a thoughtful comment about why — but the **list** endpoint next to
it has no cache at all, and the list is what the dashboard and `/jobs` page both hit.

### 5.2 The login round trips are sequential

Steps 5 and 6 above (`lastLogin` update, refresh-token insert) do not depend on each
other. Run in parallel they would cost 0.6 s instead of 1.2 s. The `lastLogin` write
arguably does not need to block the response at all.

### 5.3 Three wasted 401s on every reload

On a warm reload the dashboard fires three authenticated requests *before* the silent
token refresh finishes:

```
401 GET /notifications/unread-count
401 GET /analytics/my-stats
401 GET /saved-jobs
200 POST /auth/refresh-token      ← the refresh completes only now
```

**They do recover** — all three are retried and return 200, so this is not a
correctness bug. But it is three wasted round trips and a delay before the tiles fill in.
Gating those queries on "auth is ready" would remove them.

### 5.4 A reload fires 22 requests

Twelve of them are `/sync/*` (the offline sync engine bootstrap: `sync/profile`,
`sync/experiences`, `sync/education`, `sync/certifications`, `sync/skills`,
`sync/saved-jobs`, `sync/recommendations`, `sync/applications`, …). Each is its own
round trip to Tokyo. Worth checking whether they all need to run on every page load, or
only on the first load of a session.

### 5.5 Accessibility bug: labels are not connected to inputs

`text-field.tsx` renders `<label htmlFor={id}>` and `<input id={id}>`, but
`(auth)/login/page.tsx` never passes an `id`. So `htmlFor` is `undefined` and the label
is not associated with its input. Playwright's accessibility snapshot:

```yaml
- generic [ref=e15]: Email address     ← plain text, not a label bound to a control
- textbox "you@example.com"            ← accessible name comes only from the placeholder
```

Consequences: screen-reader users hear only the placeholder, and clicking the label does
not focus the field. This affects every `TextField` used without an explicit `id` — the
signup and profile forms use the same component.

---

## 6. What would actually make it faster

Ordered by effect per unit of work.

| # | Change | Expected effect |
|---|---|---|
| 1 | **Move Supabase to a region near your users**, or put the backend in the same region as the database | Cuts ~0.6 s off *every* query — the single biggest lever by far |
| 2 | **Cache `GET /jobs`** the way `GET /jobs/:id` already is | 2.5 s → near-instant on repeat views |
| 3 | **Paginate `/jobs`, and select only displayed fields** | 46 KB → a few KB; fewer rows to serialise |
| 4 | Parallelise the two independent writes in login | ~2.6 s → ~2.0 s |
| 5 | Don't block login's response on the `lastLogin` write | ~2.0 s → ~1.4 s |
| 6 | Gate dashboard queries on auth-ready | removes 3 wasted round trips per reload |
| 7 | Optimistic UI on save/unsave, tracker drag | makes clicks feel instant regardless of the above |

**Not on this list: micro-optimising the NestJS code.** It answers in 1 ms. There is
nothing to win there.

---

## 7. How to re-run this

```powershell
# terminal 1
cd c:\Users\ROG\Desktop\jobfit\jobfit-backend
npm run start:dev

# terminal 2
cd c:\Users\ROG\Desktop\jobfit\jobfit-frontend
npm run dev

# terminal 3
cd c:\Users\ROG\Desktop\jobfit\jobfit-frontend
npx playwright test
```

Credentials come from `.env.test.local`, which `.gitignore` covers via `.env*.local` —
**it is not committed, and must not be.**

Files added: `playwright.config.ts`, `e2e/auth-dashboard.perf.spec.ts`,
`e2e/reload-401.spec.ts`.

`npx playwright show-report` opens the HTML report from the last run.

---

## 8. Still unmeasured

- **Production.** Everything here is local. Cloud Run **scales to zero**, so the deployed
  site adds a cold start on top of all of this — likely seconds. That has not been
  measured and is probably the biggest number of all.
- **The other 49 pages.** Only `/login` and `/dashboard` were measured.
- **Whether the database is seeded realistically.** 20 jobs is a small dataset; `/jobs`
  will get slower as it grows, since nothing paginates it.
