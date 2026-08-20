// Font preload regression tests.
//
// Every page renders through MainLayout, which preloads the two faces each
// page paints with — Didot regular and the Geist latin variable font — so
// warm navigations paint the real fonts on the first frame instead of
// discovering them via CSS @font-face and flickering (FOUT) on swap.
//
// Coverage map:
//  - preload links present on / and on a gallery detail page, crossorigin set
//  - both font families actually load (document.fonts.check — catches broken
//    paths/CORS)
//  - both font fetches are initiated by their preload links, not CSS discovery
//    (a resource-timing entry whose name matches the preload href, with
//    initiatorType 'link' — the mechanism that kills the swap flicker)
//  - every @font-face for Didot and Geist Variable uses font-display: optional
//    (never swap → the browser commits at first paint to the real font or the
//    fallback, so no navigation font flash even on cold mobile first paint)
//
// Run: pnpm exec playwright test tests/fonts.spec.ts

import { test, expect, type Page } from './fixtures'

// Artwork cards carry data-artwork-click; the filter chips are `button`s
// (client-side filtering), so a bare `a[href^="/galleri/"]` prefix selector
// matches only cards.
const GALLERY_LINK = 'a[data-artwork-click]'

async function readPreloadFontLinks(page: Page) {
  return page.locator('link[rel="preload"][as="font"]').evaluateAll(els =>
    els.map(el => ({
      href: el.getAttribute('href'),
      crossorigin: el.hasAttribute('crossorigin'),
    })),
  )
}

async function expectPreloads(page: Page) {
  const links = await readPreloadFontLinks(page)
  expect(
    links.length,
    'at least the two faces every page paints with must be preloaded',
  ).toBeGreaterThanOrEqual(2)
  for (const link of links) {
    expect(
      link.crossorigin,
      'font preloads must carry crossorigin (required for font fetches)',
    ).toBe(true)
  }
  const hrefs = links.map(link => link.href)
  expect(
    hrefs.some(href => href?.match(/Didot.*\.woff2$/)),
    'a preload must target the Didot woff2',
  ).toBe(true)
  expect(
    hrefs.some(href => href?.match(/geist-latin.*\.woff2$/)),
    'a preload must target the Geist latin woff2',
  ).toBe(true)
}

test('preload links for Didot and Geist latin are present on home and detail pages', async ({
  page,
}) => {
  await page.goto('/')
  await expectPreloads(page)

  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await expectPreloads(page)
})

test('both font families load through the preloaded URLs', async ({ page }) => {
  await page.goto('/')
  const [didotLoaded, geistLoaded] = await page.evaluate(async () => {
    await document.fonts.ready
    return [
      document.fonts.check('16px Didot'),
      document.fonts.check('16px Geist Variable'),
    ]
  })
  expect(
    didotLoaded,
    'Didot must be loaded (broken path/CORS would leave it false)',
  ).toBe(true)
  expect(
    geistLoaded,
    'Geist Variable must be loaded (broken path/CORS would leave it false)',
  ).toBe(true)
})

test('both font fetches are initiated by their preload links, not CSS discovery', async ({
  page,
}) => {
  await page.goto('/galleri')

  // Read the ACTUAL preload hrefs from the DOM first, so the assertion
  // compares against the real (hashed/build-specific) URLs. Resource-timing
  // entry names are absolute URLs, so resolve the attribute value against the
  // page (dev serves root-relative asset paths).
  const preloads = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll(links =>
      links.map(link => ({
        href: (link as HTMLLinkElement).href,
      })),
    )
  const didotHref = preloads.find(p => /Didot.*\.woff2$/.test(p.href))?.href
  const geistHref = preloads.find(p =>
    /geist-latin.*\.woff2$/.test(p.href),
  )?.href
  expect(didotHref, 'a Didot preload href must exist in the DOM').toBeTruthy()
  expect(
    geistHref,
    'a geist-latin preload href must exist in the DOM',
  ).toBeTruthy()

  // Guard: wait until each face has a resource-timing entry (the fetch is
  // async) before reading its initiatorType.
  for (const href of [didotHref, geistHref]) {
    await page.waitForFunction(
      (name: string | undefined) =>
        name != null &&
        performance
          .getEntriesByType('resource')
          .some(entry => entry.name === name),
      href,
    )
  }

  const initiatorTypes = await page.evaluate(
    (hrefs: (string | undefined)[]) =>
      hrefs.map(href => {
        if (!href) return null
        const entry = performance
          .getEntriesByType('resource')
          .find(
            (entry): entry is PerformanceResourceTiming => entry.name === href,
          )
        return entry ? entry.initiatorType : null
      }),
    [didotHref, geistHref],
  )

  expect(
    initiatorTypes[0],
    'the preload link must kick off the Didot fetch (initiatorType link, not css)',
  ).toBe('link')
  expect(
    initiatorTypes[1],
    'the preload link must kick off the geist-latin fetch (initiatorType link, not css)',
  ).toBe('link')
})

test('Didot and Geist Variable @font-face rules use font-display: optional', async ({
  page,
}) => {
  await page.goto('/')

  const result = await page.evaluate(async () => {
    type Face = { family: string; display: string; src: string }
    const faces: Face[] = []
    let readableSheets = 0
    const hrefs: string[] = []
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.href) hrefs.push(sheet.href)
      let rules: CSSRuleList | null = null
      try {
        rules = sheet.cssRules
        readableSheets++
      } catch {
        rules = null
      }
      if (!rules) continue
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSFontFaceRule) {
          faces.push({
            family: rule.style.fontFamily.replace(/['"]/g, ''),
            display: rule.style.getPropertyValue('font-display'),
            src: rule.style.getPropertyValue('src'),
          })
        }
      }
    }

    // Fallback for the (unexpected) case where cssRules is blocked or empty in
    // this browser context: fetch every stylesheet and collect ALL @font-face
    // blocks for the family, so count and font-display are asserted per block
    // instead of only on the first match per family.
    const faceBlocksByFamily = async (family: string) => {
      const familyRe = new RegExp(`font-family:\\s*['"]?${family}['"]?`)
      const blocks: string[] = []
      for (const href of hrefs) {
        const text = await fetch(href).then(r => r.text())
        for (const block of text.split('@font-face')) {
          if (familyRe.test(block)) blocks.push(block)
        }
      }
      return blocks
    }
    const didotFallback = await faceBlocksByFamily('Didot')
    const geistFallback = await faceBlocksByFamily('Geist Variable')

    return { faces, readableSheets, didotFallback, geistFallback }
  })

  const didotFaces = result.faces.filter(f => f.family === 'Didot')
  const geistFaces = result.faces.filter(f => f.family === 'Geist Variable')

  for (const face of didotFaces) {
    expect(
      face.display,
      `Didot @font-face (${face.src}) must use font-display: optional, got '${face.display}'`,
    ).toBe('optional')
  }
  for (const face of geistFaces) {
    expect(
      face.display,
      `Geist Variable @font-face (${face.src}) must use font-display: optional, got '${face.display}'`,
    ).toBe('optional')
  }

  if (didotFaces.length === 0) {
    expect(
      result.didotFallback.length,
      'no Didot @font-face readable from cssRules — the stylesheet fallback must find all 4 Didot @font-face blocks (regular, italic, bold, bold italic)',
    ).toBe(4)
    for (const block of result.didotFallback) {
      expect(
        /font-display:\s*optional/.test(block),
        `every Didot @font-face block in the stylesheet fallback must use font-display: optional:\n${block}`,
      ).toBe(true)
    }
  }
  if (geistFaces.length === 0) {
    expect(
      result.geistFallback.length,
      'no Geist Variable @font-face readable from cssRules — the stylesheet fallback must find the single Geist Variable @font-face block',
    ).toBe(1)
    for (const block of result.geistFallback) {
      expect(
        /font-display:\s*optional/.test(block),
        `the Geist Variable @font-face block in the stylesheet fallback must use font-display: optional:\n${block}`,
      ).toBe(true)
    }
  }

  expect(
    result.readableSheets,
    'at least one stylesheet must be readable so the test is meaningful',
  ).toBeGreaterThan(0)
  expect(
    didotFaces.length +
      geistFaces.length +
      Number(result.didotFallback.length > 0) +
      Number(result.geistFallback.length > 0),
    'at least one Didot and one Geist Variable @font-face must be verified',
  ).toBeGreaterThanOrEqual(2)
})
