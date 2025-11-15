import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      'server-only': resolve(__dirname, 'test-utils/server-only.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 40,
        functions: 70,
        branches: 60,
        statements: 40,
        'lib/reservations/**': { lines: 60, functions: 75, branches: 55, statements: 60 },
        'lib/analytics/**': { lines: 70, functions: 70, branches: 60, statements: 70 },
        'lib/inquiries/**': { lines: 95, functions: 95, branches: 90, statements: 95 },
      },
    },
  },
});
