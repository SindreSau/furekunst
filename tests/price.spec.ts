// FK-024 — price zero means "not available yet" for prints.
//
// Live-content invariant tests (no mocking): the site renders SSR from
// Contentful, and a zero-price print may or may not exist in the data today,
// so every assertion is invariant-based, never data-dependent.
//
// Coverage map:
//  - print detail pages never render "kr 0," in a size row
//  - every size row shows a positive price or "Ikkje tilgjengeleg"
//  - a "Print …" hint always carries a positive minimum price, never "kr 0,"
//  - no JSON-LD Offer anywhere carries "price": 0 (offers are built only from
//    sizes with price > 0, and originals fall back to "Ikke oppgitt")
//  - original detail pages never show "Ikkje tilgjengeleg" (price-on-request)
//
// Run: pnpm test

import { test, expect, type Page } from '@playwright/test'

const CARD = 'a[data-artwork-click]'
const TYPE_BADGE = 'p.shrink-0'
const PRICE_ROW = '[data-price-row]'
const HINT = 'p.text-sm.text-muted-foreground'
const JSON_LD = 'script[type="application/ld+json"]'
// /galleri is the only gallery page; every other /galleri/X path is a detail
// page.
const isDetailUrl = (pathname: string) =>
  pathname.startsWith('/galleri/') && pathname !== '/galleri'

// Collect every Offer node in a parsed JSON-LD document (the site-wide Person
// script also carries a price-less Offer).
function collectOfferPrices(data: unknown): unknown[] {
  const prices: unknown[] = []
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (record['@type'] === 'Offer') prices.push(record.price)
      for (const key of Object.keys(record)) walk(record[key])
    }
  }
  walk(data)
  return prices
}

// Return the path of the first object carrying a numeric `price: 0` in a
// parsed JSON-LD document, or null when none exists. Prices may legitimately
// be strings ("Ikke oppgitt") or positive numbers — only the number 0 fails.
function findZeroPrice(data: unknown, path = '$'): string | null {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const found = findZeroPrice(data[i], `${path}[${i}]`)
      if (found) return found
    }
    return null
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (record.price === 0) return `${path}.price`
    for (const key of Object.keys(record)) {
      const found = findZeroPrice(record[key], `${path}.${key}`)
      if (found) return found
    }
  }
  return null
}

async function assertNoZeroOffer(page: Page) {
  const scripts = page.locator(JSON_LD)
  expect(await scripts.count(), 'a JSON-LD script must exist').toBeGreaterThan(
    0,
  )
  for (let i = 0; i < (await scripts.count()); i++) {
    const raw = (await scripts.nth(i).textContent()) ?? ''
    const data = JSON.parse(raw) as unknown
    for (const price of collectOfferPrices(data)) {
      expect(price, `Offer must never carry price 0 in: ${raw}`).not.toBe(0)
    }
  }
}

// ---------------------------------------------------------------------------
// Print detail pages
// ---------------------------------------------------------------------------

test('print detail pages never render zero prices', async ({ page }) => {
  await page.goto('/galleri')
  await page.waitForSelector(CARD)

  const printCards = page.locator(CARD).filter({
    has: page.locator(`${TYPE_BADGE}:text-is("print")`),
  })
  const count = await printCards.count()
  expect(count, 'there must be at least one print card').toBeGreaterThan(0)

  // Only open the first 3 print cards to keep the test fast; if fewer exist,
  // assert on what is there.
  for (let i = 0; i < Math.min(count, 3); i++) {
    await printCards.nth(i).click()
    await page.waitForURL(url => isDetailUrl(url.pathname))
    await page.waitForSelector(PRICE_ROW)

    const rows = page.locator(PRICE_ROW)
    const rowCount = await rows.count()
    expect(rowCount, 'a print detail must render size rows').toBeGreaterThan(0)
    for (let r = 0; r < rowCount; r++) {
      const rowText = (await rows.nth(r).textContent())?.trim() ?? ''
      expect(rowText, 'a size row must never contain "kr 0,"').not.toContain(
        'kr 0,',
      )
      const cellText =
        (await rows.nth(r).locator('span').last().textContent())?.trim() ?? ''
      expect(cellText, `unexpected size-row price cell: ${cellText}`).toMatch(
        /^(kr [1-9][0-9 ]*,-|Ikkje tilgjengeleg)$/,
      )
    }

    const hint = (await page.locator(HINT).textContent())?.trim() ?? ''
    expect(hint, `unexpected print hint: ${hint}`).toMatch(
      /^(Print tilgjengeleg frå kr [1-9][0-9 ]*,-|Ikkje tilgjengeleg)$/,
    )
    expect(hint, 'the hint must never contain "kr 0,"').not.toContain('kr 0,')

    await assertNoZeroOffer(page)

    if (i < Math.min(count, 3) - 1) {
      await page.goto('/galleri')
      await page.waitForSelector(CARD)
    }
  }
})

// ---------------------------------------------------------------------------
// Original detail page (price-on-request semantics)
// ---------------------------------------------------------------------------

test('original detail hint never says Ikkje tilgjengeleg', async ({ page }) => {
  await page.goto('/galleri')
  await page.waitForSelector(CARD)

  const originalCards = page.locator(CARD).filter({
    has: page.locator(`${TYPE_BADGE}:text-is("original")`),
  })
  const count = await originalCards.count()
  expect(count, 'there must be at least one original card').toBeGreaterThan(0)

  await originalCards.first().click()
  await page.waitForURL(url => isDetailUrl(url.pathname))

  const hint = (await page.locator(HINT).textContent())?.trim() ?? ''
  expect(
    hint,
    'an original must never be labelled unavailable (price on request)',
  ).not.toBe('Ikkje tilgjengeleg')
  if (hint) {
    expect(hint, `unexpected original hint: ${hint}`).toMatch(
      /^Pris: kr [1-9][0-9 ]*,-$/,
    )
  }

  await assertNoZeroOffer(page)
})

// ---------------------------------------------------------------------------
// Unavailable print (every size priced 0) — deterministic when it exists
// ---------------------------------------------------------------------------

test('unavailable print: detail hint, all size rows and JSON-LD reflect it', async ({
  page,
}) => {
  // Data-dependent: /galleri page 1 may or may not hold a print whose hint is
  // exactly "Ikkje tilgjengeleg" (all sizes priced 0). The known live example
  // is the print `julefrebuingar`; skip when the data has none right now.
  await page.goto('/galleri')
  await page.waitForSelector(CARD)

  const unavailableCard = page
    .locator(CARD)
    .filter({ has: page.locator(`${HINT}:text-is("Ikkje tilgjengeleg")`) })
    .first()
  test.skip(
    (await unavailableCard.count()) === 0,
    'no fully-unavailable print on /galleri page 1; add a zero-price print to exercise this path',
  )

  await unavailableCard.click()
  await page.waitForURL(url => isDetailUrl(url.pathname))
  await page.waitForSelector(PRICE_ROW)

  const hint = (await page.locator(HINT).textContent())?.trim() ?? ''
  expect(hint, 'the detail hint must say the print is unavailable').toBe(
    'Ikkje tilgjengeleg',
  )

  const rows = page.locator(PRICE_ROW)
  const rowCount = await rows.count()
  expect(
    rowCount,
    'an unavailable print must still render size rows',
  ).toBeGreaterThan(0)
  for (let r = 0; r < rowCount; r++) {
    const cellText =
      (await rows.nth(r).locator('span').last().textContent())?.trim() ?? ''
    expect(cellText, `size row must be unavailable, got: ${cellText}`).toBe(
      'Ikkje tilgjengeleg',
    )
  }

  // A fully-unavailable print builds no Offer nodes, so the artwork JSON-LD
  // must neither carry an `offers` key nor any numeric `price: 0` at all.
  const artworkName =
    (await page.locator('h1.pb-1').textContent())?.trim() ?? ''
  let artworkJson: unknown = null
  const scripts = page.locator(JSON_LD)
  for (let i = 0; i < (await scripts.count()); i++) {
    const raw = (await scripts.nth(i).textContent()) ?? ''
    const data = JSON.parse(raw) as { '@type'?: string }
    if (data['@type'] === 'VisualArtwork') {
      artworkJson = data
      break
    }
  }
  expect(artworkJson, 'the artwork JSON-LD must exist').not.toBeNull()
  const artwork = artworkJson as Record<string, unknown>
  expect(String(artwork.name).trim()).toBe(artworkName)
  expect(
    artwork,
    'an unavailable print must not emit an offers block',
  ).not.toHaveProperty('offers')
  const zeroPriceAt = findZeroPrice(artworkJson)
  expect(
    zeroPriceAt,
    zeroPriceAt
      ? `found numeric price: 0 at ${zeroPriceAt}`
      : 'no numeric price: 0 anywhere in the artwork JSON-LD',
  ).toBeNull()
})
