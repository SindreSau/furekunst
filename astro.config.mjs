// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import { cacheVercel } from '@astrojs/vercel/cache'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://furekunst.no',
  // FK-018: gallery content is a live collection, so the site is server-
  // rendered. On-demand pages (galleri, home, sitemap) are cached via the
  // Vercel CDN cache provider + ISR; static pages opt back in with
  // `export const prerender = true` (kontakt, 404).
  output: 'server',
  adapter: vercel({ isr: { expiration: 3600 }, imageService: true }),
  cache: { provider: cacheVercel() },
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    remotePatterns: [{ hostname: 'images.ctfassets.net' }],
  },
})
