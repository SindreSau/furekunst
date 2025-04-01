'use client'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

export default function FadeImage(props: ImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden">
      <Image
        {...props}
        className={`${props.className || ''} transition-all duration-500 ease-out ${
          loaded ? 'blur-0' : 'blur-[1px]'
        }`}
        alt={props.alt || 'unknown image'}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  )
}
