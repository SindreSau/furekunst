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
  title: {
    template: '%s | Furekunst',
    default: 'Furekunst',
  },
  description:
    'Furekunst viser kunstner Elisabeth Fure Schwarz sine malerier. Her kan du se gjennom galleriet, og ta kontakt ved interesse for kjøp.',
  keywords: [
    'Kunst',
    'Elisabeth',
    'Fure',
    'Schwarz',
    'maleri',
    'akvarell',
    'akryl',
    'galleri',
  ],
  authors: [{ name: 'Sindre Sauarlia' }],
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    url: process.env.DOMAIN || 'https://furekunst.no',
    title: 'Furekunst',
    description:
      'Furekunst viser kunstner Elisabeth Fure Schwarz sine malerier. Her kan du se gjennom galleriet, og ta kontakt ved interesse for kjøp.',
    images: [{ url: '/lazydogs.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furekunst',
    description:
      'Furekunst viser kunstner Elisabeth Fure Schwarz sine malerier. Her kan du se gjennom galleriet, og ta kontakt ved interesse for kjøp.',
    images: [{ url: '/lazydogs.jpg' }],
  },
  alternates: {
    canonical: process.env.DOMAIN || 'https://furekunst.no',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="light" lang="nb">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${didot.variable} flex flex-col min-h-screen font-body text-primary antialiased`}
      >
        <Header />
        <main
          id="innhold"
          className="flex-grow container mx-auto mt-8 max-w-7xl"
        >
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
