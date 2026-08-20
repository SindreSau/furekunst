import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      description: z.string().optional().default(''),
      type: z.enum(['original', 'print']).default('original'),
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
      passepartout: z.boolean().default(true),
      image: image(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    }),
})

export const collections = { gallery }
