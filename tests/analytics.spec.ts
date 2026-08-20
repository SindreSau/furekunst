// FK-019 — typed analytics: gallery card clicks fire track('artwork_click', {slug}).
// STUB: written by Dev C ahead of the implementation; the Wave-2 tester
// completes and runs these. They fail until the analytics wiring lands.
//
// Coverage map:
//  - clicking a card fires track('artwork_click', { slug }) with the card's slug
//  - clicks are harmless when window.umami is absent/blocked (no throw)
//
// Run: pnpm test

import { test, expect } from './fixtures'

test.beforeEach(async ({ page }) => {
  // Hermetic suite: umami is external and irrelevant here (the real tracker
  // must never overwrite the mock window.umami between install and click).
  await page.route('https://umami.sindresau.me/**', route => route.abort())
})

test('card clicks fire the artwork_click event with the card slug', async ({
  page,
}) => {
  await page.goto('/galleri')

  const realSlug = await page
    .locator('[data-artwork-click]')
    .first()
    .getAttribute('data-slug')
  if (!realSlug) throw new Error('no gallery card with data-slug found')

  // Install a mock Umami tracker, then click a synthetic card so the click
  // handler records the event without triggering a real navigation (a full
  // page load would wipe the window state before we can read it back).
  await page.evaluate(slug => {
    const events: Array<{ event: string; data?: Record<string, unknown> }> = []
    ;(
      window as unknown as {
        umami?: {
          track?: (event: string, data?: Record<string, unknown>) => void
        }
      }
    ).umami = {
      track: (event, data) => events.push({ event, data }),
    }
    ;(
      window as unknown as { __furekunstUmamiEvents?: typeof events }
    ).__furekunstUmamiEvents = events

    const card = document.createElement('a')
    card.setAttribute('data-artwork-click', '')
    card.setAttribute('data-slug', slug)
    card.href = '#'
    document.body.appendChild(card)
    card.click()
  }, realSlug)

  const events = await page.evaluate(
    () =>
      (
        window as unknown as {
          __furekunstUmamiEvents?: Array<{
            event: string
            data?: Record<string, unknown>
          }>
        }
      ).__furekunstUmamiEvents,
  )
  expect(events).toEqual([{ event: 'artwork_click', data: { slug: realSlug } }])
})

test('clicks are harmless when Umami is absent', async ({ page }) => {
  await page.goto('/galleri')
  await page.evaluate(() => {
    ;(window as unknown as { umami?: unknown }).umami = undefined
  })
  await page.locator('[data-artwork-click]').first().click()
  await expect(page).toHaveURL(/\/galleri\//)
})
