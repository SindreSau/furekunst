import { test, expect } from './fixtures'

// Sections hidden by responsive media queries (the mobile carousel is
// `md:hidden`, the desktop featured grid is `hidden md:grid`) must never stay
// stuck invisible when the viewport crosses the breakpoint after load — e.g.
// rotating a phone or resizing a window. A display:none element has no box
// and gets no IntersectionObserver callback from a media-query relayout, so
// reveal.ts patches it with a resize pass: elements that gained a box inside
// the viewport reveal immediately, elements that stay off-screen keep their
// scroll/IO reveal.

test('desktop-only featured grid reveals after widening the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  // Wait for the initial reveal pass so below-fold/hidden elements are under
  // observation before we resize.
  await expect
    .poll(() => page.locator('[data-reveal][data-revealed]').count(), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0)

  // At mobile width the desktop grid is display:none and must stay hidden.
  const gridCard = page.locator('.hidden.md\\:grid [data-reveal]').first()
  await expect(gridCard).toBeHidden()
  await expect(gridCard).not.toHaveAttribute('data-revealed')

  // Widening shows the grid below the fold — the card must not be stuck
  // invisible once the user scrolls to it.
  await page.setViewportSize({ width: 1280, height: 800 })
  await gridCard.scrollIntoViewIfNeeded()
  await expect
    .poll(() => gridCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 5_000,
      message: 'grid card must reveal after the breakpoint crossing',
    })
    .toBe('1')
})

test('mobile carousel reveals as soon as it enters the viewport on resize', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-chromium',
    'the carousel is visible at mobile load; this covers the desktop→mobile crossing',
  )
  // Load at desktop width: the carousel wrapper is display:none and never
  // revealed. A tall viewport keeps the carousel inside the viewport after
  // the resize so only the resize pass (not scroll) can reveal it.
  await page.goto('/')

  const carousel = page.locator('.md\\:hidden[data-reveal]').first()
  await expect(carousel).toBeHidden()
  await expect(carousel).not.toHaveAttribute('data-revealed')

  await page.setViewportSize({ width: 390, height: 2000 })
  await expect
    .poll(() => carousel.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 5_000,
      message: 'carousel must reveal once the resize shows it in the viewport',
    })
    .toBe('1')
})
