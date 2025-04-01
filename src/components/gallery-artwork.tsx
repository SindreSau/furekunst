'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { GalleryPostEntry } from '@/types/gallery-post.types'

export function GalleryArtwork({
  post,
  index,
}: {
  post: GalleryPostEntry
  index: number
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  const imageUrl = `https:${post.fields.image.fields.file.url}?w=700&h=700`
  const width = post.fields.image.fields.file.details.image?.width || 800
  const height = post.fields.image.fields.file.details.image?.height || 600

  // Create a slug from the title
  const slug = post.fields.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px 30px 0px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.025,
      }}
    >
      <Link href={`/galleri/${slug}`} className="group block">
        <div className="duration-300">
          <div className="relative">
            {/* Shadow layers */}
            <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-x-4 translate-y-4 bg-black/10 blur-md transition-transform duration-300 group-hover:translate-y-5"></div>
            <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-x-2 translate-y-2 bg-black/15 blur-sm transition-transform duration-300 group-hover:translate-y-3"></div>

            {/* Loading spinner shown when image isn't loaded */}
            {!isLoaded && (
              <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-gray-100"></div>
            )}
            <motion.figure
              className={cn(
                'relative border-[6px] border-slate-800',
                'shadow-[5px_5px_4px_0px_rgba(0,0,0,0.2)]',
              )}
              whileHover={{
                scale: 1.01,
                boxShadow: '6px 6px 6px 0px rgba(0,0,0,0.25)',
              }}
            >
              {/* Frame inner shadow - top edge only */}
              <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-1 bg-gradient-to-b from-black/30 to-transparent"></div>

              {/* Frame inner shadow - left edge only */}
              <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-1 bg-gradient-to-r from-black/30 to-transparent"></div>

              <div
                className={cn(
                  'shadow-[3px_3px_2px_0px_rgba(0,250,0,0.15)]',
                  post.fields.passepartout ? 'relative bg-white p-3' : '',
                )}
              >
                {post.fields.passepartout && (
                  <>
                    {/* Passepartout inner shadow - top edge only */}
                    <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 h-1 bg-gradient-to-b from-black/10 to-transparent"></div>

                    {/* Passepartout inner shadow - left edge only */}
                    <div className="pointer-events-none absolute top-3 bottom-3 left-3 z-10 w-1 bg-gradient-to-r from-black/10 to-transparent"></div>
                  </>
                )}

                <Image
                  src={imageUrl}
                  alt={post.fields.title}
                  width={width}
                  height={height}
                  quality={55}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  priority={index < 6}
                  onLoad={() => setIsLoaded(true)}
                  className={cn(
                    'h-auto w-full object-cover',
                    !isLoaded && 'opacity-0',
                  )}
                />
              </div>
            </motion.figure>
          </div>
          <div className="flex items-center justify-between p-3">
            <h2 className="mt-1 text-xl font-medium">{post.fields.title}</h2>
            {post.fields.type && (
              <p className="bg-primary-foreground/50 text-primary/80 font-didot rounded-sm px-2 text-sm md:text-[0.9125rem]">
                {post.fields.type}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
