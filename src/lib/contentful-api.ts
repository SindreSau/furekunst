// lib/contentful-api.ts
import { contentfulClient } from '@/lib/contentful'
import type { GalleryPostEntry } from '@/types/gallery-post.types'

/**
 * Fetches all gallery posts from Contentful
 * @returns Promise containing an array of gallery posts
 */
export async function getGalleryPosts(): Promise<GalleryPostEntry[]> {
  const response = await contentfulClient.getEntries({
    content_type: 'galleryPost',
  })

  // Type assertion to match our defined type structure
  return response.items as unknown as GalleryPostEntry[]
}

/**
 * Fetches a single gallery post by its ID
 * @param id The Contentful entry ID
 * @returns Promise containing the gallery post or null if not found
 */
export async function getGalleryPostById(
  id: string,
): Promise<GalleryPostEntry | null> {
  try {
    const response = await contentfulClient.getEntry(id)
    return response as unknown as GalleryPostEntry
  } catch (error) {
    // Entry not found or other error
    console.error('Error fetching gallery post:', error)
    return null
  }
}

/**
 * Fetches a gallery post by its slug (converted from title)
 * @param slug The URL-friendly slug
 * @returns Promise containing the gallery post or null if not found
 */
export async function getGalleryPostBySlug(
  slug: string,
): Promise<GalleryPostEntry | null> {
  // Get all posts (Contentful doesn't allow querying by transformed fields)
  const posts = await getGalleryPosts()

  // Find the post with the matching slug
  const post = posts.find(post => {
    const postSlug = post.fields.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')

    return postSlug === slug
  })

  return post || null
}

/**
 * Helper function to convert a title to a URL-friendly slug
 * @param title The title to convert
 * @returns A URL-friendly slug
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}
