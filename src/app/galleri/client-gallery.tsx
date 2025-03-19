'use client'
import { FadeInSection } from '@/components/fade-in-section'
import { GalleryPostEntry } from '@/types/gallery-post.types'
import Image from 'next/image'
import Link from 'next/link'
import Masonry from 'react-masonry-css'

export default function ClientGalleryPage({
  posts,
}: {
  posts: GalleryPostEntry[]
}) {
  return (
    <Masonry
      breakpointCols={{
        default: 3,
        1150: 2,
        640: 1,
      }}
      className="-ml-4 flex w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {posts.map((post, index) => {
        const imageUrl = `https:${post.fields.image.fields.file.url}?w=700&h=700`
        const width = post.fields.image.fields.file.details.image?.width || 800
        const height =
          post.fields.image.fields.file.details.image?.height || 600

        // Create a slug from the title
        const slug = post.fields.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')

        return (
          <FadeInSection
            key={post.sys.id}
            className="mb-4"
            delay={index * 50}
            observeScroll={false}
          >
            <Link href={`/galleri/${slug}`} className="group block">
              <div className="overflow-hidden duration-300">
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt={post.fields.title}
                    width={width}
                    height={height}
                    quality={85}
                    priority={index < 6}
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-center justify-between p-3">
                  <h2 className="mt-1 text-xl font-medium">
                    {post.fields.title}
                  </h2>
                  {post.fields.type && (
                    <p className="rounded-md bg-[#fafafa6c] px-2 text-sm text-gray-700">
                      {post.fields.type}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </FadeInSection>
        )
      })}
    </Masonry>
  )
}
