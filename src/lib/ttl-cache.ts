/**
 * Tiny in-memory TTL cache for the gallery loader (contentful-gallery-live).
 * Pulled out of the loader so the caching semantics can be unit-tested without
 * a Contentful client or a browser. `get()` returns the cached value or null
 * when missing/expired; `set()` stamps the current time; `clear()` drops the
 * value. The value is stored verbatim (no clone) — callers treat it as
 * read-only.
 */
export class TtlCache<T> {
  private readonly ttlMs: number
  private value: T | null = null
  private at = 0

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs
  }

  get(): T | null {
    if (this.value === null || Date.now() - this.at >= this.ttlMs) return null
    return this.value
  }

  set(value: T): void {
    this.value = value
    this.at = Date.now()
  }

  clear(): void {
    this.value = null
    this.at = 0
  }
}
