import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['images.ctfassets.net'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week cache
    formats: ['image/avif', 'image/webp'], // Enable next-gen formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Responsive sizes
    // Contentful image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 60 * 60, // 1 hour (in seconds)
      static: 60 * 60 * 24, // 24 hours (in seconds)
    },
  },
}

export default nextConfig
