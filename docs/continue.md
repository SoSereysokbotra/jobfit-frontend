Infrastructure fixed first
Your Supabase project had zero storage buckets — that was the real cause of the upload 500 (Bucket not found), not Redis. I created the three the backend expects, all private: resumes, company-logos, job-attachments (the latter two unblock Phase 7 in advance).

That fix is confirmed working: a real PDF upload reached storage and created the Resume row. The request then hangs at queue.addJob — BullMQ retries dead Redis forever, so POST /resumes never returns even though the resume is created. That's the Redis blocker, and it'll clear on your other laptop.

What I built
Integration layer — resume.api.ts, resume.mappers.ts, use-resumes.ts (list/detail/polling/scores/mutations), use-resume-upload.ts (progress + cancel).

Components — resume-uploader (drag-drop, real progress), resume-card, ats-score-badge (SVG dial + pill), parsed-data-view.

Pages — /resumes and /resumes/[resumeId] built from return null stubs; onboarding/resume wired to the real upload.

Client — added uploadWithProgress to client.ts: fetch cannot report upload progress, so it's XHR, with the same bearer/refresh/retry semantics as the rest.

Verification — 18/18 against the live backend
Three contract details would have been wrong if I'd guessed: parsing-status returns {status} (an object, not a string); the score endpoints 400 with "Resume has not been parsed yet" until parsing succeeds (so the hooks gate on isParsed); and set-default, delete, 404-handling and the mappers all behave as expected.

The probe caught a real bug: formatFileSize rendered "5.0 MB" instead of "5 MB". Fixed and re-verified. Build clean, design rules clean.

Three judgment calls worth reviewing
The onboarding upload step was lying about its limits. It advertised "PDF, DOCX, DOC (Max 10MB)" and validated to 10 MB — but the backend accepts PDF/DOCX only, 5 MB max, and rejects legacy .doc. Users would have hit server errors on files the UI accepted. Now matched to the backend.

I removed the parser simulator. The step had a "Parser Simulation Mode" switcher (Success 95% / Low Conf 72% / Fail) driving fake progress and fake parse stages. That's dev scaffolding contradicting a real upload, so it's gone.

I added escape hatches so onboarding can't trap anyone. Since parsing depends on a worker, a stuck queue would have spun those fake stages forever. There's now a timeout path ("your resume is saved, analysis is still queued → Continue anyway") and a parse-failure path. This matters here and now: with Redis down, that timeout branch is exactly what a user would hit.

parsed-data-view is mock-backed — same gap shape as skills. ParsedResumeData exists in the database, but no endpoint returns it (ResumeResponseDto has no parsedData), so it renders a placeholder behind the real shape with TODO(backend) and a visible "preview only" notice. I applied your skills decision rather than re-asking.

What I could not verify: the upload happy path end-to-end (upload → PENDING → SUCCESS → scores render) — it needs Redis. The code is written for it; it's genuinely untested until you run it on the Redis laptop.

Phase 5 (Jobs) is next. Its UI already exists, but GET /jobs returns [] and the seed only covers skills/industries — so we'll need to decide on seeding jobs to verify it meaningfully.