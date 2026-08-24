import type { GalleryPostData } from './gallery'

/**
 * One-line price hint for a gallery post (FK-024). Used by the gallery card,
 * the detail page meta description and the artwork detail view so all three
 * show the exact same string.
 */
export function priceHint(post: GalleryPostData): string | null {
  if (post.type === 'original' && post.price) {
    return `Pris: kr ${post.price},-`
  }
  if (post.type === 'print' && post.sizeAndPrice.length > 0) {
    const prices = post.sizeAndPrice
      .map(item => item.price)
      .filter(price => price > 0)
    if (prices.length === 0) {
      return 'Ikkje tilgjengeleg'
    }
    const min = Math.min(...prices)
    return `Print tilgjengeleg frå kr ${min},-`
  }
  return null
}
