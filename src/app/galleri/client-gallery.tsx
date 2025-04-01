'use client'
import { useState, useEffect } from 'react'
import { GalleryPostEntry } from '@/types/gallery-post.types'
import Masonry from 'react-masonry-css'
import { GalleryArtwork } from '@/components/gallery-artwork'

export default function ClientGalleryPage({
  posts,
}: {
  posts: GalleryPostEntry[]
}) {
  // Force immediate render
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="min-h-[200px]">
      <Masonry
        breakpointCols={{
          default: 3,
          1150: 2,
          640: 1,
        }}
        className="-ml-4 flex w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {posts.map((post, index) => (
          <GalleryArtwork key={post.sys.id} post={post} index={index} />
        ))}
      </Masonry>
    </div>
  )
}
