import { getGalleryPosts } from '@/lib/contentful-api'
import ClientGalleryPage from './client-gallery'
import PaginationComponent from '@/components/pagination-component'
import { getMetadata } from '@/lib/metadata'
import { MousePointerClick } from 'lucide-react'

export const revalidate = 3600

export async function generateMetadata() {
  return getMetadata({
    title: 'Galleri - Kunstverk til sals',
    description:
      'Utforsk kunstsamlinga til Elisabeth Fure Schwarz med måleri i akryl, akvarell, og olje, samt teikningar med tusj og penn.',
    path: 'galleri',
    ogImage: '/galleri/og-image.jpeg',
    twitterImage: '/galleri/twitter.jpeg',
    additionalKeywords:
      'kunstgalleri, Furekunst galleri, Elisabeth Fure galleri, bilete til sals, kjøp kunst, Elisabeth Fure Schwarz kunst, original kunst, kunstutstilling, akvarell kunst, akryl måleri',
    type: 'website',
  })
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const pageParam = resolvedSearchParams.page
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1
  const postsPerPage = 12 // Adjust based on your preference

  const allPosts = await getGalleryPosts()

  // Calculate pagination info
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)

  // Get current page posts
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = allPosts.slice(startIndex, endIndex)

  return (
    <>
      <h1 className="mb-1">Galleri</h1>
      <p className="text-muted-foreground mb-4 flex items-center text-sm">
        Klikk gjerne på eit bilete for å sjå fleire detaljar
        <MousePointerClick className="ml-1 w-4 text-gray-500" />
      </p>

      <ClientGalleryPage posts={currentPosts} />
      <PaginationComponent currentPage={currentPage} totalPages={totalPages} />
    </>
  )
}
