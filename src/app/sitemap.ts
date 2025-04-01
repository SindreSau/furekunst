import type { MetadataRoute } from 'next'
import { getGalleryPosts, titleToSlug } from '@/lib/contentful-api'

// Cache the result for better performance in development
let cachedPosts: any[] | null = null

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all artworks to generate their URLs
  let allPosts

  if (cachedPosts) {
    allPosts = cachedPosts
  } else {
    allPosts = await getGalleryPosts()
    // Cache the result in development for faster reloads
    if (process.env.NODE_ENV === 'development') {
      cachedPosts = allPosts
    }
  }

  // Generate artwork URLs
  const artworkUrls = allPosts.map(post => {
    const slug = titleToSlug(post.fields.title)
    return {
      url: `https://furekunst.no/galleri/${slug}`,
      lastModified: new Date(post.sys.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  })

  // Static pages
  const staticPages = [
    {
      url: 'https://furekunst.no',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: 'https://furekunst.no/galleri',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://furekunst.no/kontakt',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Combine static and dynamic URLs
  return [...staticPages, ...artworkUrls]
}
