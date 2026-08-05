// Centralized site metadata + OG/canonical helpers (FK-027).
// Plain TS — no framework types, usable from any Astro component.

export const siteConfig = {
  name: 'Furekunst',
  url: 'https://furekunst.no',
  defaultOgImage: '/open-graph.jpeg',
  ogImageSize: { width: 1200, height: 630 },
  twitterHandle: '@fure.kunst',
  locale: 'nn_NO',
  description:
    'Furekunst viser kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk.',
}

/** Resolve a relative or absolute path to an absolute OG image URL. */
export function ogImageUrl(path = siteConfig.defaultOgImage): string {
  return new URL(path, siteConfig.url).toString()
}

/** Build an absolute canonical URL from a pathname (e.g. '/galleri/hjort'). */
export function canonicalUrl(path: string): string {
  return new URL(path, siteConfig.url).toString()
}

export interface OgTagsOptions {
  title: string
  description: string
  url: string
  type?: string
  ogImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
}

export type SeoMetaTag = { attrs: Record<string, string> }

/**
 * Renderable OG + Twitter meta tags for the layout <head>. The layout maps
 * each entry to a <meta> element.
 */
export function renderOgTags({
  title,
  description,
  url,
  type = 'website',
  ogImage = siteConfig.defaultOgImage,
  ogImageWidth = siteConfig.ogImageSize.width,
  ogImageHeight = siteConfig.ogImageSize.height,
}: OgTagsOptions): SeoMetaTag[] {
  const image = ogImageUrl(ogImage)
  return [
    { attrs: { property: 'og:title', content: title } },
    { attrs: { property: 'og:description', content: description } },
    { attrs: { property: 'og:type', content: type } },
    { attrs: { property: 'og:url', content: url } },
    { attrs: { property: 'og:image', content: image } },
    {
      attrs: { property: 'og:image:width', content: String(ogImageWidth) },
    },
    {
      attrs: { property: 'og:image:height', content: String(ogImageHeight) },
    },
    { attrs: { property: 'og:locale', content: siteConfig.locale } },
    { attrs: { property: 'og:site_name', content: siteConfig.name } },
    { attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { attrs: { name: 'twitter:title', content: title } },
    { attrs: { name: 'twitter:description', content: description } },
    { attrs: { name: 'twitter:image', content: image } },
    { attrs: { name: 'twitter:creator', content: siteConfig.twitterHandle } },
  ]
}
