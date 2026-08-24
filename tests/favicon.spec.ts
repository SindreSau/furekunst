import { test, expect } from './fixtures'

test('favicon endpoints return 200 OK with correct content types', async ({
  request,
}) => {
  const icoRes = await request.get('/favicon.ico')
  expect(icoRes.ok()).toBe(true)
  expect(icoRes.status()).toBe(200)

  const svgRes = await request.get('/favicon.svg')
  expect(svgRes.ok()).toBe(true)
  expect(svgRes.status()).toBe(200)
  expect(svgRes.headers()['content-type']).toContain('image/svg+xml')

  const appleTouchRes = await request.get('/apple-touch-icon.png')
  expect(appleTouchRes.ok()).toBe(true)
  expect(appleTouchRes.status()).toBe(200)
  expect(appleTouchRes.headers()['content-type']).toContain('image/png')
})

test('pages include favicon and icon links in head', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.locator('link[rel="icon"][href="/favicon.svg"]'),
  ).toHaveCount(1)
  await expect(
    page.locator('link[rel="icon"][href="/favicon.ico"]'),
  ).toHaveCount(1)
  await expect(
    page.locator('link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]'),
  ).toHaveCount(1)
})
