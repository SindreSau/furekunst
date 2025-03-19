import { createClient } from 'contentful'

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  accessToken:
    process.env.NODE_ENV === 'development'
      ? (process.env.CONTENTFUL_PREVIEW_TOKEN as string)
      : (process.env.CONTENTFUL_DELIVERY_TOKEN as string),
  host:
    process.env.NODE_ENV === 'development'
      ? 'preview.contentful.com'
      : 'cdn.contentful.com',
})
