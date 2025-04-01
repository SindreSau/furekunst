// lib/metadata.js
// This file will contain your baseline metadata configuration

export const siteConfig = {
  name: 'Furekunst',
  creator: 'Elisabeth Fure Schwarz',
  url: 'https://furekunst.no',
  baseDescription:
    'Her kan du se kunstverkene mine og ta kontakt ved interesse for kjøp eller bestilling av personlige bilder.',
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
    'kunst, galleri, Furekunst, Elisabeth Fure Schwarz, maleri, akvarell, akryl, olje, print, kunstner, kunstnar, bilete, bilete av dyr, portrett, naturbilete',
}

/**
 * Generates metadata for a page
 *
 * @param {Object} options - Customization options
 * @param {string} options.title - Page-specific title (will be combined with site name)
 * @param {string} options.description - Page-specific description
 * @param {string} options.path - Path to append to base URL
 * @param {string} options.ogImage - Custom OG image path (overrides default)
 *                                   For external images (e.g. from Contentful), pass the full URL
 *                                   For local images, pass the path relative to the public directory
 * @param {string} options.twitterImage - Custom Twitter image path (overrides default)
 *                                        Works the same as ogImage
 * @param {string} options.additionalKeywords - Additional keywords to append to base keywords
 * @param {string} options.type - The type of page (default: 'website')
 * @returns {Object} - Complete metadata object
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
} = {}) {
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
  }
}
