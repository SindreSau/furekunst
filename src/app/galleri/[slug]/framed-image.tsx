'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { useState, useEffect } from 'react'

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
  const [isMounted, setIsMounted] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Use client-side detection for when component has mounted
  useEffect(() => {
    setIsMounted(true)

    // Define the check screen size function
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }

    // Run it immediately
    checkScreenSize()

    // Set up listener for resize events
    window.addEventListener('resize', checkScreenSize)

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Create a custom Zoom component that handles the responsive behavior
  const ResponsiveZoom = ({ children }: { children: React.ReactNode }) => {
    // If we've detected we're on a small screen, don't wrap with Zoom
    if (isMounted && isSmallScreen) {
      return <>{children}</>
    }

    // Otherwise use Zoom (also used during SSR before client detection)
    return <Zoom zoomMargin={100}>{children}</Zoom>
  }

  return (
    <ResponsiveZoom>
      {/* Outer wrapper to ensure proper overflow handling */}
      <div className="overflow-visible p-1">
        {/* Container div that holds everything */}
        <div
          className={cn(
            'relative overflow-visible transition-opacity duration-300',
            isMounted ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          {/* Static shadow divs outside the animation container */}
          <div
            className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-x-2 translate-y-2 overflow-visible bg-black/10 blur-md"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          ></div>
          <div
            className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-x-1 translate-y-1 overflow-visible bg-black/15 blur-sm"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          ></div>

          {/* Frame content with animation */}
          <motion.figure
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className={cn(
              'relative border-6 border-slate-800',
              'shadow-[5px_5px_4px_0px_rgba(0,0,0,0.2)]',
            )}
          >
            {/* Frame inner shadow - top edge */}
            <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-1 bg-gradient-to-b from-black/30 to-transparent"></div>

            {/* Frame inner shadow - left edge */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-1 bg-gradient-to-r from-black/30 to-transparent"></div>

            <div
              className={cn(
                'shadow-[3px_3px_2px_0px_rgba(0,0,0,0.15)]',
                hasPassepartout ? 'relative bg-white p-3' : '',
              )}
            >
              {hasPassepartout && (
                <>
                  {/* Passepartout inner shadow - top edge */}
                  <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 h-1 bg-gradient-to-b from-black/10 to-transparent"></div>

                  {/* Passepartout inner shadow - left edge */}
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
                onLoad={() => setIsLoaded(true)}
                className={cn(
                  'h-auto w-full object-contain transition-opacity duration-500',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          </motion.figure>
        </div>
      </div>
    </ResponsiveZoom>
  )
}
