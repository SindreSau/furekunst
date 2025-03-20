'use client'
import { GalleryPostEntry } from '@/types/gallery-post.types'
import Masonry from 'react-masonry-css'
import { GalleryArtwork } from '@/components/gallery-artwork'

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
      {posts.map((post, index) => (
        <GalleryArtwork key={post.sys.id} post={post} index={index} />
      ))}
    </Masonry>
  )
}
