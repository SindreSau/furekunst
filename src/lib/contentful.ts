import { createClient, type ContentfulClientApi } from 'contentful'

// Contentful client factory (FK-006).
// Dev/preview mode uses the preview API + preview token so draft entries show
// up locally; builds use the delivery API + token (published entries only).
// Astro exposes all .env vars server-side via `import.meta.env`.
export function createContentfulClient(): ContentfulClientApi<undefined> {
  const isPreview = import.meta.env.DEV
  return createClient({
    space: import.meta.env.CONTENTFUL_SPACE_ID,
    accessToken: isPreview
      ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
      : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
    host: isPreview ? 'preview.contentful.com' : 'cdn.contentful.com',
  })
}