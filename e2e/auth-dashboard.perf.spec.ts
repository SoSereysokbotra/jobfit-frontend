/**
 * Login → seeker dashboard, measured.
 *
 * WHAT THIS MEASURES AND WHAT IT DOES NOT. This is a real Chromium driving the real
 * dev server against the real (remote) Supabase database. So the numbers include
 * network latency to Tokyo, and they include Next.js dev-mode compilation, which is
 * far slower than a production build. Dev-mode figures are useful for comparing pages
 * against each other and for seeing which API calls dominate — they are NOT what a
 * user of the deployed site experiences.
 *
 * Every string asserted below was read out of the source, not guessed:
 *   - "Welcome back"  — en.ts "auth.welcomeBack", rendered by (auth)/login/page.tsx
 *   - the email / password inputs are selected BY TYPE, not by label. text-field.tsx
 *     renders <label htmlFor={id}> and <input id={id}>, but (auth)/login/page.tsx never
 *     passes an `id`, so htmlFor is undefined and the label is not associated with the
 *     control. getByLabel("Email address") therefore matches nothing. That is a real
 *     accessibility defect in the app — recorded, not worked around silently.
 *   - "Sign In"       — en.ts "auth.signIn"
 *   - "Welcome back, {firstName}!" — dashboard/page.tsx line 149
 *   - "Loading your workspace…"    — (seeker)/layout.tsx, the auth-check overlay
 */

import { test, expect, type Page, type Response } from "@playwright/test";

const NEWLINE = String.fromCharCode(10);

const EMAIL = process.env.E2E_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD!;

if (!EMAIL || !PASSWORD) {
  throw new Error("Set E2E_EMAIL and E2E_PASSWORD in .env.test.local");
}

/** One backend call, with how long it took. */
interface ApiCall {
  method: string;
  path: string;
  status: number;
  ms: number;
  bytes: number;
}

/**
 * Record every call to the backend API.
 *
 * Timed from request to response-body-available rather than from the Resource Timing
 * API, because these are XHRs the app makes on its own schedule and we want the number
 * the app actually waited.
 */
function recordApiCalls(page: Page, sink: ApiCall[]): void {
  const started = new Map<string, number>();

  page.on("request", (req) => {
    if (req.url().includes("/api/v1/")) started.set(req.url() + req.method(), Date.now());
  });

  page.on("response", async (res: Response) => {
    const url = res.url();
    if (!url.includes("/api/v1/")) return;
    const key = url + res.request().method();
    const t0 = started.get(key);
    if (t0 === undefined) return;
    started.delete(key);

    let bytes = 0;
    try {
      bytes = (await res.body()).length;
    } catch {
      // Body already consumed or the request was aborted — size is not the point here.
    }

    sink.push({
      method: res.request().method(),
      path: new URL(url).pathname.replace("/api/v1", ""),
      status: res.status(),
      ms: Date.now() - t0,
      bytes,
    });
  });
}

function report(title: string, calls: ApiCall[], totals: Record<string, number>): void {
  const lines: string[] = ["", `━━━ ${title} ━━━`];
  for (const [label, ms] of Object.entries(totals)) {
    lines.push(`  ${label.padEnd(42)} ${String(Math.round(ms)).padStart(6)} ms`);
  }
  if (calls.length) {
    lines.push(`  ${"—".repeat(56)}`);
    lines.push(`  API calls (${calls.length}), slowest first:`);
    for (const c of [...calls].sort((a, b) => b.ms - a.ms)) {
      const size = c.bytes >= 1024 ? `${(c.bytes / 1024).toFixed(1)}KB` : `${c.bytes}B`;
      lines.push(
        `    ${String(c.ms).padStart(6)} ms  ${String(c.status)}  ` +
          `${c.method.padEnd(4)} ${c.path.padEnd(34)} ${size}`,
      );
    }
    const sum = calls.reduce((a, c) => a + c.ms, 0);
    lines.push(`    ${String(sum).padStart(6)} ms  = sum of all API time (some overlap)`);
  }
  console.log(lines.join("\n"));
}

test.describe("Authentication → seeker dashboard", () => {
  test("measures the login page, the sign-in click, and the dashboard", async ({ page }) => {
    const calls: ApiCall[] = [];
    recordApiCalls(page, calls);

    // ── 1. Load /login ──────────────────────────────────────────────────────
    const loginStart = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Welcome back", { exact: false })).toBeVisible();
    const loginVisible = Date.now() - loginStart;

    // Fully settled, including fonts and any deferred chunk.
    await page.waitForLoadState("networkidle");
    const loginSettled = Date.now() - loginStart;

    report("1. /login", calls.splice(0), {
      "HTML → 'Welcome back' visible": loginVisible,
      "HTML → network idle": loginSettled,
    });

    // ── 2. Fill the form ────────────────────────────────────────────────────
    // By input type, because the labels are not associated with the inputs (see header).
    await page.locator('input[type="email"]').fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);

    const signIn = page.getByRole("button", { name: "Sign In" });
    // The page disables submit until both fields are non-empty — prove it is enabled
    // before clicking, so a failure here is unambiguous.
    await expect(signIn).toBeEnabled();

    // ── 3. Click, and time everything until the dashboard is usable ─────────
    const clickStart = Date.now();
    await signIn.click();

    // POST /auth/login specifically — the first thing the click causes.
    const loginRes = await page.waitForResponse(
      (r) => r.url().includes("/auth/login") && r.request().method() === "POST",
      { timeout: 60_000 },
    );
    const loginApi = Date.now() - clickStart;
    expect(loginRes.status()).toBe(200);

    // The app routes by role: a JOB_SEEKER goes to /dashboard (homeForRole).
    await page.waitForURL("**/dashboard", { timeout: 60_000 });
    const urlChanged = Date.now() - clickStart;

    // The seeker layout covers everything with this overlay until BOTH the role check
    // and the profile check resolve. Content behind it is not yet real.
    await expect(page.getByText("Loading your workspace…")).toBeHidden({ timeout: 60_000 });
    const overlayGone = Date.now() - clickStart;

    // The greeting is the first genuinely personalised thing on the page.
    await expect(page.getByText(/Welcome back, .+!/)).toBeVisible({ timeout: 60_000 });
    const greetingVisible = Date.now() - clickStart;

    await expect(page.getByText("Profile Score")).toBeVisible({ timeout: 60_000 });
    const profileScoreVisible = Date.now() - clickStart;

    await page.waitForLoadState("networkidle");
    const settled = Date.now() - clickStart;

    report("2. Click 'Sign In' → dashboard usable", calls.splice(0), {
      "click → POST /auth/login answered": loginApi,
      "click → URL is /dashboard": urlChanged,
      "click → auth overlay gone": overlayGone,
      "click → greeting visible": greetingVisible,
      "click → 'Profile Score' visible": profileScoreVisible,
      "click → network idle (fully loaded)": settled,
    });

    // Confirms the account really did land on the seeker dashboard rather than being
    // bounced to /onboarding/resume by the profile gate.
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("measures a warm dashboard reload, and what keeps polling afterwards", async ({ page }) => {
    // Sign in first; this part is not measured.
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for hydration before typing. `domcontentloaded` fires before React attaches
    // its handlers, and fill() on an unhydrated input sets the DOM value without firing
    // React's onChange — so the component state stays empty and the submit button stays
    // disabled forever. That is exactly how this test failed the first time.
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="email"]').fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    const signIn = page.getByRole("button", { name: "Sign In" });
    await expect(signIn).toBeEnabled({ timeout: 15_000 });
    await signIn.click();
    await page.waitForURL("**/dashboard", { timeout: 60_000 });
    await expect(page.getByText("Loading your workspace…")).toBeHidden({ timeout: 60_000 });
    await expect(page.getByText(/Welcome back, .+!/)).toBeVisible({ timeout: 60_000 });

    // Now measure a reload: Next.js has already compiled the route, so this isolates
    // the API cost from dev-mode compilation.
    const calls: ApiCall[] = [];
    recordApiCalls(page, calls);

    const t0 = Date.now();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Loading your workspace…")).toBeHidden({ timeout: 60_000 });
    const overlayGone = Date.now() - t0;
    await expect(page.getByText(/Welcome back, .+!/)).toBeVisible({ timeout: 60_000 });
    const greeting = Date.now() - t0;
    await expect(page.getByText("Profile Score")).toBeVisible({ timeout: 60_000 });
    const profileScore = Date.now() - t0;

    // NOT waitForLoadState("networkidle") — this page never reaches it. Something keeps
    // issuing requests indefinitely, so networkidle times out at 120s. A fixed settle
    // window measures the page AND exposes the repeat traffic.
    const SETTLE_MS = 15_000;
    const beforeSettle = calls.length;
    await page.waitForTimeout(SETTLE_MS);
    const afterSettle = calls.slice(beforeSettle);

    report("3. Warm reload of /dashboard", calls.slice(0, beforeSettle), {
      "reload → auth overlay gone": overlayGone,
      "reload → greeting visible": greeting,
      "reload → 'Profile Score' visible": profileScore,
    });

    // Anything here is traffic AFTER the page was already usable — polling, refetching,
    // or a retry loop. On an idle page this list should be empty.
    const byPath = new Map<string, number>();
    for (const c of afterSettle) {
      const key = `${c.method} ${c.path}`;
      byPath.set(key, (byPath.get(key) ?? 0) + 1);
    }
    const lines = [
      "",
      `━━━ 4. Traffic in the ${SETTLE_MS / 1000}s AFTER the page was usable ━━━`,
      `  ${afterSettle.length} request(s) while the user did nothing:`,
    ];
    for (const [key, n] of [...byPath.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`    ${String(n).padStart(4)} x  ${key}`);
    }
    if (afterSettle.length === 0) lines.push("    (none — the page goes quiet)");
    console.log(lines.join(NEWLINE));
  });
});
