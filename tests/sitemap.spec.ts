// FK-018 — live sitemap endpoint replaces the removed @astrojs/sitemap output.
// STUB: written by Dev C ahead of the implementation; the Wave-2 tester
// completes and runs these. They fail until the endpoint lands.
//
// Coverage map:
//  - /sitemap.xml serves application/xml with /, /galleri, /kontakt and every
//    /galleri/{slug}
//  - /sitemap-index.xml is gone (integration removed)
//  - robots.txt points at https://furekunst.no/sitemap.xml
//
// Run: pnpm test

import { test, expect } from '@playwright/test'

test('sitemap.xml lists the home, gallery, kontakt and every artwork slug', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('application/xml')

  const body = await response.text()
  expect(body).toContain('<loc>https://furekunst.no/</loc>')
  expect(body).toContain('<loc>https://furekunst.no/galleri</loc>')
  expect(body).toContain('<loc>https://furekunst.no/kontakt</loc>')

  const slugs = Array.from(
    body.matchAll(/<loc>https:\/\/furekunst\.no\/galleri\/([^<]+)<\/loc>/g),
    match => match[1],
  )
  expect(slugs.length).toBeGreaterThan(0)
})

test('sitemap-index.xml is no longer served', async ({ request }) => {
  const response = await request.get('/sitemap-index.xml')
  expect(response.status()).toBe(404)
})

test('robots.txt points at the live sitemap', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain('Sitemap: https://furekunst.no/sitemap.xml')
})
