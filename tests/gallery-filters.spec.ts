// Gallery filter chips — client-side filtering (single /galleri page).
//
// Coverage map:
//  - chips toggle cards without navigation (URL unchanged, aria-pressed state)
//  - "Original" shows only original cards, "Print" only print cards
//  - "Alle" restores every card
//  - the active chip keeps its highlight on hover
//  - old filter/pagination URLs are gone (404)
//
// Run: pnpm test

import { test, expect } from '@playwright/test'

const FILTER_GROUP = '[aria-label="Filtrer galleriet"]'
const CHIP = (filter: string) => `${FILTER_GROUP} button[data-filter="${filter}"]`
// The type badge is the <p> with the shrink-0 utility; a plain
// `[data-artwork-click] p` would also match the price-hint paragraph.
const TYPE_BADGE = '[data-artwork-click] p.shrink-0'
// The price hint paragraph is the only card <p> with mt-0.5 (the type badge
// also carries text-sm, so `p.text-sm` would match both).
const PRICE_HINT = '[data-artwork-click] p.mt-0\\.5'

test('chips filter the cards in place — no navigation', async ({ page }) => {
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const allCards = await page.locator('[data-filter-card]').count()
  expect(allCards).toBeGreaterThan(1)

  // Click "Original": no navigation, only original cards stay visible.
  await page.locator(CHIP('original')).click()
  expect(page.url()).toContain('/galleri')
  expect(await page.locator(CHIP('original')).getAttribute('aria-pressed')).toBe(
    'true',
  )
  expect(await page.locator(CHIP('all')).getAttribute('aria-pressed')).toBe(
    'false',
  )

  // The fade-out takes 200ms before cards leave the layout.
  const originalCount = await page.locator('[data-filter-card="original"]').count()
  await expect
    .poll(
      () =>
        page
          .locator('[data-filter-card]:not([hidden])')
          .evaluateAll(els => els.map(el => el.getAttribute('data-filter-card'))),
      { timeout: 3_000, message: 'originals-only after the fade-out' },
    )
    .toEqual(Array(originalCount).fill('original'))

  // Every hidden card is a print card.
  const hiddenTypes = await page
    .locator('[data-filter-card][hidden]')
    .evaluateAll(els => els.map(el => el.getAttribute('data-filter-card')))
  expect(hiddenTypes.length).toBeGreaterThan(0)
  expect(hiddenTypes.every(t => t === 'print')).toBe(true)

  // "Print" then shows only prints.
  const printCount = await page.locator('[data-filter-card="print"]').count()
  await page.locator(CHIP('print')).click()
  await expect
    .poll(
      () =>
        page
          .locator('[data-filter-card]:not([hidden])')
          .evaluateAll(els => els.map(el => el.getAttribute('data-filter-card'))),
      { timeout: 3_000, message: 'prints-only after the fade-out' },
    )
    .toEqual(Array(printCount).fill('print'))

  // "Alle" restores every card.
  await page.locator(CHIP('all')).click()
  await expect
    .poll(
      () => page.locator('[data-filter-card][hidden]').count(),
      { timeout: 3_000, message: 'all cards visible again' },
    )
    .toBe(0)
  expect(await page.locator('[data-filter-card]').count()).toBe(allCards)
})

test('the active chip stays highlighted on hover', async ({ page }) => {
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const chip = page.locator(CHIP('all'))
  await chip.hover()
  const bg = await chip.evaluate(el => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe('rgb(255, 255, 255)')
})

test('cards show a price hint when the post has a price', async ({ page }) => {
  await page.goto('/galleri')
  const hints = await page
    .locator(PRICE_HINT)
    .allTextContents()
    .then(texts => texts.map(t => t.trim()).filter(Boolean))
  // At least one card must carry a price hint for this to be meaningful.
  expect(hints.length).toBeGreaterThan(0)
  // A print with no positive price (e.g. julefrebuingar) renders the
  // availability marker "Ikkje tilgjengeleg" instead of a price hint, so
  // only cards that actually carry a price are asserted below.
  const priced = hints.filter(hint => hint !== 'Ikkje tilgjengeleg')
  expect(priced.length).toBeGreaterThan(0)
  for (const hint of priced) {
    expect(hint, `unexpected price hint text: ${hint}`).toMatch(
      /^(Pris: kr [1-9]\d*,-|Print tilgjengeleg frå kr [1-9]\d*,-)$/,
    )
  }
})

test('the old filter and pagination URLs are gone', async ({ page }) => {
  for (const url of [
    '/galleri/original',
    '/galleri/print',
    '/galleri/page/2',
    '/galleri/page/9999',
    '/galleri/original/page/2',
    '/galleri/print/page/2',
  ]) {
    const response = await page.goto(url)
    expect(response?.status(), `${url} should 404`).toBe(404)
  }
})
