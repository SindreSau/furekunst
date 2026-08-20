import { test as base, expect, type Page } from '@playwright/test'

// 1x1 transparent PNG buffer to satisfy <img> decodes without fetching remote images
export const MOCK_PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAentry',
  'base64',
)

/**
 * Route handler to intercept and mock all Contentful image and asset requests
 * so running tests does not touch Contentful bandwidth or asset transformation quota.
 */
export async function mockExternalAssets(page: Page) {
  await page.route(
    /(images\.ctfassets\.net|downloads\.ctfassets\.net|assets\.ctfassets\.net|\/_image\?.*ctfassets)/,
    route =>
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: MOCK_PNG_1X1,
      }),
  )
  await page.route('https://umami.sindresau.me/**', route => route.abort())
}

export const test = base.extend<{ mockAssets: void }>({
  mockAssets: [
    async ({ page }, use) => {
      await mockExternalAssets(page)
      await use()
    },
    { auto: true },
  ],
})

export { expect }
