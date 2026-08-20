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

import { test, expect } from './fixtures'

const isMobile = (project: string) => project === 'mobile-chromium'

const featuredAltPattern = /Hjort|Sjimpanse|Labrador/

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
