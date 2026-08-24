import { expect, test, type Page } from './fixtures'

// Mobile nav menu regression tests for src/components/MobileMenu.astro.
//
// The menu is a fixed full-screen overlay (#mobilmeny) toggled by a hamburger
// button ([data-menu-toggle]). Astro bundles component scripts into modules
// that only execute once per page load, so with the ClientRouter the menu
// must re-bind itself on every navigation (via astro:page-load). Otherwise
// the toggle loses its click listener after the first navigation and the
// menu can never be opened again — that exact regression is covered below.

const TOGGLE = '[data-menu-toggle]'
const NAV = '#mobilmeny'

test.beforeEach(async ({ viewport }, testInfo) => {
  // These tests exercise the mobile menu; skip when running on a desktop
  // viewport (the toggle is md:hidden there).
  test.skip((viewport?.width ?? 0) >= 768, 'mobile viewport only')
})

async function expectMenuOpen(page: Page) {
  await expect(page.locator(TOGGLE)).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator(TOGGLE)).toHaveAttribute('aria-label', 'Steng meny')
  // The nav slides in from the right; when open its left edge is at 0.
  await expect
    .poll(async () => (await page.locator(NAV).boundingBox())?.x ?? -1, {
      message: 'mobile nav should be on screen',
    })
    .toBeLessThan(1)
  // Scroll lock is active while the menu is open.
  await expect(page.locator('html')).toHaveClass(/menu-open/)
}

async function expectMenuClosed(page: Page) {
  await expect(page.locator(TOGGLE)).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator(TOGGLE)).toHaveAttribute('aria-label', 'Opna meny')
  // When closed the nav is translated fully off-screen to the right — and at
  // desktop widths it is display:none (boundingBox() returns null), which
  // also counts as closed.
  const width = page.viewportSize()?.width ?? 390
  await expect
    .poll(
      async () =>
        (await page.locator(NAV).boundingBox())?.x ?? Number.POSITIVE_INFINITY,
      { message: 'mobile nav should be off-screen to the right' },
    )
    .toBeGreaterThanOrEqual(width)
  await expect(page.locator('html')).not.toHaveClass(/menu-open/)
}

// Click the toggle and wait for the menu to reach the desired state. The
// menu binds its click listener on astro:page-load, which can fire slightly
// after a navigation/load settles — so a click may be lost before the
// listener exists. And a click can land on the page just BEFORE the
// ClientRouter swap replaces the DOM (the URL changes on pushState, which
// happens before the swap) — the menu then opens on the old page and the
// swap wipes the state. Both are handled by polling the FULL menu state and
// re-clicking while it is wrong: a state wipe flips aria-expanded back to
// false on the fresh DOM, and the next iteration clicks again on the
// settled page. Never click while a view transition is running: the router
// keeps data-astro-transition on <html> until the transition finishes.
async function openMenu(page: Page) {
  const toggle = page.locator(TOGGLE)
  await expect
    .poll(
      async () => {
        if (
          await page.evaluate(() =>
            document.documentElement.hasAttribute('data-astro-transition'),
          )
        )
          return false
        if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
          await toggle.click()
          return false
        }
        // aria-expanded is true — verify the rest of the open state on the
        // same page so a swap that wiped the menu-open class (but left a
        // stale true behind) forces a re-click on the fresh DOM.
        const htmlOpen = await page.evaluate(() =>
          document.documentElement.classList.contains('menu-open'),
        )
        if (!htmlOpen) {
          await toggle.click()
          return false
        }
        const x = (await page.locator(NAV).boundingBox())?.x ?? -1
        return x < 1
      },
      { message: 'mobile menu should be fully open', timeout: 10_000 },
    )
    .toBe(true)
}

async function closeMenu(page: Page) {
  const toggle = page.locator(TOGGLE)
  await expect
    .poll(
      async () => {
        if (
          await page.evaluate(() =>
            document.documentElement.hasAttribute('data-astro-transition'),
          )
        )
          return false
        if ((await toggle.getAttribute('aria-expanded')) !== 'false') {
          await toggle.click()
          return false
        }
        const htmlOpen = await page.evaluate(() =>
          document.documentElement.classList.contains('menu-open'),
        )
        if (htmlOpen) return false
        const width = page.viewportSize()?.width ?? 390
        const x =
          (await page.locator(NAV).boundingBox())?.x ??
          Number.POSITIVE_INFINITY
        return x >= width
      },
      { message: 'mobile menu should be fully closed', timeout: 10_000 },
    )
    .toBe(true)
}

test.describe('mobile nav menu', () => {
  test('can be reopened after navigating via a menu link', async ({ page }) => {
    // Regression: after the ClientRouter swaps the page the toggle lost its
    // click listener (bundled scripts don't re-run) and the menu could no
    // longer be opened.
    await page.goto('/')
    await openMenu(page)
    await page.locator(NAV).getByRole('link', { name: 'Galleri' }).click()
    await expect(page).toHaveURL(/\/galleri$/)
    await expectMenuClosed(page) // fresh page renders a closed menu
    await openMenu(page) // must work again
    await expect(
      page.locator(NAV).getByRole('link', { name: 'Kontakt' }),
    ).toBeVisible()
  })

  test('opens and closes on toggle tap', async ({ page }) => {
    await page.goto('/')
    await expectMenuClosed(page)
    await openMenu(page)
    // The current page is rendered as inert text (aria-current), other
    // entries as links — both must be visible when the menu is open.
    await expect(page.locator(NAV).getByText('Heim')).toBeVisible()
    await expect(
      page.locator(NAV).getByRole('link', { name: 'Kontakt' }),
    ).toBeVisible()
    await closeMenu(page)
  })

  test('closes on Escape and returns focus to the toggle', async ({ page }) => {
    await page.goto('/')
    await openMenu(page)
    await page.keyboard.press('Escape')
    await expectMenuClosed(page)
    await expect(page.locator(TOGGLE)).toBeFocused()
  })

  test('closes automatically when resized up to desktop', async ({ page }) => {
    await page.goto('/')
    await openMenu(page)
    await page.setViewportSize({ width: 900, height: 800 })
    await expectMenuClosed(page)
  })

  test('is hidden on desktop; desktop nav is used instead', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')
    await expect(page.locator(TOGGLE)).toBeHidden()
    const desktopNav = page.getByRole('navigation', {
      name: 'Hovudnavigasjon',
    })
    await expect(desktopNav).toBeVisible()
    await expect(
      desktopNav.getByRole('link', { name: 'Kontakt' }),
    ).toBeVisible()
  })

  test('can be reopened after browser back navigation', async ({ page }) => {
    await page.goto('/galleri')
    await openMenu(page)
    await page.locator(NAV).getByRole('link', { name: 'Heim' }).click()
    await expect(page).toHaveURL(/\/$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/galleri$/)
    await openMenu(page)
  })

  test('closes when a menu link is opened in a new tab', async ({ page }) => {
    await page.goto('/')
    await openMenu(page)
    await page
      .locator(NAV)
      .getByRole('link', { name: 'Kontakt' })
      .click({ modifiers: ['Meta'] })
    await expectMenuClosed(page)
  })

  test('menu keeps covering the page until navigation swaps it (no flash)', async ({
    page,
  }) => {
    // Regression: the menu used to slide away on link click, revealing the
    // current page while the ClientRouter fetched the next one — a visible
    // flash. It must stay covering the screen until the view transition swaps
    // the page.
    await page.goto('/')
    await openMenu(page)

    // Hold the /kontakt document request so the navigation is pending while
    // we assert the menu is still covering the current page.
    let release: (() => void) | undefined
    const gate = new Promise<void>(r => {
      release = r
    })
    await page.route('**/kontakt', async route => {
      await gate
      await route.continue()
    })

    await page.locator(NAV).getByRole('link', { name: 'Kontakt' }).click()

    // While the next page is still loading the menu must remain open and on
    // screen (aria-expanded stays true, left edge still at 0).
    await expect(page.locator(TOGGLE)).toHaveAttribute('aria-expanded', 'true')
    await expect
      .poll(async () => (await page.locator(NAV).boundingBox())?.x ?? -1)
      .toBeLessThan(1)

    release!()
    await expect(page).toHaveURL(/\/kontakt$/)
    await expectMenuClosed(page) // fresh page renders a closed menu
  })
})
