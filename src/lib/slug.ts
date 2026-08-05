// Shared slug utility for gallery posts (FK-006).
// Slugs are derived from the Contentful title; trailing whitespace is
// trimmed first so "Juleførebuingar " no longer yields "julefrebuingar-".
export function titleToSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}
