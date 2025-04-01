// components/footer.tsx
'use client'

import { CONSTANTS } from '@/lib/constants'
import { Info } from 'lucide-react'
import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-pastel-dark mt-12 pt-8 pb-6 text-gray-700 lg:mt-10 lg:py-4">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="order-1 flex flex-col-reverse items-center justify-between gap-3 md:flex-row">
          <div className="md:mb-0">
            <p className="text-sm">
              &copy; {currentYear} Furekunst. All rights reserved.
            </p>
          </div>

          {/* <Link
            href="/om-siden"
            className="focus:ring-opacity-50 mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-all duration-300 hover:underline focus:ring-2 md:mt-0"
          >
            <Info size={14} />
            Om nettsiden
          </Link> */}

          <div className="order-2 flex space-x-4 md:order-3">
            <Link
              href={`mailto:${CONSTANTS.email}`}
              className="transition-colors duration-300 hover:text-gray-800"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="sr-only">Email</span>
            </Link>

            <Link
              href={CONSTANTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-gray-800"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="sr-only">Instagram</span>
            </Link>

            <Link
              href={CONSTANTS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-gray-800"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
