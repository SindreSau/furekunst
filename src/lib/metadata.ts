// lib/metadata.ts
// This file contains your baseline metadata configuration
import type { GalleryPostEntry } from '@/types/gallery-post.types'
import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Furekunst',
  creator: 'Elisabeth Fure Schwarz',
  url: 'https://furekunst.no',
  baseDescription:
    'Her kan du sjå kunstverka mine og ta kontakt ved interesse for kjøp eller tinging av personlege bilete. Furekunst viser måleri, akvarell og teikningar av Elisabeth Fure Schwarz.',
  defaultLocale: 'nn_NO',
  twitterHandle: '@elisabethfure',
  ogImagePath: '/open-graph.jpeg',
  twitterImagePath: '/twitter.jpeg',
  authors: [
    {
      name: 'Sindre Sauarlia',
      url: 'https://github.com/sindresau',
    },
  ],
  keywords:
    'kunst, galleri, Furekunst, Elisabeth Fure Schwarz, Elisabeth Fure, Elisabeth kunst, Fure kunst, Elisabeth Fure kunstnar, måleri, akvarell, akryl, olje, print, kunstnar, bilete, bilete av dyr, portrett, naturbilete, norsk kunst, norsk kunstnar, kunstgalleri, kunstutstilling, kjøp kunst, original kunst, målerikunst, kunsthandverk, bestill kunst, personleg kunst',
}

interface MetadataParams {
  title?: string
  description?: string
  path?: string
  ogImage?: string
  twitterImage?: string
  additionalKeywords?: string
  type?: 'website' | 'article' | 'profile'
}

/**
 * Generates metadata for a page
 *
 * @param options - Customization options
 * @returns Complete metadata object
 *
 * @example
 * // For a dynamic page with an image from Contentful:
 * getMetadata({
 *   title: artwork.fields.title,
 *   description: artwork.fields.description,
 *   path: `galleri/${slug}`,
 *   ogImage: `https:${artwork.fields.image.fields.file.url}?w=1200&h=630&fit=fill`,
 *   type: 'article'
 * })
 */
export function getMetadata({
  title = 'Heim',
  description = siteConfig.baseDescription,
  path = '',
  ogImage = siteConfig.ogImagePath,
  twitterImage = siteConfig.twitterImagePath,
  additionalKeywords = '',
  type = 'website',
}: MetadataParams = {}): Metadata {
  const keywords = additionalKeywords
    ? `${siteConfig.keywords}, ${additionalKeywords}`
    : siteConfig.keywords

  const url = path ? `${siteConfig.url}/${path}` : siteConfig.url
  const fullTitle = `${title} | ${siteConfig.name}`

  // Ensure image paths are full URLs
  // For Contentful or other external images, they'll already start with http
  // For local images, prepend the base URL
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : siteConfig.url

  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${baseUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`

  const twitterImageUrl = twitterImage.startsWith('http')
    ? twitterImage
    : `${baseUrl}${twitterImage.startsWith('/') ? twitterImage : `/${twitterImage}`}`

  return {
    title: fullTitle,
    description: description,
    metadataBase: new URL(baseUrl),
    keywords: keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      title: fullTitle,
      description: description,
      url: url,
      images: [ogImageUrl],
      siteName: siteConfig.name,
      type: type,
      locale: siteConfig.defaultLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description,
      images: [twitterImageUrl],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Define the type for structured data
interface ArtworkStructuredData {
  '@context': string
  '@type': string
  name: string
  description: string
  artMedium: string
  artform: string
  image: string
  size?: string
  creator: {
    '@type': string
    name: string
    url: string
  }
  offers:
    | {
        '@type': string
        availability: string
        priceCurrency: string
        price: number | string
        description?: string
      }
    | Array<{
        '@type': string
        availability: string
        priceCurrency: string
        price: number | string
        description?: string
      }>
}

/**
 * Generates structured data for an artwork
 * @param artwork - The artwork data from Contentful
 * @returns Structured data object for the artwork
 */
export function getArtworkStructuredData(
  artwork: GalleryPostEntry,
): ArtworkStructuredData {
  // Basic structured data
  const structuredData: ArtworkStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.fields.title,
    description:
      artwork.fields.description || 'Kunstverk av Elisabeth Fure Schwarz',
    artMedium: artwork.fields.description?.split(' ')[0] || 'Måleri',
    artform: artwork.fields.type === 'original' ? 'Original' : 'Print',
    image: `https:${artwork.fields.image.fields.file.url}`,
    creator: {
      '@type': 'Person',
      name: 'Elisabeth Fure Schwarz',
      url: 'https://furekunst.no',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'NOK',
      price: artwork.fields.price || 'Ikke oppgitt',
    },
  }

  // Add size information if available
  if (artwork.fields.size) {
    structuredData.size = artwork.fields.size
  }

  // Handle different price structures
  if (artwork.fields.price) {
    // Single price (works for both original and print)
    structuredData.offers = {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'NOK',
      price: artwork.fields.price,
    }
  } else if (
    artwork.fields.sizeAndPrice &&
    artwork.fields.sizeAndPrice.length > 0
  ) {
    // Multiple offers for prints with different sizes
    const offers = artwork.fields.sizeAndPrice.map(item => ({
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'NOK',
      price: item.fields.price,
      description: `Storleik: ${item.fields.size}`,
    }))

    // Replace single offer with multiple offers
    structuredData.offers = offers.length === 1 ? offers[0] : offers
  }

  return structuredData
}

/**
 * Generates structured data for the artist
 * @returns Structured data object for the artist
 */
export function getArtistStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Elisabeth Fure Schwarz',
    jobTitle: 'Kunstnar',
    url: 'https://furekunst.no',
    sameAs: [
      'https://www.instagram.com/fure.kunst',
      'https://www.facebook.com/fure.kunst/',
    ],
  }
}
