import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 4 : 4,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'ios-safari',
      testMatch: /view-transitions\.spec\.ts/,
      use: { ...devices['iPhone 17 Pro Max'] },
    },
  ],
  webServer: {
    command: 'node ./node_modules/astro/bin/astro.mjs dev --host --port 4321',
    env: {
      PATH: process.env.PATH ?? '',
      ASTRO_TELEMETRY_DISABLED: '1',
      ASTRO_DEV_BACKGROUND: 'false',
    },
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
