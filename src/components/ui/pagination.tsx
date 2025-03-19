import * as React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Base frame button styles to match your custom button - smaller size, no hover animations
const frameButtonStyles =
  'inline-block px-4 py-2 border-4 border-double border-gray-800 text-gray-800 font-serif font-medium cursor-pointer ring-offset-4'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="sidetal"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('', className)} {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  href: string
} & React.ComponentProps<'a'>

function PaginationLink({
  className,
  isActive,
  href,
  children,
  ...props
}: PaginationLinkProps) {
  // Apply frame button styling with modifications for pagination
  const linkStyles = cn(
    frameButtonStyles,
    // Make pagination number buttons smaller and more compact
    'px-3 py-1 text-center text-sm',
    // Adjust the active state to stand out
    isActive && 'bg-gray-800 text-white',
    className,
  )

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={linkStyles}
      {...props}
    >
      {children}
    </Link>
  )
}

function PaginationPrevious({
  className,
  href = '',
  ...props
}: Partial<PaginationLinkProps>) {
  return (
    <PaginationLink
      href={href}
      aria-label="Gå til forrige side"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      <ChevronLeftIcon className="mr-1 h-4 w-4" />
      <span>Forrige</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  href = '',
  ...props
}: Partial<PaginationLinkProps>) {
  return (
    <PaginationLink
      href={href}
      aria-label="Gå til neste side"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      <span>Neste</span>
      <ChevronRightIcon className="ml-1 h-4 w-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn('flex h-8 w-8 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="h-4 w-4" />
      <span className="sr-only">Fleire sider</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
