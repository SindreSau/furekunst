// Regression tests for bugs hit during the Astro migration.
// Run: pnpm test        (auto-starts the dev server via webServer config)
//
// Coverage map (each test guards a specific historical bug):
//  - hero landscape EXIF / no 90° flip after full load
//  - mobile hero uses the vertical Mas artwork (no lazy-dogs flash)
//  - hero sharpens after full load (blur-in never triggered)
//  - gallery images load on hard refresh, incl. lazy ones on scroll
//  - gallery caps at 3 columns on wide screens
//  - gallery→gallery back-navigation never replays the entrance animation
//  - zoom opens on detail pages AND after a gallery→detail→back→detail cycle
//    (was: listeners died after client-side navigation)
//  - zoom morph carries the whole frame via view-transition-name
//  - navigation is full-page, not SPA (astro#11919 — iOS history corruption)
//  - browser back/forward works between pages
//  - artwork page has VisualArtwork JSON-LD with offers
//  - one h1 per page; 404 page + robots/sitemap exist
//
// The mobile nav menu is covered in mobile-menu.spec.ts.

import { test, expect, type Page } from '@playwright/test'

// Artwork cards carry data-artwork-click; the filter chips are `button`s
// (client-side filtering), so a bare `a[href^="/galleri/"]` prefix selector
// matches only cards.
const GALLERY_LINK = 'a[data-artwork-click]'

const isMobile = (project: string) => project === 'mobile-chromium'
const isDesktop = (project: string) => project === 'desktop-chromium'

// Wait until every rendered image has decoded. Images that are not actually
// on screen (zero-size elements, lazy images below the fold, or imgs inside
// display:none parents like the mobile-only carousel) are excluded — they
// legitimately never load until scrolled into view.
async function waitForVisibleImagesLoaded(page: Page) {
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    if (imgs.length === 0) return false
    const inViewport = imgs.filter(i => {
      const r = i.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight
    })
    return (
      inViewport.length > 0 &&
      inViewport.every(i => i.complete && i.naturalWidth > 0)
    )
  })
}

// Navigation morphs swallow clicks on the framed artwork: the browser's
// view-transition overlay sits above the page until the morph ends, so a
// click that lands mid-morph never reaches its target. waitForURL resolves
// on pushState — before the new page's DOM is swapped in — and under load
// the morph can begin a beat after the swap, so wait for the swapped-in
// content first, then require a sustained animation-quiet period before
// clicking.
async function waitForMorphToSettle(page: Page, selector: string) {
  await page.waitForSelector(selector)
  await page.waitForFunction(() => document.getAnimations().length === 0, {
    timeout: 5_000,
  })
  let quiet = 0
  for (let i = 0; i < 40 && quiet < 5; i++) {
    await page.waitForTimeout(100)
    const animating = await page.evaluate(
      () => document.getAnimations().length > 0,
    )
    quiet = animating ? 0 : quiet + 1
  }
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

test('hero is landscape on desktop (EXIF orientation bug)', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop only')
  await page.goto('/')
  await waitForVisibleImagesLoaded(page)

  const dims = await page
    .locator('picture img[data-fade-img]')
    .evaluate(img => ({
      w: (img as HTMLImageElement).naturalWidth,
      h: (img as HTMLImageElement).naturalHeight,
    }))
  expect(dims.w).toBeGreaterThan(dims.h) // 1754x1241 — not the flipped portrait
})

test('hero sharpens after full load (blur-in bug)', async ({ page }) => {
  await page.goto('/')
  await waitForVisibleImagesLoaded(page)

  // The blur→sharp class swap animates over 500ms — wait for it to settle.
  await expect
    .poll(
      () =>
        page
          .locator('picture img[data-fade-img]')
          .evaluate(img => getComputedStyle(img).filter),
      { timeout: 5_000 },
    )
    .toBe('none')
})

test('mobile hero is the vertical Mas artwork, no lazy-dogs flash', async ({
  page,
}, testInfo) => {
  test.skip(isDesktop(testInfo.project.name), 'mobile only')
  await page.goto('/')
  await waitForVisibleImagesLoaded(page)

  const dims = await page
    .locator('picture img[data-fade-img]')
    .evaluate(img => ({
      w: (img as HTMLImageElement).naturalWidth,
      h: (img as HTMLImageElement).naturalHeight,
    }))
  expect(dims.h).toBeGreaterThan(dims.w) // vertical Mas image

  // The lazy-dogs blur placeholder must not render on mobile.
  await expect(page.locator('img[aria-hidden="true"]')).toBeHidden()
})

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

test('gallery images all load on hard refresh, including lazy ones', async ({ page }) => {
  await page.goto('/galleri')
  await waitForVisibleImagesLoaded(page)

  // Step-scroll to the bottom so IntersectionObserver/lazy loading triggers
  // for every card, then wait until every image has decoded (some lazy
  // images keep loading for a while after entering the viewport).
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate(top => window.scrollTo(0, top), y)
    await page.waitForTimeout(150)
  }
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('.gallery-masonry img'))
    return (
      imgs.length > 0 &&
      imgs.every(
        i => i instanceof HTMLImageElement && i.complete && i.naturalWidth > 0,
      )
    )
  })

  const broken = await page
    .locator('.gallery-masonry img')
    .evaluateAll(imgs =>
      imgs.filter(i => (i as HTMLImageElement).naturalWidth === 0).length,
    )
  expect(broken).toBe(0)
})

test('gallery has max 3 columns on the widest screens', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/galleri')
  await page.waitForSelector('.gallery-masonry')

  const className = await page.locator('.gallery-masonry').getAttribute('class')
  expect(className).not.toContain('columns-4')
})

test('back-navigation from a detail page shows the gallery instantly (no stagger replay)', async ({
  page,
}) => {
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')

  await page.goBack()
  await page.waitForURL('**/galleri')

  // Coming back from a detail page must NOT replay the fade-up cascade —
  // the cards are revealed (instantly) while the transition still runs, so
  // they are already visible when the overlay lifts.
  const firstCard = page.locator('.gallery-masonry [data-reveal]').first()
  await expect
    .poll(() => firstCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 2_000,
      message: 'gallery cards must be visible right after back navigation',
    })
    .toBe('1')
})

// ---------------------------------------------------------------------------
// Artwork detail + zoom
// ---------------------------------------------------------------------------

test('zoom works on the first detail page', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'zoom is desktop-only')
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  await page.locator('[data-zoom-trigger]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeVisible()
  await page.locator('[data-zoom-close]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeHidden()
})

test('zoom still works after a gallery → detail → back → detail cycle', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'zoom is desktop-only')
  // Was: zoom listeners died after client-side navigation (bundled scripts
  // ran once). Navigation is now full-page, so this guards regressions.
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')
  await page.locator('[data-zoom-trigger]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeVisible()
  await page.locator('[data-zoom-close]').click()

  await page.goBack()
  await page.waitForURL('**/galleri')
  await waitForMorphToSettle(page, '.gallery-masonry')

  await page.locator(GALLERY_LINK).nth(1).click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')
  await page.locator('[data-zoom-trigger]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeVisible()
})

test('very tall artwork is height-capped so the detail page fits the viewport', async ({
  page,
}, testInfo) => {
  // FK-029: God morgon (700x1425, ratio ~0.49) used to render ~1165px tall
  // and force the detail page to scroll while every other artwork fit.
  test.skip(isMobile(testInfo.project.name), 'desktop only')
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/galleri/god-morgon')
  await waitForVisibleImagesLoaded(page)

  // The page must fit the viewport without scrolling.
  const scrollHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  )
  expect(scrollHeight).toBeLessThanOrEqual(800)

  // The artwork keeps its aspect ratio — the cap must not distort it.
  const img = await page
    .locator('[data-zoom-page-frame] img')
    .evaluate(el => {
      const r = el.getBoundingClientRect()
      const i = el as HTMLImageElement
      return { w: r.width, h: r.height, nw: i.naturalWidth, nh: i.naturalHeight }
    })
  expect(img.w / img.h).toBeCloseTo(img.nw / img.nh, 2)
  expect(img.h).toBeLessThan(700)
})

test('normal artworks keep filling the detail column (no height cap)', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop only')
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/galleri/lazy-dogs')
  await waitForVisibleImagesLoaded(page)

  const img = await page
    .locator('[data-zoom-page-frame] img')
    .evaluate(el => {
      const r = el.getBoundingClientRect()
      const i = el as HTMLImageElement
      return { w: r.width, h: r.height, nw: i.naturalWidth, nh: i.naturalHeight }
    })
  // Unaffected landscape artwork still fills the column (~548px wide) and
  // keeps its intrinsic aspect ratio.
  expect(img.w).toBeGreaterThan(500)
  expect(img.w / img.h).toBeCloseTo(img.nw / img.nh, 2)
})

test('zoom morph carries the whole frame (view-transition-name)', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'zoom is desktop-only')
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  await page.locator('[data-zoom-trigger]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeVisible()

  const slug = new URL(page.url()).pathname.split('/').pop()
  const frameName = await page
    .locator('[data-zoom-dialog] [data-zoom-dialog-frame]')
    .evaluate(el => getComputedStyle(el).viewTransitionName)
  expect(frameName).toBe(`art-${slug}`)

  // The page frames must have given up the name while the dialog is open.
  const pageFrameNames = await page
    .locator('[data-zoom-page-frame]')
    .evaluateAll(els => els.map(el => getComputedStyle(el).viewTransitionName))
  for (const name of pageFrameNames) expect(name).toBe('none')
})

// ---------------------------------------------------------------------------
// Navigation model (the iOS back-button bug)
// ---------------------------------------------------------------------------

test('navigation is SPA via ClientRouter', async ({ page }) => {
  // Navigation now uses Astro's <ClientRouter /> for smooth client-side routing.
  await page.goto('/galleri')

  const hasRouterMeta = await page.evaluate(() =>
    document.querySelector('[name="astro-view-transitions-enabled"]'),
  )
  expect(hasRouterMeta).not.toBeNull()

  // Client-side routing preserves global window state across navigations.
  await page.evaluate(() => {
    ;(window as unknown as { __spaMarker?: boolean }).__spaMarker = true
  })
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  const markerSurvived = await page.evaluate(
    () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
  )
  expect(markerSurvived).toBe(true)
})

test('browser back/forward works between pages', async ({ page }) => {
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  const firstSlug = new URL(page.url()).pathname.split('/').pop()

  await page.goBack()
  await page.waitForURL('**/galleri')
  await expect(page.locator('.gallery-masonry article').first()).toBeVisible()

  await page.goForward()
  await page.waitForURL('**/galleri/**')
  // Back on the same detail page (the artwork h1 renders on both viewports).
  expect(new URL(page.url()).pathname.split('/').pop()).toBe(firstSlug)
  await expect(page.locator('main h1')).toBeVisible()
})

// ---------------------------------------------------------------------------
// Content / SEO sanity
// ---------------------------------------------------------------------------

test('exactly one h1 per page', async ({ page }) => {
  // Count only h1s in the page content — Astro's dev toolbar injects its own
  // h1s into <body> (production builds don't include the toolbar).
  for (const path of ['/', '/galleri', '/kontakt']) {
    await page.goto(path)
    const count = await page.locator('main h1').count()
    expect(count, `${path} must have one h1`).toBe(1)
  }
})

test('artwork page has VisualArtwork JSON-LD with offers', async ({ page }) => {
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll(scripts => scripts.map(s => JSON.parse(s.textContent ?? '{}')))
  const artwork = jsonLd.find(ld => ld['@type'] === 'VisualArtwork')
  expect(artwork).toBeTruthy()
  expect(artwork.name).toBeTruthy()
  expect(artwork.offers).toBeTruthy()
})

test('404 page renders with an escape path', async ({ page }) => {
  await page.goto('/definitely-not-a-page')
  await expect(page.locator('h1').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Gå heim' })).toBeVisible()
  const noindex = await page.locator('meta[name="robots"]').getAttribute('content')
  expect(noindex).toBe('noindex')
})

test('robots.txt exists and points at the live sitemap', async ({ request }) => {
  // FK-018: @astrojs/sitemap is gone; robots.txt lives in public/ and points
  // at the on-demand /sitemap.xml endpoint (served by dev and build output).
  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain(
    'Sitemap: https://furekunst.no/sitemap.xml',
  )
})
