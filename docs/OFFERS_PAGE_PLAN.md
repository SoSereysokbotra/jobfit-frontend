# `/offers` — closing the gap between what the page promises and what it does

> Created 2026-08-08. Frontend only. Three files, all serving `/offers` and nothing else:
> `src/app/(seeker)/offers/page.tsx`, `src/features/offer/hooks/use-offers.ts`,
> `src/features/offer/components/offer-card.tsx`.
> No backend work: every endpoint this needs already exists and was verified end-to-end.

---

## Why now

The backend's offer lifecycle was reworked and verified against a live database
(`jobfit-backend/docs/STATUS_LIFECYCLE_PLAN.md`, 33/33 checks). That work surfaced four
things wrong on this page — one of them introduced *by* that work.

| # | Problem | Severity |
|---|---|---|
| 1 | The accept modal describes behaviour that no longer happens | wrong, and my change made it wrong |
| 2 | Accept/decline failures are swallowed silently | the user cannot tell a failure from a no-op |
| 3 | Negotiation is built, verified, and unreachable | a whole feature with no button |
| 4 | "Your decision notes" is neither theirs nor saved | mislabelled and fabricated |

---

## Phase 1 — Say what actually happens

`page.tsx:213` tells the user that accepting *"archives your other active offers"*. It no
longer does: accepting now sets them to `WITHDRAWN`. The word is wrong twice over, because
"archive" has since been redefined as a per-side view flag that has nothing to do with this.

- `page.tsx` accept-modal body → "withdraws your other active offers".
- `use-offers.ts:70-71` → the same stale word in the comment above `updateStatus`.
- Grep the rest of the frontend for the same claim; a false sentence on another screen is
  still false.

---

## Phase 2 — Let a failure look like a failure

`use-offers.ts:82-84` is `catch {}` with a comment instructing it to surface nothing. Accept
or decline can fail — the offer may already be decided, the session may have expired — and
the button simply does nothing.

- Add `error` state; set it from `ApiError.message` so the backend's own wording reaches the
  user (`"This offer is already declined."` reads better than anything generic).
- Re-fetch on failure too: a refusal usually means the client is stale.
- Render through the existing `Alert` in `page.tsx` (already imported).

Mirrors what Phase 0 of the backend plan did for the employer board, for the same reason.

---

## Phase 3 — Give negotiation a button

`offerApi.negotiate()` exists at `offer.api.ts:164` and **nothing calls it**. The backend
supports the full round-trip — `OFFER → NEGOTIATING → OFFER → ACCEPTED` — and it was
exercised against the live database. The candidate has no way in.

Meanwhile the card shows a static **"Room to negotiate"** hint on every non-negotiating
offer: grey text, no data behind it, no action attached. It tells every candidate their offer
has room and then offers no way to ask.

- `offer-card.tsx`: a **Negotiate** button beside Accept/Decline; delete the hint.
- `page.tsx`: a modal with a required note (the endpoint requires `notes`).
- `use-offers.ts`: `negotiate(id, notes)` → existing API method → re-fetch.

Once this ships, the employer answers with revised terms through the Make Offer modal, which
is already wired. The loop closes with no employer-side work.

---

## Phase 4 — Stop calling the employer's note the candidate's

The "Your decision notes" section is wrong in two ways at once:

1. **It is not theirs.** It renders `offer.notes`, a single shared backend column. The
   employer writes it when extending an offer, and `negotiate` appends `[Candidate] …` to
   the same string. The candidate is reading the employer's note under a heading claiming
   it is their own.
2. **It does not save.** `updateNotes` (`use-offers.ts:89-91`) only calls `setItems`. There
   is no notes endpoint on `offerApi`. Type, refresh, gone.

Both original options were bad: *removing* it throws away real information the candidate
should see, and *persisting* it needs a schema decision (a separate `candidateNotes` column,
because writing to the shared one would overwrite the employer's).

**Chosen: relabel it honestly and make it read-only.** It becomes "Offer notes" — the thread
on this offer, which is exactly what the column holds. The candidate adds to that thread the
real way: by negotiating (Phase 3), which appends their note server-side. Nothing is
discarded, nothing pretends to save, and the label stops lying.

A private per-candidate note is a genuine feature, but it is a new column and a new endpoint,
and it should be built as one rather than smuggled in as a bug fix.

---

## Out of scope

- Any backend change. If a private candidate note is wanted later, that is a schema decision.
- `market` benchmarks — the card already hides that section when absent, which is correct;
  there is no benchmark source (`offer.api.ts:154`).
