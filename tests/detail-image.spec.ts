// Detail-page image rendering (gallery → detail).
//
// On mobile the gallery card and the detail image are shown at basically the
// same size, so running the blur-up ("progressive") load on the detail page
// reads as a pointless blur-then-sharpen right after the morph. The detail
// image must therefore be a single sharp image on the mobile layout — it
// reuses the card's cached URL and stays crisp through the view transition.
// On desktop (where the detail image is meaningfully larger) the progressive
// blur→sharp load is kept.
//
// Run: pnpm test

import { test, expect, type Page } from './fixtures'

const isMobile = (project: string) => project === 'mobile-chromium'

const PAGE_FRAME = '[data-zoom-page-frame]'
const PAGE_IMG = '[data-zoom-page-frame] img[data-fade-img]'
const PLACEHOLDER = '[data-zoom-page-frame] [data-artwork-placeholder]'

// Slow the root crossfade so the mid-transition window is observable: while
// html[data-astro-transition] is present, reveal.ts's data-fade-img sharpen
// (which waits for the transition to end) has not run yet.
async function slowViewTransition(page: Page) {
  await page.addInitScript(() => {
    const install = () => {
      if (document.getElementById('__slow-vt')) return
      const style = document.createElement('style')
      style.id = '__slow-vt'
      style.textContent =
        '::view-transition-old(root), ::view-transition-new(root) { animation-duration: 1.2s !important; }'
      document.head.appendChild(style)
    }
    install()
    document.addEventListener('astro:page-load', install)
  })
}

test('mobile: detail image is one sharp image from the first frame (no blur-up)', async ({
  page,
}, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), 'mobile layout only')
  await slowViewTransition(page)
  await page.goto('/galleri')
  await page.click('a[data-artwork-click]')
  await page.waitForURL('**/galleri/**')
  await page.waitForSelector(PAGE_IMG)

  // Right after the swap the transition is still running and reveal.ts has
  // not sharpened anything yet — the image must already be crisp via CSS
  // alone, otherwise the morph shows a blur that pops when it lifts.
  const filter = await page
    .locator(PAGE_IMG)
    .evaluate(el => getComputedStyle(el).filter)
  expect(
    filter,
    'the detail image must be sharp (no blur) during the transition on mobile',
  ).toBe('none')

  // A single image with no blur-placeholder layer behind it.
  expect(await page.locator(`${PAGE_FRAME} img`).count()).toBe(1)
  const bg = await page
    .locator(PLACEHOLDER)
    .evaluate(el => getComputedStyle(el).backgroundImage)
  expect(bg).toBe('none')
})

test('desktop: detail image keeps the progressive blur-up', async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), 'desktop only')
  await page.goto('/galleri')
  await page.click('a[data-artwork-click]')
  await page.waitForURL('**/galleri/**')
  await page.waitForSelector(PAGE_IMG)

  // The blur-up machinery must be present on desktop: the blur class on the
  // image and the blur placeholder behind it.
  const imgClass = await page.locator(PAGE_IMG).getAttribute('class')
  expect(imgClass).toContain('blur-[1px]')
  const bg = await page
    .locator(PLACEHOLDER)
    .evaluate(el => getComputedStyle(el).backgroundImage)
  expect(bg).toContain('data:image/webp;base64,')

  // And it still sharpens (reveal.ts adds blur-none after the image decodes).
  await expect
    .poll(
      () => page.locator(PAGE_IMG).evaluate(el => getComputedStyle(el).filter),
      { timeout: 5_000, message: 'the desktop detail image must sharpen' },
    )
    .toBe('none')
})
