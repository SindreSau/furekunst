import { defineConfig, devices } from '@playwright/test'

// Regression tests against the dev server (Contentful via .env). The suite
// covers the bugs we hit during the Astro migration — see tests/regression.spec.ts
// for what each test guards against.
//
// Projects:
//  - desktop-chromium / mobile-chromium: the two original projects, used by
//    every spec in the suite.
//  - ios-safari / ios-chrome / android-chrome: emulation coverage scoped to
//    tests/view-transitions.spec.ts only (testMatch below). The other specs
//    are not written for WebKit and must not run on these projects.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 4 : 8,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  timeout: 60_000,
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
    {
      name: 'ios-chrome',
      testMatch: /view-transitions\.spec\.ts/,
      use: {
        ...devices['iPhone 17 Pro Max'],
        browserName: 'chromium',
        // On REAL devices iOS Chrome is WebKit-based; this project is a
        // cross-engine proxy (Chromium engine + iPhone form factor + CriOS UA)
        // to prove the gating works on both engines under the iPhone form factor.
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1',
      },
    },
    {
      name: 'android-chrome',
      testMatch: /view-transitions\.spec\.ts/,
      use: { ...devices['Galaxy S24'] },
    },
  ],
  webServer: {
    command: 'ASTRO_TELEMETRY_DISABLED=1 npx astro dev --host --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
