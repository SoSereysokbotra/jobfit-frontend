# Software Requirements Specification — MISSING

> ⚠️ **This file is empty (0 bytes as of 2026-08-18) and has been for the life of the
> project.** Note added by an external review:
> `jobfit-backend/docs/MENTOR_REVIEW_2026-08-18.md`, finding #18.

`jobfit-backend/docs/Missing and Not Start feature/01-scorecard.md` grades **"All 33
Functional Requirements"** — ids like `AUTH-001`, `RESUME-004`, `RECS-003`, `NOTIF-002` —
explicitly *"against the SRS acceptance criteria"*. **Those criteria do not exist in any of
the four repos.** Every FR id in that scorecard is a dangling reference.

## Why this is worth fixing

1. **A requirement id that resolves to nothing cannot be audited.** "The SRS says so" is not
   an answer you can give twice.
2. **It is how whole requirements go missing silently.** The scorecard has no requirement for
   the employer's side of the product, and consequently nothing flags that **an employer
   cannot see a candidate's résumé anywhere in the API** (review finding #9) — the single
   most important thing an employer does.
3. It is the first document an interviewer or examiner asks for.

## The cheap path

The scorecard already contains all 33 ids with a one-line statement and a status for each.
Turning that into a real SRS is a couple of hours of work, and the act of writing acceptance
criteria for each one is what surfaces the employer-side gaps.

Recommended structure: for each FR — id, actor, statement, acceptance criteria (testable),
and the endpoint(s) that satisfy it. Then re-run the scorecard against it.
