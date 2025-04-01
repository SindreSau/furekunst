import { getGalleryPosts } from '@/lib/contentful-api'
import ClientGalleryPage from './client-gallery'
import PaginationComponent from '@/components/pagination-component'
import { getMetadata } from '@/lib/metadata'

export const revalidate = 3600

export async function generateMetadata() {
  return getMetadata({
    title: 'Galleri',
    description:
      'Utforsk min kunstsamling med maleri i akryl, akvarell, og olje, samt tegninger med tusj og penn.',
    path: 'galleri',
    ogImage: '/galleri/og-image.jpeg',
    twitterImage: '/galleri/twitter.jpeg',
    additionalKeywords:
      'kunstgalleri, Furekunst galleri, bilder til salgs, kjøp kunst, Elisabeth Fure Schwarz kunst',
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
      <h1 className="mb-6 text-3xl font-bold">Galleri</h1>
      <ClientGalleryPage posts={currentPosts} />
      <PaginationComponent currentPage={currentPage} totalPages={totalPages} />
    </>
  )
}
