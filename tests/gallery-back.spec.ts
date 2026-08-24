// The detail-page "← Galleri" button must behave like browser back: coming
// from the gallery it returns to the SAME scroll position the user left, not
// re-enter the gallery at the top. When the page was opened directly (deep
// link, no gallery in this session's history) it falls back to a plain link
// to /galleri.
//
// Run: pnpm test

import { test, expect } from './fixtures'

const GALLERY_LINK = 'a[data-artwork-click]'
const BACK_BUTTON = '[data-astro-back]'

test('the Galleri button returns to the gallery at the previous scroll position', async ({
  page,
}) => {
  await page.goto('/galleri')
  await page.waitForSelector(GALLERY_LINK)

  // Find a card below the fold that fits entirely in the viewport (a card
  // taller than the viewport makes the click auto-scroll to reveal it, moving
  // the scroll AFTER we record the expected position). Center it, then make
  // layout fully stable: lazy images loading above the fold shift the masonry
  // and scroll anchoring nudges scrollY, so wait until every image is decoded
  // before recording the position Astro will save.
  const index = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[data-artwork-click]')
    for (let i = 4; i < cards.length; i++) {
      cards[i].scrollIntoView({ block: 'center' })
      const rect = cards[i].getBoundingClientRect()
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) return i
    }
    return -1
  })
  expect(index).toBeGreaterThanOrEqual(4)
  const target = page.locator(GALLERY_LINK).nth(index)

  await page.waitForTimeout(400)
  const expectedScroll = await page.evaluate(() => window.scrollY)
  expect(expectedScroll).toBeGreaterThan(50)

  await target.click({ force: true })
  await page.waitForURL('**/galleri/**')
  await page.waitForSelector('[data-zoom-page-frame]')

  await page.locator(BACK_BUTTON).click()
  await page.waitForURL('**/galleri')

  // The back navigation must restore the exact scroll (Astro saves it in
  // history.state), not land at the top of the gallery.
  await expect
    .poll(
      () =>
        page.evaluate(
          expected => Math.abs(window.scrollY - expected),
          expectedScroll,
        ),
      {
        timeout: 5_000,
        message: 'the Galleri button must restore the gallery scroll position',
      },
    )
    .toBeLessThanOrEqual(3)
})

test('the Galleri button falls back to a /galleri link on a deep link (no gallery history)', async ({
  page,
}) => {
  // Fresh context: never visited the gallery this session, so there is
  // nothing meaningful to history.back() to.
  await page.goto('/galleri/ein-labrador')
  await page.waitForSelector(BACK_BUTTON)

  await page.locator(BACK_BUTTON).click()
  await expect(page).toHaveURL(/\/galleri$/)
})

test('the Galleri button works on iOS Chrome (CriOS) user agent', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
  })
  const page = await context.newPage()

  await page.goto('/galleri')
  await page.waitForSelector(GALLERY_LINK)

  const firstCard = page.locator(GALLERY_LINK).first()
  await firstCard.click({ force: true })
  await page.waitForURL('**/galleri/**')
  await page.waitForSelector(BACK_BUTTON)

  await page.locator(BACK_BUTTON).click()
  await page.waitForURL('**/galleri')
  await expect(page).toHaveURL(/\/galleri$/)

  await context.close()
})

