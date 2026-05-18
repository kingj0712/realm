import { defineConfig, devices } from '@playwright/test';

// Realm runs inside an open Shadow DOM under a <realm-panel> custom element.
// Playwright's default CSS engine pierces open shadow roots, so locators like
// page.locator('text=Welcome') still match content inside the panel.
//
// Tests target the local Vite dev server (npm run dev) which renders the
// panel standalone with the mock data store. We intentionally do not hit
// Home Assistant here; that surface is too unstable to depend on in CI.
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Tests get their own Vite dev server on a dedicated port (4173) so a
  // long-running interactive dev session on 5173 never collides with CI.
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
