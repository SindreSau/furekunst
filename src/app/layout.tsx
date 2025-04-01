import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { didot } from '@/lib/fonts'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Analytics } from '@vercel/analytics/react'

// You might want to add a custom font for the Didot font that was used in your Astro site
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  description:
    'Furekunst viser kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk. Her kan du sjå gjennom galleriet, og ta kontakt ved interesse for kjøp eller tinging av personlege bilete.',
  keywords: [
    'Kunst',
    'Elisabeth',
    'Fure',
    'Schwarz',
    'Elisabeth Fure',
    'Elisabeth kunst',
    'Fure kunst',
    'Elisabeth Fure Schwarz',
    'Elisabeth Fure kunstnar',
    'måleri',
    'akvarell',
    'akryl',
    'kunstgalleri',
    'bilete',
    'norsk kunst',
    'norsk kunstnar',
    'original kunst',
    'portrett',
    'kjøp kunst',
    'kunstutstilling',
    'malerikunst',
  ],
  authors: [{ name: 'Sindre Sauarlia' }],
  openGraph: {
    type: 'website',
    locale: 'nn_NO',
    url: process.env.DOMAIN || 'https://furekunst.no',
    title: 'Furekunst - Elisabeth Fure Schwarz Kunstgalleri',
    description:
      'Furekunst viser kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk. Her kan du sjå gjennom galleriet, og ta kontakt ved interesse for kjøp eller tinging av personlege bilete.',
    images: [{ url: '/lazydogs.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furekunst - Elisabeth Fure Schwarz Kunstgalleri',
    description:
      'Furekunst viser kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk. Her kan du sjå gjennom galleriet, og ta kontakt ved interesse for kjøp eller tinging av personlege bilete.',
    images: [{ url: '/lazydogs.jpg' }],
  },
  alternates: {
    canonical: process.env.DOMAIN || 'https://furekunst.no',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Elisabeth Fure Schwarz',
  jobTitle: 'Kunstnar',
  url: 'https://furekunst.no',
  sameAs: [
    'https://www.instagram.com/fure.kunst',
    'https://www.facebook.com/fure.kunst/',
  ],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'CreativeWork',
      name: 'Måleri og kunstbilete',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="light" lang="nn">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${didot.variable} font-body text-primary flex min-h-screen flex-col antialiased`}
      >
        <Header />
        <main
          id="innhold"
          className="container mx-auto mt-8 max-w-7xl flex-grow"
        >
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
