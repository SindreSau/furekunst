'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface FramedImageProps {
  imageUrl: string
  alt: string
  width: number
  height: number
  hasPassepartout?: boolean
}

export function FramedImage({
  imageUrl,
  alt,
  width,
  height,
  hasPassepartout = false,
}: FramedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Pre-load the image
  useEffect(() => {
    const img = new window.Image()
    img.src = imageUrl
    img.onload = () => {
      setImageLoading(false)
      setTimeout(() => setIsLoaded(true), 50)
    }
  }, [imageUrl])

  // Show loading indicator while image is loading
  if (imageLoading) {
    // Calculate aspect ratio based on the image dimensions
    const aspectRatio = width / height

    return (
      <div
        className="w-full animate-pulse rounded bg-gray-100 blur-sm"
        style={{
          aspectRatio: aspectRatio,
          height: 'auto',
          maxHeight: `${height}px`,
          maxWidth: `${width}px`,
        }}
      ></div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        isLoaded ? 'opacity-100' : 'opacity-0',
        'transition-opacity duration-300',
      )}
    >
      {/* Shadow layers */}
      <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-x-4 translate-y-4 bg-black/10 blur-md"></div>
      <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-x-2 translate-y-2 bg-black/15 blur-sm"></div>

      <figure
        className={cn(
          'relative border-6 border-slate-800',
          'shadow-[5px_5px_4px_0px_rgba(0,0,0,0.2)]',
        )}
      >
        {/* Frame inner shadow - top edge only */}
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-1 bg-gradient-to-b from-black/30 to-transparent"></div>

        {/* Frame inner shadow - left edge only */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-1 bg-gradient-to-r from-black/30 to-transparent"></div>

        <div
          className={cn(
            'shadow-[3px_3px_2px_0px_rgba(0,250,0,0.15)]',
            hasPassepartout ? 'relative bg-white p-3' : '',
          )}
        >
          {hasPassepartout && (
            <>
              {/* Passepartout inner shadow - top edge only */}
              <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 h-1 bg-gradient-to-b from-black/10 to-transparent"></div>

              {/* Passepartout inner shadow - left edge only */}
              <div className="pointer-events-none absolute top-3 bottom-3 left-3 z-10 w-1 bg-gradient-to-r from-black/10 to-transparent"></div>
            </>
          )}

          <Image
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            priority
            quality={85}
            className="h-auto w-full object-contain"
          />
        </div>
      </figure>
    </motion.div>
  )
}
