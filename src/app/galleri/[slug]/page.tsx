import Script from 'next/script'
import { notFound } from 'next/navigation'
import {
  getGalleryPosts,
  getGalleryPostBySlug,
  titleToSlug,
} from '@/lib/contentful-api'
import { getMetadata, getArtworkStructuredData } from '@/lib/metadata'
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
      title: 'Kunstverk ikkje funne',
      description: 'Kunstverket du leitar etter finst ikkje.',
      path: `galleri/${resolvedParams.slug}`,
    })
  }

  // Get the image URL from Contentful
  // Add image optimization parameters for OG images
  const imageUrl = `https:${artwork.fields.image.fields.file.url}?w=1200&h=630&fit=fill`

  // Price information for meta description
  let priceInfo = ''
  if (artwork.fields.type === 'original' && artwork.fields.price) {
    priceInfo = `Pris: kr ${artwork.fields.price},-`
  } else if (
    artwork.fields.type === 'print' &&
    artwork.fields.sizeAndPrice &&
    artwork.fields.sizeAndPrice.length > 0
  ) {
    const lowestPrice = Math.min(
      ...artwork.fields.sizeAndPrice.map(item => item.fields.price),
    )
    priceInfo = `Print tilgjengeleg frå kr ${lowestPrice},-`
  }

  // Size information
  let sizeInfo = ''
  if (artwork.fields.type === 'original' && artwork.fields.size) {
    sizeInfo = `Storleik: ${artwork.fields.size}.`
  }

  // Create a description with relevant artwork details
  const metaDescription = artwork.fields.description
    ? `${artwork.fields.title}: ${artwork.fields.description}. ${sizeInfo} ${priceInfo}`
    : `${artwork.fields.title} - ${artwork.fields.type === 'original' ? 'Original' : 'Print'} av Elisabeth Fure Schwarz. ${sizeInfo} ${priceInfo}`

  // Generate keywords based on artwork details
  const artworkKeywords = [
    artwork.fields.title,
    artwork.fields.type,
    `${artwork.fields.type === 'original' ? 'original måleri' : 'kunstprint'}`,
    artwork.fields.description?.split(' ').slice(0, 3).join(' ') || '',
    'Elisabeth Fure Schwarz kunstverk',
    'Furekunst',
    'kunst til sals',
  ]
    .filter(Boolean)
    .join(', ')

  return getMetadata({
    title: artwork.fields.title,
    description: metaDescription.trim(),
    path: `galleri/${resolvedParams.slug}`,
    ogImage: imageUrl,
    twitterImage: imageUrl,
    additionalKeywords: artworkKeywords,
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

  // Get structured data for this artwork
  const structuredData = getArtworkStructuredData(artwork)

  return (
    <>
      {/* Add structured data for this specific artwork */}
      <Script
        id="artwork-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
    </>
  )
}
