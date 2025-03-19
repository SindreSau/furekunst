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
  params: { slug: string }
}) {
  const artwork = await getGalleryPostBySlug(params.slug)

  if (!artwork) {
    return {
      title: 'Artwork Not Found',
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
  params: { slug: string }
}) {
  const artwork = await getGalleryPostBySlug(params.slug)

  if (!artwork) {
    notFound()
  }

  const { fields } = artwork
  const imageUrl = `https:${fields.image.fields.file.url}?w=800&h=800`
  const imageWidth = fields.image.fields.file.details.image?.width || 800
  const imageHeight = fields.image.fields.file.details.image?.height || 600

  return (
    <div className="container mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image container */}
        <div className="relative">
          <div
            className={`
              relative 
              border-2 border-black 
              ${fields.passepartout ? 'p-4 bg-gray-50' : 'p-0'}
              shadow-md
            `}
          >
            <Image
              src={imageUrl}
              alt={fields.title}
              width={imageWidth}
              height={imageHeight}
              priority
              quality={65}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Details container */}
        <ArtworkDetails artwork={artwork} />
      </div>
    </div>
  )
}
