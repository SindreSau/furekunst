// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://furekunst.no',
  output: 'server',
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      minimumCacheTTL: 2592000,
      formats: ['image/avif', 'image/webp'],
    },
  }),
  integrations: [react(), keystatic()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
