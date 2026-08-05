import type { LiveLoader } from 'astro/loaders'
import type { LiveDataCollection, LiveDataEntry } from 'astro'
import { createContentfulClient } from '../lib/contentful'
import { titleToSlug } from '../lib/slug'
import { TtlCache } from '../lib/ttl-cache'
import type { GalleryPostData } from '../lib/gallery'

// Loose shapes for the raw Contentful responses (the SDK's generated types
// are too strict for the guard rails we need around broken entries).
interface ContentfulAsset {
  fields?: {
    file?: {
      url?: string
      details?: {
        image?: { width?: number; height?: number }
      }
    }
  }
}

interface SizeAndPriceEntry {
  fields: {
    size?: string
    price?: number
  }
}

interface RawGalleryPost {
  sys: {
    id: string
    createdAt?: string
    updatedAt?: string
  }
  fields: {
    title?: string
    description?: string
    type?: string
    size?: string
    price?: number
    sizeAndPrice?: SizeAndPriceEntry[]
    passepartout?: boolean
    image?: ContentfulAsset
  }
}

/**
 * Live loader for `galleryPost` entries (FK-018). Runs at request time
 * instead of build time: `loadCollection` serves the gallery pages and home,
 * `loadEntry` a single artwork. Dev/preview mode uses the preview API (drafts
 * visible locally); production uses the delivery API via the client factory.
 *
 *  - `include: 2` resolves linked sizeAndPrice entries.
 *  - `order: '-sys.publishedAt'` makes gallery order latest-first.
 *  - B1: entries whose image asset has no usable `file.url` are skipped with a
 *    warning instead of breaking a page.
 *  - Every entry carries a per-entry cacheHint (tags + lastModified) and the
 *    collection a merged one — pages apply these to Astro.cache.
 *  - Never throws: failures are returned as `{ error }`.
 *  - The collection result is cached in memory for 60 s (see below).
 */
function transformRawPost(
  raw: RawGalleryPost,
): LiveDataEntry<GalleryPostData> | null {
  const id = raw.sys.id
  const title = raw.fields.title ?? ''
  const imageUrl = raw.fields.image?.fields?.file?.url

  if (!imageUrl) {
    // B1: never let a CMS entry with a broken image reach a page.
    console.warn(
      `Skipping gallery post "${title || id}" – image asset has no file.url`,
    )
    return null
  }

  const imageDetails = raw.fields.image?.fields?.file?.details?.image

  return {
    id,
    data: {
      title,
      slug: titleToSlug(title),
      description: raw.fields.description ?? '',
      type: (raw.fields.type?.toLowerCase() ?? 'original') as
        | 'original'
        | 'print',
      size: raw.fields.size,
      price: raw.fields.price,
      sizeAndPrice: (raw.fields.sizeAndPrice ?? []).map(sp => ({
        size: sp.fields.size ?? '',
        price: sp.fields.price ?? 0,
      })),
      passepartout: raw.fields.passepartout ?? false,
      image: {
        url: `https:${imageUrl}`,
        width: imageDetails?.width ?? 800,
        height: imageDetails?.height ?? 600,
      },
    },
    cacheHint: {
      tags: ['gallery-posts', `post-${id}`],
      lastModified: new Date(
        raw.sys.updatedAt ?? raw.sys.createdAt ?? Date.now(),
      ),
    },
  }
}

// Module-level in-memory cache for the collection (a TtlCache, see
// src/lib/ttl-cache.ts). `getEntries` costs one Contentful round-trip
// (~150-250 ms), and every gallery-data request — index, filter pages,
// pagination, home, detail lookup, sitemap — funnels through it, so this
// single cache covers them all. The TTL bounds staleness at 60 s. The cache is
// per server instance: each Vercel lambda keeps its own, so ISR tags
// (Astro.cache / cacheHint) remain the cross-instance invalidation mechanism
// for finished HTML. Set only on success (see fetchCollection). Cached entries
// are treated as read-only and shared across concurrent requests — nothing in
// the render path mutates entry.data (GalleryPost, ArtworkDetails, priceHint,
// getGalleryPage and the detail/home pages all read only), so no defensive
// clone is needed.
const COLLECTION_TTL_MS = 60_000
const collectionCache = new TtlCache<LiveDataCollection<GalleryPostData>>(
  COLLECTION_TTL_MS,
)

export function contentfulGalleryLiveLoader(): LiveLoader<
  GalleryPostData,
  { id: string }
> {
  // Shared by loadCollection and loadEntry: one cached Contentful fetch.
  const fetchCollection = async (): Promise<
    LiveDataCollection<GalleryPostData> | { error: Error }
  > => {
    const cached = collectionCache.get()
    if (cached) {
      return {
        entries: cached.entries,
        cacheHint: cached.cacheHint,
      }
    }
    const client = createContentfulClient()
    try {
      const response = await client.getEntries({
        content_type: 'galleryPost',
        include: 2,
        // `-sys.publishedAt` sorts latest-first (FK-018). The SDK's order
        // union has no `sys.publishedAt` key — cast; the value is preserved.
        order: ['-sys.publishedAt'] as unknown as never[],
      })
      const rawItems = response.items as unknown as RawGalleryPost[]

      const entries: LiveDataEntry<GalleryPostData>[] = []
      let latestModified: Date | undefined
      for (const raw of rawItems) {
        const entry = transformRawPost(raw)
        if (!entry) continue
        entries.push(entry)
        const modified = entry.cacheHint?.lastModified
        if (modified && (!latestModified || modified > latestModified)) {
          latestModified = modified
        }
      }

      const cacheHint = {
        tags: ['gallery-posts'] as string[],
        ...(latestModified ? { lastModified: latestModified } : {}),
      }
      // Cache only on success: on error the catch below returns `{ error }`
      // and leaves the cache untouched — an error result is never cached, and
      // a stale-but-valid cache is deliberately not served silently.
      collectionCache.set({ entries, cacheHint })
      return { entries, cacheHint }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return {
    name: 'contentful-gallery-live',
    loadCollection: fetchCollection,
    loadEntry: async ({ filter }) => {
      // Prefer the cached collection: any id that reaches this loader is a
      // member of the published set, so the lookup is free when the cache is
      // warm (the [slug] page loads the collection and finds by slug).
      const collection = await fetchCollection()
      if (!('error' in collection)) {
        const found = collection.entries.find(entry => entry.id === filter.id)
        if (found) return found
      }
      // Not in the collection (or the collection fetch failed): fall back to
      // a direct entry fetch — never synthesize an entry from stale data.
      const client = createContentfulClient()
      try {
        const response = await client.getEntry(filter.id, { include: 2 })
        const raw = response as unknown as RawGalleryPost
        const entry = transformRawPost(raw)
        return (
          entry ?? {
            error: new Error(`Gallery post ${filter.id} has no usable image`),
          }
        )
      } catch (error) {
        return { error: error as Error }
      }
    },
  }
}
