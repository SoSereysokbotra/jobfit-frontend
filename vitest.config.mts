import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // fake-indexeddb/auto installs a real IndexedDB implementation on the
    // global, so Dexie is exercised for real rather than mocked. The merge
    // logic is the part worth testing, and mocking Dexie would test the mock.
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(rootDir, "./src") },
  },
});
