import { notFound } from 'next/navigation'
import {
  getGalleryPosts,
  getGalleryPostBySlug,
  titleToSlug,
} from '@/lib/contentful-api'
import { getMetadata } from '@/lib/metadata'
import { ArtworkDetails } from './artwork-details'
import { FramedImage } from './framed-image'

// Generate static params for all artwork pages
export async function generateStaticParams() {
  const posts = await getGalleryPosts()

  return posts.map(post => ({
    slug: titleToSlug(post.fields.title),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const artwork = await getGalleryPostBySlug(resolvedParams.slug)

  if (!artwork) {
    return getMetadata({
      title: 'Artwork Not Found',
      description: 'The requested artwork could not be found.',
      path: `galleri/${resolvedParams.slug}`,
    })
  }

  // Get the image URL from Contentful
  // Add image optimization parameters for OG images
  const imageUrl = `https:${artwork.fields.image.fields.file.url}?w=1200&h=630&fit=fill`

  return getMetadata({
    title: artwork.fields.title,
    description:
      artwork.fields.description || 'Artwork by Elisabeth Fure Schwarz',
    path: `galleri/${resolvedParams.slug}`,
    ogImage: imageUrl,
    twitterImage: imageUrl,
    additionalKeywords:
      `${artwork.fields.title} || ''}, ${artwork.fields.type || ''}`.trim(),
    type: 'article',
  })
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const artwork = await getGalleryPostBySlug(resolvedParams.slug)

  if (!artwork) {
    notFound()
  }

  const { fields } = artwork
  const imageUrl = `https:${fields.image.fields.file.url}?w=1500&h=1500`
  const imageWidth = fields.image.fields.file.details.image?.width || 800
  const imageHeight = fields.image.fields.file.details.image?.height || 600

  return (
    <div className="mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image container */}

        <FramedImage
          imageUrl={imageUrl}
          alt={fields.title}
          width={imageWidth}
          height={imageHeight}
          hasPassepartout={fields.passepartout}
        />

        {/* Details container */}
        <ArtworkDetails artwork={artwork} />
      </div>
    </div>
  )
}
