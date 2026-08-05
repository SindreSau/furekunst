import { defineLiveCollection } from 'astro:content'
import { z } from 'astro/zod'
import { contentfulGalleryLiveLoader } from './loaders/contentful-gallery-live'

// FK-018: gallery posts moved from a build-time collection (content.config.ts)
// to a live collection — fetched on demand at request time (preview API in
// dev, delivery API in production) and cached via Astro.cache with the loader's
// cache hints.
export const collections = {
  galleryPosts: defineLiveCollection({
    loader: contentfulGalleryLiveLoader(),
    // Image is optional in the schema but the loader skips entries without a
    // usable image (B1), so every live entry carries one.
    schema: z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string().default(''),
      type: z.enum(['original', 'print']),
      size: z.string().optional(),
      price: z.number().optional(),
      sizeAndPrice: z
        .array(
          z.object({
            size: z.string(),
            price: z.number(),
          }),
        )
        .default([]),
      passepartout: z.boolean().default(false),
      image: z
        .object({
          url: z.string(),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        })
        .optional(),
    }),
  }),
}
