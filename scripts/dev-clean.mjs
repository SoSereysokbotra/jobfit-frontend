#!/usr/bin/env node
/**
 * Clean dev start.
 *
 * `Ctrl+C` on `next dev` kills the wrapper but can leave the underlying server
 * process alive. It keeps holding the port and serving the bundle it compiled
 * before your last edit, so the browser hydrates against stale JavaScript and
 * React reports a hydration mismatch — new nav items, routes, or props simply
 * never appear. Freeing the port and wiping `.next` removes both halves of that.
 *
 * Usage: npm run dev:clean   (PORT=4001 npm run dev:clean to target another port)
 */

import { execFileSync, spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT ?? 3000);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** PIDs listening on `port`, or [] when nothing holds it. */
function pidsOnPort(port) {
  try {
    if (process.platform === "win32") {
      const out = execFileSync(
        "powershell",
        [
          "-NoProfile",
          "-Command",
          `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue |` +
            ` Select-Object -ExpandProperty OwningProcess`,
        ],
        { encoding: "utf8" },
      );
      return [...new Set(out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map(Number))];
    }
    const out = execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" });
    return [...new Set(out.split("\n").map((s) => s.trim()).filter(Boolean).map(Number))];
  } catch {
    // Nothing listening, or the query tool is unavailable — either way, nothing to kill.
    return [];
  }
}

const stale = pidsOnPort(PORT).filter((pid) => pid !== process.pid);
for (const pid of stale) {
  try {
    process.kill(pid, "SIGKILL");
    console.log(`  freed port ${PORT} — killed stale process ${pid}`);
  } catch (err) {
    console.warn(`  could not kill ${pid}: ${err.message}`);
  }
}
if (stale.length === 0) console.log(`  port ${PORT} already free`);

const buildDir = join(ROOT, ".next");
if (existsSync(buildDir)) {
  rmSync(buildDir, { recursive: true, force: true });
  console.log("  removed .next");
}

console.log(`\n→ starting next dev on :${PORT}\n`);
// Run Next's JS entrypoint under the current node binary. Spawning the `.cmd`
// shim instead fails with EINVAL on Node 20.12+/22+ on Windows.
const child = spawn(process.execPath, [join(ROOT, "node_modules/next/dist/bin/next"), "dev"], {
  stdio: "inherit",
  cwd: ROOT,
});
child.on("exit", (code) => process.exit(code ?? 0));
