// components/header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Page {
  title: string
  url: string
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const pages: Page[] = [
    { title: 'Heim', url: '/' },
    { title: 'Galleri', url: '/galleri' },
    { title: 'Kontakt', url: '/kontakt' },
  ]

  const groupPath = '/' + pathname.split('/')[1]

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen)
    document.body.style.overflow = !isMenuOpen ? 'hidden' : ''
    document.body.style.height = !isMenuOpen ? '100vh' : ''
  }

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
        document.body.style.overflow = ''
        document.body.style.height = ''
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])

  useEffect(() => {
    document.body.style.overflow = ''
    document.body.style.height = ''
  }, [pathname])

  return (
    <header className="z-50 w-full">
      <div className="container mx-auto max-w-7xl py-2">
        {/* Skip to main content */}
        <a href="#innhold" className="sr-only focus:not-sr-only">
          Hopp til hovedinnhold
        </a>
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="font-didot text-xl tracking-widest text-gray-800"
          >
            ELISABETH FURE
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="relative z-50 cursor-pointer px-2 text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
          >
            <span className="sr-only">Open main menu</span>
            <div className="relative h-6 w-6">
              <span
                className={`absolute top-0 left-0 h-0.5 w-6 transform bg-current transition duration-300 ease-in-out ${
                  isMenuOpen ? 'translate-y-2.5 rotate-45' : ''
                }`}
              ></span>
              <span
                className={`absolute top-2.5 left-0 h-0.5 w-6 transform bg-current transition duration-300 ease-in-out ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-6 transform bg-current transition duration-300 ease-in-out ${
                  isMenuOpen ? '-translate-y-3 -rotate-45' : ''
                }`}
              ></span>
            </div>
          </button>

          {/* Desktop menu */}
          <nav className="hidden space-x-4 md:flex">
            {pages.map(page => (
              <Link
                key={page.url}
                href={page.url}
                className={`hover:text-gray-900 ${
                  groupPath === page.url
                    ? 'border-b-2 text-gray-900'
                    : 'text-gray-600'
                }`}
                aria-current={pathname === page.url ? 'page' : undefined}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Gray divider - container width instead of full width */}
        <div className="h-px w-full bg-gray-300"></div>
      </div>

      {/* Mobile menu */}
      <nav
        className={`bg-background fixed top-[64px] right-0 bottom-0 left-0 z-40 transform pt-6 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto transition-transform duration-75 ease-in-out md:hidden`}
      >
        <div className="flex h-full flex-col items-center justify-start space-y-8 pt-8 text-2xl shadow-md">
          {pages.map((page, index) => (
            <div
              key={page.url}
              className={`transition-all duration-500 ease-out ${
                isMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
              style={{
                transitionDelay: isMenuOpen ? `${index * 120}ms` : '0ms',
              }}
            >
              <Link
                href={page.url}
                className={`text-gray-600 hover:text-gray-800 ${
                  groupPath === page.url
                    ? 'border-b-2 border-gray-200 text-[1.58rem] text-gray-800'
                    : ''
                }`}
                aria-current={pathname === page.url ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {page.title}
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
