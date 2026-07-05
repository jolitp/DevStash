import { defineConfig } from "vitest/config";

// We only unit-test server actions and utilities — never React components — so a
// plain Node environment is enough (no jsdom / DOM globals).
export default defineConfig({
  // Resolve the `@/*` alias from tsconfig.json (Vite 7 / Vitest 4 native support).
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // `globals` stays off — test files import { describe, it, expect } from
    // "vitest" explicitly, so we don't have to widen tsconfig's `types` (which
    // would disable the auto-included @types/node / React types app-wide).
    include: ["src/**/*.test.ts"],
  },
});
