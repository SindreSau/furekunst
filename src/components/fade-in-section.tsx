'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'

interface FadeInSectionProps {
  children: ReactNode
  delay?: number
  className?: string
  observeScroll?: boolean // Control whether to use the IntersectionObserver
  initiallyVisible?: boolean // New prop to force fade-in on mount
}

export const FadeInSection = ({
  children,
  delay = 0,
  className = '',
  observeScroll = true,
  initiallyVisible = false,
}: FadeInSectionProps) => {
  // Always start as hidden so the animation can occur
  const [isVisible, setVisible] = useState<boolean>(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Always allow the image to load even if the animation delays overall visibility.
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'

    // If we should show immediately (but still animate), schedule the fade-in.
    if (initiallyVisible || !observeScroll) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 10) // slight delay to allow the browser to paint the initial state
      return () => clearTimeout(timer)
    } else if (domRef.current) {
      const currentRef = domRef.current
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.unobserve(currentRef)
        }
      })
      observer.observe(currentRef)
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef)
        }
      }
    }
  }, [observeScroll, initiallyVisible])

  return (
    <div
      ref={domRef}
      className={`${className} transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-[0.01]'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        minHeight: isVisible ? undefined : '10px',
      }}
    >
      {children}
    </div>
  )
}
