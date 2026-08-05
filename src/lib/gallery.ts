// Shared gallery post shape + filtering helper (FK-024, now client-side).
// The data shape mirrors the zod schema in src/live.config.ts so every
// consumer (loader, components, pages) stays structurally compatible with the
// live collection without depending on generated `astro:content` types.
export interface GalleryPostData {
  title: string
  slug: string
  description: string
  type: 'original' | 'print'
  size?: string
  price?: number
  sizeAndPrice: { size: string; price: number }[]
  passepartout: boolean
  image?: { url: string; width: number; height: number }
}

export type GalleryFilter = 'all' | 'original' | 'print'
