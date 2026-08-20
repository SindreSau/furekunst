// View-transition tests.
//
// View transitions are enabled across all devices (desktop + mobile) via
// Astro's <ClientRouter />. The gallery → detail artwork morph is active on all
// screen sizes, carrying Astro's transition scope.
// Gating only applies to reduced-motion users (`prefers-reduced-motion: reduce`).

import { test, expect } from './fixtures'

const GALLERY_LINK = 'a[data-artwork-click]'

const isMobile = (project: string) =>
  ['mobile-chromium', 'android-chrome', 'ios-chrome', 'ios-safari'].includes(
    project,
  )

// Navigation morphs swallow clicks on the framed artwork: the browser's
// view-transition overlay sits above the page until the morph ends, so a
// click that lands mid-morph never reaches its target. waitForURL resolves
// on pushState — before the new page's DOM is swapped in — and under load
// the morph can begin a beat after the swap, so wait for the swapped-in
// content first, then require a sustained animation-quiet period before
// clicking.
async function waitForMorphToSettle(
  page: import('@playwright/test').Page,
  selector: string,
) {
  await page.waitForSelector(selector)
  try {
    await page.waitForFunction(() => document.getAnimations().length === 0, {
      timeout: 5_000,
    })
  } catch {
    // timeout or navigation
  }
  let quiet = 0
  for (let i = 0; i < 40 && quiet < 5; i++) {
    await page.waitForTimeout(100)
    try {
      const animating = await page.evaluate(
        () => document.getAnimations().length > 0,
      )
      quiet = animating ? 0 : quiet + 1
    } catch {
      quiet = 0
    }
  }
}

test('emulation premise: mobile is coarse/touch, desktop is fine-pointer', async ({
  page,
}, testInfo) => {
  const finePointer = await page.evaluate(
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  const userAgent = await page.evaluate(() => navigator.userAgent)
  if (isMobile(testInfo.project.name)) {
    expect(
      finePointer,
      'the touch projects must emulate a coarse/touch pointer',
    ).toBe(false)
    if (['ios-safari', 'ios-chrome'].includes(testInfo.project.name)) {
      expect(
        userAgent,
        'iPhone projects must carry the iPhone form-factor UA',
      ).toContain('iPhone')
    }
  } else {
    expect(finePointer, 'desktop-chromium must emulate a fine pointer').toBe(
      true,
    )
  }
})

test('mobile: gallery artwork cards keep their view-transition names', async ({
  page,
}) => {
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const cardNames = await page
    .locator('figure[data-astro-transition-scope]')
    .evaluateAll(els => els.map(el => getComputedStyle(el).viewTransitionName))
  expect(cardNames.length).toBeGreaterThan(0)
  for (const name of cardNames) {
    expect(
      name,
      'each card frame must carry its art-* transition name',
    ).toMatch(/^art-/)
  }
})

test('page content is not separately animated (no gray-wash cross-fade)', async ({
  page,
}, testInfo) => {
  // Regression: <main> used to have transition:animate="fade" — the whole
  // content area cross-faded, and on artwork-heavy pages the mid-blend read
  // as a gray flash on mobile. <main> must stay part of the root snapshot:
  // instant swap + only the named frames morph.
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const mainName = await page
    .locator('main')
    .evaluate(el => getComputedStyle(el).viewTransitionName)
  expect(mainName).toBe('none')

  const htmlName = await page
    .locator('html')
    .evaluate(el => getComputedStyle(el).viewTransitionName)
  expect(htmlName).not.toBe('none')
  expect(htmlName.length).toBeGreaterThan(0)
})

test('nav underline morphs between tabs (no fade-out/fade-in)', async ({
  page,
}) => {
  // Regression: the nav underline used Astro's default animation for named
  // elements (astroFadeOut/astroFadeIn), so the bar faded out and faded in at
  // the new position instead of sliding. It must use `animation-name: none` so
  // the browser's native view-transition morph interpolates its position/size.
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const navUnderlineAnim = await page.evaluate(() => {
    const rules = Array.from(document.styleSheets).flatMap(s => {
      try {
        return Array.from(s.cssRules).map(r => r.cssText)
      } catch {
        return []
      }
    })
    const oldRule = rules.find(t =>
      t.includes('::view-transition-old(nav-underline)'),
    )
    const newRule = rules.find(t =>
      t.includes('::view-transition-new(nav-underline)'),
    )
    return { oldRule, newRule }
  })

  expect(navUnderlineAnim.oldRule).toBeTruthy()
  expect(navUnderlineAnim.newRule).toBeTruthy()
  expect(navUnderlineAnim.oldRule).toContain('animation-name: none')
  expect(navUnderlineAnim.newRule).toContain('animation-name: none')
})

test('navigation is client-side: no full-page reload, astro:page-load fires', async ({
  page,
}) => {
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  // A full reload wipes window state; the marker survives a client-side
  // navigation (pushState + swap).
  await page.evaluate(() => {
    ;(window as unknown as { __spaNav?: boolean }).__spaNav = true
  })

  let pageLoadEvents = 0
  await page.evaluate(() => {
    document.addEventListener('astro:page-load', () => {
      ;(window as unknown as { __pageLoadCount?: number }).__pageLoadCount =
        ((window as unknown as { __pageLoadCount?: number }).__pageLoadCount ??
          0) + 1
    })
  })

  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')

  expect(
    await page.evaluate(
      () => (window as unknown as { __spaNav?: boolean }).__spaNav,
    ),
  ).toBe(true)
  // waitForURL resolves on pushState, which happens before the DOM swap —
  // astro:page-load fires after it. Poll for the event itself.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as unknown as { __pageLoadCount?: number }).__pageLoadCount,
        ),
      { timeout: 5_000 },
    )
    .toBeGreaterThan(0)
})

test('forward navigation to the gallery plays the fade-up cascade', async ({
  page,
}) => {
  // The staggered fade-up plays after a forward navigation — but only once
  // the view transition has finished (never behind the frozen snapshot,
  // which would pop when the overlay lifts). The cards must start hidden
  // right after the swap and fade up to full opacity.
  await page.goto('/')
  await page.click('main a[href="/galleri"]')
  await page.waitForURL('**/galleri')

  const firstCard = page.locator('.gallery-masonry [data-reveal]').first()
  const opacityRightAfter = await firstCard.evaluate(
    el => getComputedStyle(el).opacity,
  )
  expect(opacityRightAfter).not.toBe('1')
  await expect
    .poll(() => firstCard.evaluate(el => getComputedStyle(el).opacity), {
      timeout: 5_000,
      message: 'cards on a forward-navigated gallery page must fade up',
    })
    .toBe('1')
})

test('the gallery → detail artwork morph carries its names on every device', async ({
  page,
}) => {
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const cardName = await page
    .locator('figure[data-astro-transition-scope]')
    .first()
    .evaluate(el => getComputedStyle(el).viewTransitionName)
  expect(cardName).toMatch(/^art-/)

  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  // On the detail page exactly one rendered frame carries the artwork's name
  // (the zoom dialog and mobile variants must not duplicate it).
  const detailNames = await page.evaluate(() => {
    const inHiddenSubtree = (el: Element) => {
      let node: Element | null = el
      while (node) {
        if (getComputedStyle(node).display === 'none') return true
        node = node.parentElement
      }
      return false
    }
    return Array.from(
      document.querySelectorAll('figure[data-astro-transition-scope]'),
    )
      .map(el => ({
        name: getComputedStyle(el).viewTransitionName,
        hidden: inHiddenSubtree(el),
      }))
      .filter(x => x.name.startsWith('art-'))
  })
  expect(detailNames.filter(n => !n.hidden)).toHaveLength(1)
})

test('reduced-motion: frames drop their view-transition names', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-click]')

  const cardName = await page
    .locator('figure[data-astro-transition-scope]')
    .first()
    .evaluate(el => getComputedStyle(el).viewTransitionName)

  expect(cardName).toBe('none')
})

test('zoom dialog still works', async ({ page }) => {
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  const trigger = page.locator('[data-zoom-trigger]')
  if (await trigger.isVisible()) {
    await trigger.click()
    await expect(page.locator('[data-zoom-dialog]')).toBeVisible()
    await page.locator('[data-zoom-close]').click()
    await expect(page.locator('[data-zoom-dialog]')).toBeHidden()
  }
})

test('zoom dialog stacks above the header (no z-index trap)', async ({
  page,
}, testInfo) => {
  // Regression: the dialog (fixed z-[100]) used to sit inside <main>'s
  // stacking context (relative z-0 + view-transition name), so the header
  // (z-40) painted over it and a `html.zoom-open main { z-index: 50 }` hack
  // was needed. <main> now creates no stacking context; the dialog must
  // outrank the header on its own.
  test.skip(isMobile(testInfo.project.name), 'zoom is desktop-only')
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  await page.locator('[data-zoom-trigger]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeVisible()

  const stacking = await page.evaluate(() => {
    const dialog = document.querySelector('[data-zoom-dialog]')
    const header = document.querySelector('header')
    const main = document.querySelector('main')
    return {
      dialogZ: getComputedStyle(dialog!).zIndex,
      headerZ: getComputedStyle(header!).zIndex,
      mainZ: getComputedStyle(main!).zIndex,
      mainPosition: getComputedStyle(main!).position,
    }
  })
  expect(Number(stacking.dialogZ)).toBeGreaterThan(Number(stacking.headerZ))
  expect(stacking.mainZ).toBe('auto')
  expect(stacking.mainPosition).toBe('static')

  await page.locator('[data-zoom-close]').click()
  await expect(page.locator('[data-zoom-dialog]')).toBeHidden()
})

test('zoomed image: clicking it zooms back out, cursor signals zoom-out', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'zoom is desktop-only')
  await page.goto('/galleri')
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await waitForMorphToSettle(page, '[data-zoom-page-frame]')

  await page.locator('[data-zoom-trigger]').click()
  const dialog = page.locator('[data-zoom-dialog]')
  await expect(dialog).toBeVisible()

  // The zoomed image signals "click to zoom back out" via the cursor.
  const content = page.locator('[data-zoom-content]')
  await content.hover()
  const cursor = await content.evaluate(el => getComputedStyle(el).cursor)
  expect(cursor).toBe('zoom-out')

  // Clicking the image zooms back out (same result as the close button).
  await content.click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('html')).not.toHaveClass(/zoom-open/)
})
