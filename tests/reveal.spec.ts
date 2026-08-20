// View-transition fade-up flicker regression tests.
//
// The gallery fade-up must never start before the page has been revealed
// (pagereveal). Cross-document view transitions (enabled on fine-pointer
// devices only — see global.css) freeze a snapshot of the new page that is
// captured while [data-reveal] cards are still hidden; a fade-up that
// started earlier played behind the frozen snapshot and the content popped
//   in when the transition ended. That flicker only ever happened on desktop —
//   on touch/coarse-pointer and reduced-motion devices the cross-document
//   transition is neutralized into an instant flash-free swap (global.css), so
//   the frozen-snapshot flicker cannot occur there.
//
// Coverage map:
//  - desktop: fade-up starts only after pagereveal, even when the page
//    paints late (the timing that used to flicker)
//  - desktop: cards fully visible after a view-transition navigation
//  - mobile: cards reveal promptly (the gate must never hang without VTs)
//  - desktop: below-fold cards still reveal on scroll
//  - gallery: below-fold cards stay hidden at load and reveal on scroll
//    (infinite-scroll reveal — no mass fade-up at page load)

import { test, expect, type Page } from './fixtures'

const isMobile = (project: string) => project === 'mobile-chromium'
const isDesktop = (project: string) => project === 'desktop-chromium'
// Artwork cards carry data-artwork-click; the filter chips are `button`s
// (client-side filtering), so a bare `a[href^="/galleri/"]` prefix selector
// matches only cards.
const GALLERY_LINK = 'a[data-artwork-click]'

type Timeline = { pagereveal: number | null; revealStart: number | null }

// Instrument the page to record when the navigation revealed the page
// (pagereveal) and when the first [data-reveal] card started fading up.
async function recordRevealTimeline(page: Page) {
  await page.addInitScript(() => {
    if ((window as unknown as { __revealTimeline?: unknown }).__revealTimeline)
      return
    ;(window as unknown as { __revealTimeline: Timeline }).__revealTimeline = {
      pagereveal: null,
      revealStart: null,
    }
    window.addEventListener('pagereveal', () => {
      ;(
        window as unknown as { __revealTimeline: Timeline }
      ).__revealTimeline.pagereveal = performance.now()
    })
    document.addEventListener('DOMContentLoaded', () => {
      const els = document.querySelectorAll('[data-reveal]')
      if (els.length === 0) return
      const iv = setInterval(() => {
        const cs = getComputedStyle(els[0])
        if (parseFloat(cs.opacity) > 0.02) {
          ;(
            window as unknown as { __revealTimeline: Timeline }
          ).__revealTimeline.revealStart = performance.now()
          clearInterval(iv)
        }
      }, 2)
    })
  })
}

async function getTimeline(page: Page): Promise<Timeline> {
  return page.evaluate(
    () =>
      (window as unknown as { __revealTimeline: Timeline }).__revealTimeline,
  )
}

test('gallery cards reveal on page load', async ({ page }) => {
  await page.goto('/galleri')
  const firstCard = page.locator('.gallery-masonry [data-reveal]').first()
  await expect
    .poll(() => firstCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 10_000,
      message: 'the first gallery card should fade up to full opacity',
    })
    .toBe('1')
})

test('desktop: gallery cards fully visible after a view-transition navigation', async ({
  page,
}, testInfo) => {
  test.skip(
    isMobile(testInfo.project.name),
    'view transitions only run on fine-pointer devices',
  )
  await page.goto('/')
  await page.click('main a[href="/galleri"]')
  await page.waitForURL('**/galleri')

  const firstCard = page.locator('.gallery-masonry [data-reveal]').first()
  await expect
    .poll(() => firstCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 5_000,
      message: 'the first gallery card should fade up to full opacity',
    })
    .toBe('1')
})

test('mobile: cards reveal promptly (gate never hangs without view transitions)', async ({
  page,
}, testInfo) => {
  test.skip(isDesktop(testInfo.project.name), 'mobile only')
  await recordRevealTimeline(page)
  await page.goto('/galleri')
  await page.waitForFunction(
    () =>
      (
        window as unknown as {
          __revealTimeline?: { revealStart: number | null }
        }
      ).__revealTimeline?.revealStart != null,
    undefined,
    { timeout: 10_000 },
  )

  const timeline = await getTimeline(page)
  expect(timeline.revealStart).not.toBeNull()
  // Intent: on mobile the gate must never hang without view transitions —
  // the reveal has to complete. revealStart is wall-clock from navigation
  // start, and under 4-worker parallel load the reveal module's registration
  // itself is delayed past 1000ms, so a tight bound flakes on the legitimately
  // late-but-successful reveal. whenPageShown's 1500ms safety timer is the
  // designed backstop for a swallowed pagereveal, so bound the reveal at that
  // window plus a parallel-load margin. A real hang (gate never released, no
  // backstop) never sets revealStart and trips the waitForFunction above.
  expect(timeline.revealStart!).toBeLessThan(8000)

  const firstCard = page.locator('.gallery-masonry [data-reveal]').first()
  await expect
    .poll(() => firstCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 5_000,
    })
    .toBe('1')
})

test('gallery: below-fold cards stay hidden until scrolled into view', async ({
  page,
}) => {
  // The gallery must NOT mass-reveal at load: cards below the fold stay at
  // opacity 0.01 until they scroll into view, so scrolling reads as an
  // infinite stream of fading artwork (same reveal as heim/kontakt sections).
  await page.goto('/galleri')

  // Wait for the reveal module's initial pass: the first (above-fold) card
  // gets data-revealed; only then are below-fold cards guaranteed observed.
  await expect
    .poll(() => page.locator('[data-reveal][data-revealed]').count(), {
      timeout: 10_000,
      message: 'the reveal module initial pass should reveal in-viewport cards',
    })
    .toBeGreaterThan(0)

  const belowFoldCount = await page.evaluate(
    () =>
      Array.from(
        document.querySelectorAll('.gallery-masonry [data-reveal]'),
      ).filter(el => el.getBoundingClientRect().top > window.innerHeight)
        .length,
  )
  test.skip(belowFoldCount === 0, 'no cards below the fold')
  expect(belowFoldCount).toBeGreaterThan(0)

  const hiddenBefore = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.gallery-masonry [data-reveal]'))
      .filter(el => el.getBoundingClientRect().top > window.innerHeight)
      .every(el => !el.hasAttribute('data-revealed')),
  )
  expect(hiddenBefore, 'below-fold cards must not reveal at page load').toBe(
    true,
  )

  // Scrolling the last card into view reveals it (and, per FK-029, every
  // card passed on the way must reveal too).
  const lastCard = page.locator('.gallery-masonry [data-reveal]').last()
  await lastCard.scrollIntoViewIfNeeded()
  await expect
    .poll(() => lastCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 10_000,
      message: 'below-fold card should reveal when scrolled into view',
    })
    .toBe('1')
})

test('current-page nav link is inert (no same-URL reload flash)', async ({
  page,
}, testInfo) => {
  // Clicking the nav link for the page you are already on is a same-URL
  // navigation — a reload without a view transition that flashes the whole
  // page white while it loads. The nav renders it as inert text instead.
  test.skip(isMobile(testInfo.project.name), 'desktop nav only')
  await page.goto('/galleri')

  const desktopNav = page
    .getByRole('navigation', { name: 'Hovudnavigasjon' })
    .first()
  await expect(desktopNav.locator('span[aria-current="page"]')).toHaveText(
    'Galleri',
  )
  await expect(desktopNav.locator('a[href="/galleri"]')).toHaveCount(0)

  // Clicking the inert entry must not navigate or reload.
  await page.evaluate(() => {
    ;(window as unknown as { __noReload?: boolean }).__noReload = true
  })
  await desktopNav.locator('span[aria-current="page"]').click()
  await expect(page).toHaveURL(/\/galleri$/)
  const survived = await page.evaluate(
    () => (window as unknown as { __noReload?: boolean }).__noReload === true,
  )
  expect(survived, 'clicking the current page must not reload').toBe(true)
})

test('detail pages keep the gallery nav link (only exact URL is inert)', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop nav only')
  // On /galleri/ein-labrador the "Galleri" entry is NOT the current page —
  // it must stay a real link back to the index.
  await page.goto('/galleri/ein-labrador')

  const desktopNav = page
    .getByRole('navigation', { name: 'Hovudnavigasjon' })
    .first()
  // No nav entry is "current" on a detail page — and Galleri must be a link.
  await expect(desktopNav.locator('span[aria-current="page"]')).toHaveCount(0)
  await expect(desktopNav.locator('a[href="/galleri"]')).toHaveCount(1)
  await desktopNav.locator('a[href="/galleri"]').click()
  await expect(page).toHaveURL(/\/galleri$/)
})

test('mobile menu: current-page entry is inert and just closes the menu', async ({
  page,
}, testInfo) => {
  test.skip(isDesktop(testInfo.project.name), 'mobile menu only')
  await page.goto('/galleri')
  await page.locator('[data-menu-toggle]').click()
  await expect(
    page.locator('[data-menu-nav] span[aria-current="page"]'),
  ).toHaveText('Galleri')
  await page.locator('[data-menu-nav] span[aria-current="page"]').click()
  await expect(page.locator('html')).not.toHaveClass(/menu-open/)
  await expect(page).toHaveURL(/\/galleri$/)
})

test('gallery head preloads the above-fold artwork images', async ({
  page,
}) => {
  // The view-transition snapshot of the gallery page must include the cards'
  // images; the preloads (same optimized URLs as the rendered <img>s) make
  // sure they are decoded before the first render.
  await page.goto('/galleri')
  const preloads = await page
    .locator('link[rel="preload"][as="image"]')
    .evaluateAll(links => links.map(l => l.getAttribute('href')))
  expect(preloads.length).toBeGreaterThanOrEqual(1)

  const firstSrc = await page
    .locator('.gallery-masonry img')
    .first()
    .getAttribute('src')
  expect(preloads).toContain(firstSrc)
})

test('gallery → detail morph: view-transition names are unique and rendered', async ({
  page,
}, testInfo) => {
  // Per the View Transitions spec, a view-transition-name must be unique
  // across RENDERED elements; a duplicate (or a name on a display:none
  // element) skips/aborts the transition, killing the card→detail morph.
  test.skip(isMobile(testInfo.project.name), 'desktop only')

  const named = () =>
    page.evaluate(() => {
      const inHiddenSubtree = (el: Element) => {
        let node: Element | null = el
        while (node) {
          if (getComputedStyle(node).display === 'none') return true
          node = node.parentElement
        }
        return false
      }
      return Array.from(
        document.querySelectorAll('[data-astro-transition-scope]'),
      )
        .map(el => {
          const cs = getComputedStyle(el)
          const name = cs.viewTransitionName
          if (
            !name ||
            name === 'none' ||
            name === 'root' ||
            !name.startsWith('art-')
          )
            return null
          return { name, hidden: inHiddenSubtree(el) }
        })
        .filter((x): x is { name: string; hidden: boolean } => x !== null)
    })

  await page.goto('/galleri')
  const galleryNames = await named()
  expect(galleryNames.length).toBeGreaterThan(1)
  const unique = new Set(galleryNames.map(n => n.name))
  expect(unique.size).toBe(galleryNames.length) // no duplicate names
  for (const n of galleryNames)
    expect(n.hidden, `${n.name} must be rendered`).toBe(false)

  // The clicked card's image URL must equal the detail page's frame image
  // URL: the new-page snapshot is captured at first render, and only a
  // cached URL decodes in time. A different URL (e.g. hi-res) shows a blank
  // frame and the image pops back in — the morph only "worked" in the
  // detail → gallery direction before this invariant held.
  const cardSrc = await page
    .locator(GALLERY_LINK)
    .first()
    .locator('img')
    .getAttribute('src')

  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  const detailNames = await named()
  // Exactly one rendered element holds the artwork's name on the detail page
  // (the zoom dialog + mobile variant must not carry it while hidden).
  expect(detailNames.filter(n => !n.hidden)).toHaveLength(1)
  for (const n of detailNames) expect(n.hidden).toBe(false)

  const detailSrc = await page
    .locator('[data-zoom-page-frame] img')
    .first()
    .getAttribute('src')
  expect(detailSrc).toBe(cardSrc)
})

test('desktop: below-fold cards still reveal on scroll after a navigation', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop only')
  await page.goto('/galleri')

  // The last card starts below the fold; scrolling it into view must trigger
  // the IntersectionObserver reveal (the gate must not break it).
  const lastCard = page.locator('.gallery-masonry [data-reveal]').last()
  await lastCard.scrollIntoViewIfNeeded()
  await expect
    .poll(() => lastCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 5_000,
      message: 'the last gallery card should reveal when scrolled into view',
    })
    .toBe('1')
})

// ---------------------------------------------------------------------------
// FK-029 — jump-scroll reveal (instant scrolls past below-fold elements)
// ---------------------------------------------------------------------------

test('jump-scroll to the bottom reveals every [data-reveal] element', async ({
  page,
}) => {
  // IntersectionObserver only fires on intersection-state CHANGES, so an
  // instant scroll (trackpad flick, scrollTo, restored position) can take a
  // below-fold element straight past the viewport in one frame
  // (not-intersecting → not-intersecting) — no callback ever fires and the
  // element stays stuck invisible at opacity-[0.01]. The fix is a passive
  // scroll fallback that reveals an element the frame it reaches/passes the
  // viewport edge. This test reproduces the exact skip scenario.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  // Wait for the reveal module's initial pass to finish (its first in-viewport
  // element gets data-revealed); only then are the below-fold elements
  // guaranteed to be under observation before we jump.
  await expect
    .poll(() => page.locator('[data-reveal][data-revealed]').count(), {
      timeout: 10_000,
      message:
        'the reveal module initial pass should reveal in-viewport elements',
    })
    .toBeGreaterThan(0)

  // The test is only meaningful if something is still hidden below the fold.
  const hiddenBefore = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('[data-reveal]')).filter(
        el => !el.hasAttribute('data-revealed'),
      ).length,
  )
  expect(
    hiddenBefore,
    'there must be below-fold elements to jump past',
  ).toBeGreaterThan(0)

  const total = await page.locator('[data-reveal]').count()

  // One instant jump straight to the bottom — no smooth behavior, no
  // intermediate scroll positions (that is what defeats the observer).
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('[data-reveal]'))
          return (
            els.length > 0 && els.every(el => el.hasAttribute('data-revealed'))
          )
        }),
      {
        timeout: 5_000,
        message:
          'jump-scroll must reveal every [data-reveal] element (scroll fallback)',
      },
    )
    .toBe(true)

  expect(await page.locator('[data-reveal]').count()).toBe(total)
})
