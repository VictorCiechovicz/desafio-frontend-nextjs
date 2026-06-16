import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vitest 4 + plugin-react cobre JSX/TSX e React 19 sem ajuste extra.
// resolve.tsconfigPaths reaproveita os paths do tsconfig (alias @/*) — manter
// a resolução em um lugar só evita drift.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // E2E (Playwright) tem runner próprio; isolar evita rodar specs do
    // tests/e2e via vitest.
    exclude: ["node_modules", ".next", "tests/e2e/**", "server/**"],
    css: false,
  },
});
