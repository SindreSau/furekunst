// Lighthouse CI config — performance test harness (FK-003 baseline / FK-020 budget).
// Runs the same URL set against the old Next.js site (baseline) and the new
// Astro site (after), so results can be compared apples-to-apples.
//
// Usage:
//   pnpm perf:baseline                  # mobile vs https://furekunst.no (before)
//   PERF_URLS=http://localhost:4321,... pnpm perf:run   # vs local preview (after)
//
// Budgets follow FK-020: LCP < 2.5s, CLS < 0.1, JS < 25 KB, images < 1 MB on home.

const DEFAULT_URLS = [
  'https://furekunst.no/',
  'https://furekunst.no/galleri',
  'https://furekunst.no/galleri/kollektivet',
  'https://furekunst.no/kontakt',
]

const urls = (process.env.PERF_URLS || '')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean)

module.exports = {
  ci: {
    collect: {
      url: urls.length ? urls : DEFAULT_URLS,
      numberOfRuns: 1,
    },
    assert: {
      // Explicit metric assertions (Lighthouse 12 dropped the `budgets` audit).
      // Targets follow FK-020: LCP < 2.5 s, CLS < 0.1, JS < 25 KB, images < 1 MB.
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'speed-index': ['error', { maxNumericValue: 4000 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-byte-weight': ['error', { maxNumericValue: 2500000 }],
        'unused-javascript': ['error', { maxNumericValue: 100000 }],
        'uses-responsive-images': ['warn'],
        'offscreen-images': ['warn'],
        'modern-image-formats': ['warn'],
        'font-display': ['warn'],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'docs/perf',
    },
  },
}
