// FK-022 — home page featured section is intentionally curated, hard-coded
// local images (hjort / sjimpanse / labrador); it does NOT read from the live
// gallery collection. Only the mobile Mas hero uses live data.
//
// Coverage map:
//  - desktop featured grid shows exactly the 3 curated artworks
//  - alts match the curated set (Bilde: Hjort / Sjimpanse / Labrador)
//  - the mobile carousel consumes the same images
//  - featured images are plain (not wrapped in /galleri links)
//
// Run: pnpm test

import { test, expect, type Locator, type Page } from './fixtures'

const isMobile = (project: string) => project === 'mobile-chromium'

const featuredAltPattern = /Hjort|Sjimpanse|Labrador/

// Navigate to a slide by clicking the button until the target dot is
// current. The autoplay (4s interval) can advance a slide between load and
// the first click under load, so the fixed "click once then expect dot N"
// pattern flakes; goTo wraps around, so re-clicking converges in at most a
// couple of iterations (autoplay stops on the first registered click).
async function clickUntilDot(
  page: Page,
  btn: Locator,
  dots: Locator,
  target: number,
) {
  await expect
    .poll(
      async () => {
        const current =
          (await dots.nth(target).getAttribute('aria-current')) === 'true'
        if (current) return true
        await btn.click()
        return (
          (await dots.nth(target).getAttribute('aria-current')) === 'true'
        )
      },
      { timeout: 10_000 },
    )
    .toBe(true)
}

// ---------------------------------------------------------------------------
// Desktop featured grid
// ---------------------------------------------------------------------------

test('home featured grid shows the 3 curated artworks', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop only')

  await page.goto('/')

  const grid = page.locator('div.hidden.md\\:grid.md\\:grid-cols-3')
  await expect(grid).toBeVisible()

  const imgs = grid.locator('img')
  await expect(imgs).toHaveCount(3)
  const alts = await imgs.evaluateAll(elems =>
    elems.map(e => e.getAttribute('alt')),
  )
  for (const alt of alts) {
    expect(alt, 'featured alt must be "Bilde: {animal}"').toMatch(
      featuredAltPattern,
    )
  }

  await expect(grid.locator('a[href^="/galleri/"]')).toHaveCount(0)
})

// ---------------------------------------------------------------------------
// Mobile carousel
// ---------------------------------------------------------------------------

test('home mobile carousel shows the 3 curated artworks', async ({
  page,
}, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), 'mobile only')

  await page.goto('/')

  const carousel = page.locator('[data-carousel]')
  await expect(carousel).toBeVisible()

  const imgs = carousel.locator('img')
  await expect(imgs).toHaveCount(3)
  for (const img of await imgs.all()) {
    expect(await img.getAttribute('alt')).toMatch(featuredAltPattern)
  }
})

test('home mobile carousel next and prev buttons navigate slides', async ({
  page,
}, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), 'mobile only')

  await page.goto('/')

  const nextBtn = page.locator('[data-carousel-next]')
  const prevBtn = page.locator('[data-carousel-prev]')
  const dots = page.locator('[data-carousel-dot]')

  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true')

  await clickUntilDot(page, nextBtn, dots, 1)
  await clickUntilDot(page, prevBtn, dots, 0)
})

test('home mobile carousel buttons work after client-side navigation', async ({
  page,
}, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), 'mobile only')

  await page.goto('/galleri')
  await page.click('a[href="/"]')
  await page.waitForURL('**/')

  const nextBtn = page.locator('[data-carousel-next]')
  const dots = page.locator('[data-carousel-dot]')

  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true')
  await clickUntilDot(page, nextBtn, dots, 1)
})
