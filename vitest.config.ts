import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'server-only': resolve(__dirname, 'test-utils/server-only.ts'),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
    },
  },
});
