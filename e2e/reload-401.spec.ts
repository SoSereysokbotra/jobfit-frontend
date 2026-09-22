/**
 * Follow-up on what the warm-reload measurement turned up: on a page reload the
 * dashboard fires /analytics/my-stats, /saved-jobs and /notifications/unread-count
 * BEFORE the silent token refresh has finished, and all three come back 401.
 *
 * The question this answers: are they retried after the refresh succeeds, or does the
 * user sit looking at empty tiles? The dashboard renders "—" for an undefined stat, so
 * the rendered text is the evidence either way.
 */
import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD!;

test("does the dashboard recover from the reload 401s?", async ({ page }) => {
  const log: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/v1/")) {
      log.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname.replace("/api/v1", "")}`);
    }
  });

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  const signIn = page.getByRole("button", { name: "Sign In" });
  await expect(signIn).toBeEnabled({ timeout: 15_000 });
  await signIn.click();
  await page.waitForURL("**/dashboard", { timeout: 60_000 });
  await expect(page.getByText(/Welcome back, .+!/)).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(4000);

  console.log("\n━━━ FIRST LOAD (after login) ━━━");
  console.log(log.map((l) => "  " + l).join(String.fromCharCode(10)));

  log.length = 0;
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Welcome back, .+!/)).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(20_000);

  console.log("\n━━━ AFTER RELOAD (20s window) ━━━");
  console.log(log.map((l) => "  " + l).join(String.fromCharCode(10)));

  const four01 = log.filter((l) => l.startsWith("401"));
  console.log(`\n  401 responses after reload: ${four01.length}`);
  for (const l of four01) console.log("    " + l);

  // Did the ones that 401'd ever come back 200?
  for (const path of ["/analytics/my-stats", "/saved-jobs", "/notifications/unread-count"]) {
    const got200 = log.some((l) => l.startsWith("200") && l.endsWith(path));
    const got401 = log.some((l) => l.startsWith("401") && l.endsWith(path));
    console.log(`  ${path.padEnd(32)} 401:${got401 ? "yes" : "no "}  later 200:${got200 ? "yes" : "NO — never retried"}`);
  }
});
