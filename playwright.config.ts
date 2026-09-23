import { defineConfig, devices } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// Credentials live in .env.test.local, which .gitignore covers via `.env*.local`.
// Parsed by hand rather than with dotenv so this config adds no dependency.
// `__dirname`, not `import.meta` — Playwright loads this config as CommonJS.
const envFile = path.join(__dirname, ".env.test.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

export default defineConfig({
  testDir: "./e2e",
  // Perf numbers are meaningless if runs overlap and compete for CPU and for the
  // same remote database. One at a time, always.
  workers: 1,
  fullyParallel: false,
  // No retries: a retry would hide a slow first load, which is the thing being measured.
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 120_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
