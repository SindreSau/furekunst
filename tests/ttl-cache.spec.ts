// Unit tests for the TTL cache used by the gallery loader
// (src/lib/ttl-cache.ts → src/loaders/contentful-gallery-live.ts).
//
// The loader itself runs SSR against a Contentful client + env credentials, so
// it cannot be exercised from a browser test; this spec covers the cache
// semantics (TTL expiry, overwrite, clear, object identity) node-side instead.
// No `page` fixture — plain test() bodies run under every project without
// launching a browser and without a Contentful connection.
//
// Deterministic by construction: expiry sleeps use 2x the TTL (40 ms → 80 ms),
// so there is no wall-clock race even on a busy machine.
//
// Run: pnpm exec playwright test tests/ttl-cache.spec.ts

import { test, expect } from '@playwright/test'
import { TtlCache } from '../src/lib/ttl-cache'

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms))

test('returns the cached value while it is fresh', () => {
  const cache = new TtlCache<string>(1_000)
  expect(cache.get()).toBeNull()
  cache.set('value')
  expect(cache.get()).toBe('value')
})

test('returns null once the TTL has expired', async () => {
  const cache = new TtlCache<string>(40)
  cache.set('value')
  await delay(80)
  expect(cache.get()).toBeNull()
})

test('set overwrites the previous value', () => {
  const cache = new TtlCache<string>(1_000)
  cache.set('first')
  cache.set('second')
  expect(cache.get()).toBe('second')
})

test('a value set after expiry is fresh again', async () => {
  const cache = new TtlCache<string>(40)
  cache.set('first')
  await delay(80)
  expect(cache.get()).toBeNull()
  cache.set('second')
  expect(cache.get()).toBe('second')
})

test('clear drops the value immediately', () => {
  const cache = new TtlCache<string>(1_000)
  cache.set('value')
  cache.clear()
  expect(cache.get()).toBeNull()
})

test('stores object values and returns the same reference (no clone)', () => {
  const cache = new TtlCache<{ n: number }>(1_000)
  const value = { n: 1 }
  cache.set(value)
  expect(cache.get()).toBe(value)
})
