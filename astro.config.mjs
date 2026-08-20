// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import { cacheVercel } from '@astrojs/vercel/cache'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://furekunst.no',
  output: 'server',
  adapter: vercel({ isr: { expiration: 3600 }, imageService: true }),
  cache: { provider: cacheVercel() },
  integrations: [react(), keystatic()],
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
})
