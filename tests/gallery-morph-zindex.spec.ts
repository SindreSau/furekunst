// Regression: on the back-navigation from a gallery detail page, the artwork
// that morphs back to its card used to paint *behind* the other gallery cards.
// The view-transition groups paint in DOM order and the other cards are
// "entry-only" groups (new document only), so they stacked above the paired
// morphing group. The native fix is a z-index on the ::view-transition-group
// pseudo-element (W3C csswg-drafts #8941), applied to the active artwork.

import { test, expect } from './fixtures'

const GALLERY_LINK = 'a[data-artwork-click]'

test('the morphing artwork group is raised above its gallery siblings', async ({
  page,
}) => {
  await page.goto('/galleri')
  await page.waitForSelector(GALLERY_LINK)

  const href = await page.locator(GALLERY_LINK).first().getAttribute('href')
  const slug = href!.split('/').pop()!
  const rule = `::view-transition-group(art-${slug}) { z-index: 1; }`

  // Forward: the detail page carries the rule so the artwork morphs on top
  // when it arrives from the gallery.
  await page.locator(GALLERY_LINK).first().click()
  await page.waitForURL('**/galleri/**')
  await page.waitForSelector('[data-zoom-page-frame]')

  const detailHasRule = await page.evaluate(
    rule =>
      Array.from(document.querySelectorAll('style')).some(s =>
        s.textContent!.includes(rule),
      ),
    rule,
  )
  expect(detailHasRule).toBe(true)

  // Back: the rule is injected into the incoming gallery document so the
  // artwork morphs back on top instead of behind the other cards.
  await page.goBack()
  await page.waitForURL(url => url.pathname === '/galleri')

  await expect
    .poll(
      () =>
        page.evaluate(
          rule =>
            document.querySelector('style[data-art-vt]')?.textContent === rule,
          rule,
        ),
      { timeout: 5_000 },
    )
    .toBe(true)
})
