import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        slug: z.string().optional(),
        description: z.string().optional().default(''),
        type: z
          .object({
            discriminant: z.enum(['original', 'print']),
            value: z.record(z.string(), z.any()),
          })
          .or(z.enum(['original', 'print']))
          .default('original'),
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
      })
      .transform(raw => {
        const typeDiscriminant: 'original' | 'print' =
          typeof raw.type === 'object' && raw.type !== null
            ? raw.type.discriminant
            : raw.type
        const typeValue: Record<string, any> =
          typeof raw.type === 'object' && raw.type !== null
            ? raw.type.value
            : {}

        const isOriginal = typeDiscriminant === 'original'
        const isPrint = typeDiscriminant === 'print'

        const size: string | undefined = isOriginal
          ? (typeof typeValue.size === 'string' && typeValue.size.trim() !== ''
              ? typeValue.size
              : raw.size)
          : undefined

        const price: number | undefined = isOriginal
          ? (typeof typeValue.price === 'number' ? typeValue.price : raw.price)
          : undefined

        const sizeAndPrice: { size: string; price: number }[] = isPrint
          ? (Array.isArray(typeValue.sizeAndPrice)
              ? typeValue.sizeAndPrice
              : (raw.sizeAndPrice ?? []))
          : []

        return {
          title: raw.title,
          slug: raw.slug,
          description: raw.description,
          passepartout: raw.passepartout,
          image: raw.image,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
          type: typeDiscriminant,
          size,
          price,
          sizeAndPrice,
        }
      }),
})

const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      heroDesktopImage: image(),
      heroDesktopAlt: z.string().default('Bilde: Lazy dogs'),
      heroMobileImage: image().optional(),
      heroMobileAlt: z.string().optional().default('Bilde: Mas'),
      aboutHeading: z.string().default('Om Kunstnaren'),
      aboutImage: image(),
      aboutImageAlt: z.string().default('Portrett av Elisabeth Fure Schwarz'),
      aboutText: z.string().optional().default(''),
      aboutParagraphs: z.array(z.string()).optional(),
      featuredHeading: z.string().default('Nokre utvalgte bilete'),
      featuredItems: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
          }),
        )
        .default([]),
      galleryButtonText: z.string().default('Galleri'),
      contactButtonText: z.string().default('Ta kontakt'),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
})

const contact = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/contact' }),
  schema: ({ image }) =>
    z.object({
      heading: z.string().default('Kontakt'),
      image: image(),
      imageAlt: z.string().default('Elisabeth Fure Schwarz'),
      introText: z.string().optional().default(''),
      paragraphs: z.array(z.string()).optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
})

const settings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/settings' }),
  schema: () =>
    z.object({
      artistName: z.string().default('Elisabeth Fure Schwarz'),
      email: z.string().default('fure.kunst@gmail.com'),
      instagramUrl: z.string().default('https://www.instagram.com/fure.kunst'),
      instagramHandle: z.string().default('fure.kunst'),
      facebookUrl: z.string().default('https://www.facebook.com/fure.kunst/'),
      footerCopyright: z.string().default('Furekunst. Alle rettar reserverte.'),
    }),
})

const seo = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/seo' }),
  schema: () =>
    z.object({
      defaultSiteTitle: z.string().default('Furekunst'),
      defaultSiteDescription: z
        .string()
        .default(
          'Furekunst viser kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk.',
        ),
      homeSeoTitle: z
        .string()
        .default('Heim - Kunstnar Elisabeth Fure Schwarz | Furekunst'),
      homeSeoDescription: z
        .string()
        .default(
          'Elisabeth Fure Schwarz er kunstnaren bak Furekunst, med hovudfokus på akvarell. Utforsk galleriet med originale kunstverk og bestill personlege bilete.',
        ),
      gallerySeoTitle: z
        .string()
        .default('Galleri - Kunstverk til sals | Furekunst'),
      gallerySeoDescription: z
        .string()
        .default(
          'Utforsk kunstsamlinga til Elisabeth Fure Schwarz med måleri i akryl, akvarell, og olje, samt teikningar med tusj og penn.',
        ),
      contactSeoTitle: z.string().default('Kontakt | Furekunst'),
      contactSeoDescription: z
        .string()
        .default(
          'Ta kontakt med Elisabeth Fure Schwarz for spørsmål om kjøp av kunst eller bestilling av personlege bilete. Furekunst tilbyr originale måleri, akvarell og print.',
        ),
    }),
})

export const collections = { gallery, home, contact, settings, seo }


