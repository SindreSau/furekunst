import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination'

export default function PaginationComponent({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  return (
    <div className="flex justify-center my-8">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={`/galleri?page=${currentPage - 1}`} />
            </PaginationItem>
          )}

          {/* Display first page */}
          {currentPage > 2 && (
            <PaginationItem>
              <PaginationLink href="/galleri">1</PaginationLink>
            </PaginationItem>
          )}

          {/* Ellipsis if needed */}
          {currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Previous page if not first */}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink href={`/galleri?page=${currentPage - 1}`}>
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Current page */}
          <PaginationItem>
            <PaginationLink href={`/galleri?page=${currentPage}`} isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          {/* Next page if not last */}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink href={`/galleri?page=${currentPage + 1}`}>
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Ellipsis if needed */}
          {currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Last page if not current or next */}
          {currentPage < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink href={`/galleri?page=${totalPages}`}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext href={`/galleri?page=${currentPage + 1}`} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  )
}
