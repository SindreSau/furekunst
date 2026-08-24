import type { ImageMetadata } from 'astro'

// Shared gallery post shape + filtering helper.
export interface GalleryPostData {
  title: string
  slug?: string
  description?: string
  type: 'original' | 'print'
  size?: string
  price?: number
  sizeAndPrice: { size: string; price: number }[]
  passepartout: boolean
  image: ImageMetadata
  createdAt?: string
  updatedAt?: string
}

export type GalleryFilter = 'all' | 'original' | 'print'
