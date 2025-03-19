import { getGalleryPosts } from '@/lib/contentful-api'
import ClientGalleryPage from './client-gallery'
import PaginationComponent from '@/components/pagination-component'

export const revalidate = 3600

export async function generateMetadata() {
  return {
    title: 'Galleri | Furekunst',
    description: "Elisabeth Fure Schwarz's kunstgalleri",
    metadataBase: new URL('https://furekunst.no/galleri'),
  }
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const pageParam = (await searchParams)?.page
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
      <h1 className="text-3xl font-bold mb-6">Galleri</h1>
      <ClientGalleryPage posts={currentPosts} />
      <PaginationComponent currentPage={currentPage} totalPages={totalPages} />
    </>
  )
}
