import { test, expect } from './fixtures'

test.describe('Content Singletons', () => {
  test('home page renders CMS content for about section, rich text, and CTA buttons', async ({
    page,
  }) => {
    await page.goto('/')

    // About heading and text
    const aboutHeading = page.locator('main h1')
    await expect(aboutHeading).toHaveText('Om Kunstnaren')

    const aboutSection = page.locator('main section').first()
    await expect(aboutSection).toContainText('Elisabeth Fure Schwarz')
    await expect(aboutSection).toContainText('Einar Granum Kunstfagskule')

    // Profile image
    const profileImg = aboutSection.locator(
      'img[alt="Portrett av Elisabeth Fure Schwarz"]',
    )
    await expect(profileImg).toBeVisible()

    // CTA buttons in main section
    const mainArea = page.locator('main')
    const galleryBtn = mainArea.locator('a[href="/galleri"]').first()
    const contactBtn = mainArea.locator('a[href="/kontakt"]').first()
    await expect(galleryBtn).toBeVisible()
    await expect(contactBtn).toBeVisible()
  })

  test('contact page renders CMS content, rich text paragraphs and structured data', async ({
    page,
  }) => {
    await page.goto('/kontakt')

    // Heading
    await expect(page.locator('main h1')).toHaveText('Kontakt')

    // Portrait image
    const portrait = page.locator('main img[alt="Elisabeth Fure Schwarz"]')
    await expect(portrait).toBeVisible()

    // Intro paragraphs
    const paragraphs = page.locator('main p')
    await expect(paragraphs.first()).toContainText('Har du spørsmål')

    // Social links and email in main content
    const mainArea = page.locator('main')
    const mailLink = mainArea
      .locator('a[href="mailto:fure.kunst@gmail.com"]')
      .first()
    await expect(mailLink).toBeVisible()

    const igLink = mainArea
      .locator('a[href="https://www.instagram.com/fure.kunst"]')
      .first()
    await expect(igLink).toBeVisible()

    // Structured data
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll(scripts =>
        scripts.map(s => JSON.parse(s.textContent ?? '{}')),
      )

    const contactSchema = jsonLd.find(ld => ld['@type'] === 'ContactPage')
    expect(contactSchema).toBeTruthy()
    expect(contactSchema.email).toBe('fure.kunst@gmail.com')
    expect(contactSchema.sameAs).toContain(
      'https://www.instagram.com/fure.kunst',
    )
  })

  test('SEO singleton provides meta title and description across pages', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(
      'Heim - Kunstnar Elisabeth Fure Schwarz | Furekunst',
    )

    const homeMetaDesc = page.locator('meta[name="description"]')
    await expect(homeMetaDesc).toHaveAttribute(
      'content',
      /Elisabeth Fure Schwarz er kunstnaren bak Furekunst/,
    )

    await page.goto('/galleri')
    await expect(page).toHaveTitle('Galleri - Kunstverk til sals | Furekunst')

    await page.goto('/kontakt')
    await expect(page).toHaveTitle('Kontakt | Furekunst')
  })

  test('footer displays dynamic copyright and social links', async ({
    page,
  }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('Furekunst. Alle rettar reserverte.')

    const igLink = footer.locator('a[aria-label="Instagram"]')
    await expect(igLink).toBeVisible()
    await expect(igLink).toHaveAttribute(
      'href',
      'https://www.instagram.com/fure.kunst',
    )
  })
})
