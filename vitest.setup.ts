import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Testing Library normally unmounts after each test by hooking the global
 * `afterEach`, which only exists when Vitest runs with `globals: true`. This
 * project imports its test helpers explicitly instead, so the hook has to be
 * registered by hand — without it every render stacks up in the same document
 * and `getBy*` starts throwing "found multiple elements".
 */
afterEach(() => {
  cleanup();
});
