// Publish / unpublish — the gallery collection has a `published` checkbox in
// Keystatic (default true). This spec verifies the server-side filter wiring
// WITHOUT mutating content (mutating the collection mid-run destabilises the
// shared dev server, so the temporary-entry approach is avoided): it reads
// the collection JSON on disk, computes the published set, and asserts the
// live /galleri page and /sitemap.xml agree with exactly that set. Entries
// without `published` (or with it true) are shown; `published: false` ones
// are excluded everywhere.

import { test, expect } from './fixtures'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const GALLERY_DIR = 'src/content/gallery'

interface GalleryEntry {
  published?: boolean
  slug?: string
  title?: string
}

const publishedSlugs = (): string[] =>
  readdirSync(GALLERY_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const raw = JSON.parse(
        readFileSync(join(GALLERY_DIR, file), 'utf8'),
      ) as GalleryEntry
      return { raw, id: file.replace(/\.json$/, '') }
    })
    .filter(({ raw }) => raw.published !== false)
    .map(({ raw, id }) => raw.slug || id)
    .sort()

test('gallery page shows exactly the published artworks', async ({ page }) => {
  await page.goto('/galleri')
  await page.waitForSelector('[data-artwork-card]')

  const shown = await page
    .locator('a[data-artwork-card]')
    .evaluateAll(links =>
      links
        .map(link => link.getAttribute('href')?.replace(/^\/galleri\//, ''))
        .filter((slug): slug is string => Boolean(slug))
        .sort(),
    )

  expect(shown).toEqual(publishedSlugs())
})

test('sitemap lists exactly the published artworks', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)
  const body = await response.text()

  const slugs = Array.from(
    body.matchAll(/<loc>https:\/\/furekunst\.no\/galleri\/([^<]+)<\/loc>/g),
    match => match[1],
  ).sort()

  expect(slugs).toEqual(publishedSlugs())
})
