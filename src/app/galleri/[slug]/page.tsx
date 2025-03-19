import { notFound } from 'next/navigation'
import Image from 'next/image'
import {
  getGalleryPosts,
  getGalleryPostBySlug,
  titleToSlug,
} from '@/lib/contentful-api'
import { ArtworkDetails } from './artwork-details'

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
    return {
      title: 'Artwork Not Found',
      description: 'The requested artwork could not be found.',
      metadataBase: new URL(
        `https://furekunst.no/galleri/${resolvedParams.slug}`,
      ),
    }
  }

  return {
    title: `${artwork.fields.title} | Furekunst`,
    description:
      artwork.fields.description || 'Artwork by Elisabeth Fure Schwarz',
  }
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
    <div className="container mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image container */}
        <div className="relative">
          <div
            className={`relative border-2 border-black ${fields.passepartout ? 'bg-gray-50 p-4' : 'p-0'} shadow-md`}
          >
            <Image
              src={imageUrl}
              alt={fields.title}
              width={imageWidth}
              height={imageHeight}
              priority
              quality={85}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* Details container */}
        <ArtworkDetails artwork={artwork} />
      </div>
    </div>
  )
}
