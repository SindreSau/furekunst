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

test.beforeEach(async ({ page, viewport }, testInfo) => {
  // These tests exercise the mobile menu; skip when running on a desktop
  // viewport (the toggle is md:hidden there).
  test.skip((viewport?.width ?? 0) >= 768, 'mobile viewport only')
  // Keep the suite hermetic: umami analytics is external and irrelevant here.
  await page.route('https://umami.sindresau.me/**', route => route.abort())
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
// listener exists. We retry, but only while the toggle is in the *wrong*
// state, which makes the retries safe (a successful click flips the state
// synchronously, so we never click a second time on a menu that just opened).
async function clickToggleUntil(page: Page, expected: 'true' | 'false') {
  const toggle = page.locator(TOGGLE)
  await expect
    .poll(
      async () => {
        if ((await toggle.getAttribute('aria-expanded')) === expected)
          return true
        await toggle.click()
        return (await toggle.getAttribute('aria-expanded')) === expected
      },
      {
        message: `menu should be ${expected === 'true' ? 'open' : 'closed'} after clicking the toggle`,
      },
    )
    .toBe(true)
}

async function openMenu(page: Page) {
  await clickToggleUntil(page, 'true')
  await expectMenuOpen(page)
}

async function closeMenu(page: Page) {
  await clickToggleUntil(page, 'false')
  await expectMenuClosed(page)
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
})
