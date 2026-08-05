import { getLiveCollection } from 'astro:content'
import type { APIContext } from 'astro'

// FK-018: live sitemap replacing @astrojs/sitemap. On-demand endpoint — every
// request (or cached response) reflects the current artwork slugs.
export async function GET(context: APIContext): Promise<Response> {
  const { entries, error, cacheHint } = await getLiveCollection('galleryPosts')

  if (error) {
    console.error(`Failed to load gallery posts for sitemap: ${error.message}`)
    // Never cache a 503: a transient Contentful hiccup must not pin a broken
    // sitemap into the CDN.
    if (context.cache.enabled) context.cache.set(false)
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  if (context.cache.enabled) {
    if (cacheHint) context.cache.set(cacheHint)
    context.cache.set({ maxAge: 3600 })
  }

  const paths = ['/', '/galleri', '/kontakt']
  for (const entry of entries ?? []) {
    paths.push(`/galleri/${entry.data.slug}`)
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>https://furekunst.no${path}</loc></url>`).join('\n')}
</urlset>`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
