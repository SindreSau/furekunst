import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext): Promise<Response> {
  const entries = await getCollection('gallery')

  if (context.cache.enabled) {
    context.cache.set({ maxAge: 3600 })
  }

  const paths = ['/', '/galleri', '/kontakt']
  for (const entry of entries) {
    paths.push(`/galleri/${entry.data.slug || entry.id}`)
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>https://furekunst.no${path}</loc></url>`).join('\n')}
</urlset>`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
