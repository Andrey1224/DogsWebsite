import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: isCI ? 'npm run start -- --hostname 0.0.0.0 --port 3000' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Disable Crisp chat in E2E tests to prevent DOM interference
      NEXT_PUBLIC_CRISP_WEBSITE_ID: '',
      // Preserve existing test environment variables
      NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN:
        process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN || 'dev-bypass-token',
      HCAPTCHA_BYPASS_TOKEN: process.env.HCAPTCHA_BYPASS_TOKEN || 'dev-bypass-token',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
