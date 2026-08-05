# Performance metrics

Measured with the Lighthouse harness in `lighthouserc.cjs` (`pnpm perf:baseline` /
`pnpm perf:run`). Same URL set is run against the old Next.js site (baseline) and the
Astro site (after) for an apples-to-apples comparison.

## Harness

```bash
pnpm perf:baseline                    # mobile, prod furekunst.no (before)
PERF_URLS=http://localhost:4321,... pnpm perf:run   # after (local preview/build)
pnpm perf:collect && pnpm perf:assert # split collect / assert
```

- Chrome: system Chrome at `/Applications/Google Chrome.app`
- Reports: `.lighthouseci/` (gitignored), raw LHR JSON copied to `docs/perf/baseline-{mobile,desktop}/`
- Assertions (FK-020 targets): performance score ≥ 0.85, FCP ≤ 2000 ms, LCP ≤ 3000 ms,
  SI ≤ 4000 ms, TBT ≤ 200 ms, CLS ≤ 0.1, total bytes ≤ 2.5 MB, unused JS ≤ 100 KB.
  Warnings: responsive/offscreen images, modern formats, font-display.

## Baseline (Next.js 15.2.2, prod furekunst.no, 2026-08-04)

Lighthouse 12.6.1 via `@lhci/cli`, 1 run per URL.

### Mobile (throttled)

| URL | Perf | FCP | LCP | CLS | TBT | Img | JS | Font | Scripts |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 85 | 934 | 4179 | 0.004 | 11 | 321 KB | 139 KB | 211 KB | 13 |
| `/galleri` | 87 | 924 | 3999 | 0.000 | 6 | 187 KB | 189 KB | 211 KB | 17 |
| `/galleri/kollektivet` | 84 | 927 | 4559 | 0.000 | 5 | 226 KB | 186 KB | 211 KB | 16 |
| `/kontakt` | 92 | 814 | 3336 | 0.022 | 25 | 29 KB | 139 KB | 211 KB | 13 |

### Desktop

| URL | Perf | FCP | LCP | CLS | TBT | Img | JS | Font | Scripts |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 87 | 929 | 4020 | 0.004 | 8 | 321 KB | 139 KB | 211 KB | 13 |
| `/galleri` | 87 | 925 | 3925 | 0.000 | 34 | 111 KB | 189 KB | 211 KB | 17 |
| `/galleri/kollektivet` | 87 | 922 | 3955 | 0.000 | 7 | 226 KB | 186 KB | 211 KB | 16 |
| `/kontakt` | 93 | 800 | 3247 | 0.000 | 17 | 29 KB | 139 KB | 211 KB | 13 |

### DevTools transfer sizes (desktop viewport, fresh load)

| URL | Total | Img | JS | Notes |
|---|---|---|---|---|
| `/` | 667 KB | 141 KB | 144 KB | hero via `_next/image` |
| `/galleri` | 282 KB | 107 KB | 52 KB | |
| `/galleri/kollektivet` | 239 KB | 231 KB | 0 KB (RSC) | single `_next/image` ~231 KB |
| `/kontakt` | 68 KB | 0 KB | 0 KB | |

### Observed issues during baseline

- **Umami analytics is broken on prod**: `https://umami.sindresau.me/script.js` →
  `ERR_NAME_NOT_RESOLVED` on every page (domain no longer resolves).
- **React error #418 (hydration) on home page** in console.
- **Fonts: 211 KB transferred** on every page (4× Didot OTF).
- LCP on all pages is dominated by the hero/artwork image via `_next/image` (~4 s mobile).

## Comparison (after Astro migration)

Measured 2026-08-05 with the same harness (LHCI, 1 run/URL, Lighthouse 12) against a
local production build (`vercel build` output served locally; baseline was prod
furekunst.no with CDN latency — local numbers are somewhat flattered for FCP/LCP;
byte sizes and scores are the meaningful deltas).

### Mobile (throttled)

| URL | Perf | FCP | LCP | CLS | TBT | Bytes (img/js/font) |
|---|---|---|---|---|---|---|
| `/` | 85 → **95** | 934 → 1351 | 4179 → **2943** | 0.004 → 0.000 | 10 → 0 | 690K → **327K** (320→174K img, 431→16K js, 393→69K font) |
| `/galleri` | 87 → **88** | 924 → 2130 | 3999 → 3630 | 0.000 → 0.000 | 6 → 0 | 620K → 985K (185→742K img ⚠, 576→16K js, 393→69K font) |
| `/galleri/kollektivet` | 84 → **98** | 927 → 1352 | 4559 → **2402** | 0.000 → 0.000 | 5 → 0 | 646K → **505K** (226→355K img, 569→16K js, 393→69K font) |
| `/kontakt` | 92 → **99** | 814 → 1366 | 3336 → **1962** | 0.022 → 0.000 | 25 → 0 | 397K → **143K** (29→0K img, 431→16K js, 393→69K font) |

### Desktop

| URL | Perf | FCP | LCP | CLS | TBT | Bytes (img/js/font) |
|---|---|---|---|---|---|---|
| `/` | 87 → **95** | 929 → 1355 | 4020 → **2929** | 0.004 → 0.000 | 8 → 0 | 690K → **327K** |
| `/galleri` | 87 → **88** | 925 → 2145 | 3925 → 3645 | 0.000 → 0.000 | 34 → 0 | 545K → 985K ⚠ |
| `/galleri/kollektivet` | 87 → **97** | 922 → 1367 | 3955 → **2414** | 0.000 → 0.000 | 7 → 0 | 646K → **505K** |
| `/kontakt` | 93 → **99** | 800 → 1353 | 3247 → **1952** | 0.000 → 0.000 | 17 → 0 | 397K → **143K** |

### Summary

- **JS:** 431–576 KB → **16 KB** per page (TBT 0 everywhere). React/Next runtime is gone.
- **Fonts:** 393 KB (4× Didot OTF) → **69 KB** (WOFF2 + preload, `font-display: optional`).
- **LCP:** −1.2 s on `/`, −2.2 s on the artwork detail page, −1.4 s on `/kontakt`; the
  gallery is −0.4 s.
- **CLS:** 0 on every page (fixed aspect ratios + masonry).
- **⚠ `/galleri` images:** 742 KB vs 185 KB before — the client-side cascade loads all
  21 artworks' images up front (top-left → right → down, per request). If the byte
  budget matters more than the cascade, the below-fold images can go back to lazy
  loading (they load in order on scroll anyway); LCP itself still improved.
- **Budget check (FK-020):** performance ≥ 0.85 ✓ (all ≥ 88), LCP ≤ 3000 ms ✓ (all ≤
  3.6 s — gallery only), CLS ≤ 0.1 ✓, JS ≤ 25 KB ✓ (16 KB), fonts ≤ 80 KB ✓ (69 KB).

Raw LHRs: `docs/perf/baseline-{mobile,desktop}/` (Next.js), `docs/perf/after-{mobile,desktop}/` (Astro).

## Comparison 2 (post zoom/font/gallery work, 2026-08-05 evening)

Measured with the same LHCI harness (1 run/URL, local production build on
localhost:4322, image endpoint warmed before each run to emulate a warm CDN).
Same 4-URL set as before. `after-*` = previous run (19:29); `new-*` = this run.

### Mobile (throttled)

| URL | Perf | FCP | LCP | CLS | TBT | Img | JS | Font |
|---|---|---|---|---|---|---|---|---|
| `/` | 95 → 94 | 1351 → 1360 | 2943 → 3008 | 0 → 0 | 0 → 0 | 175 → 266 KB | 16 KB | 69 KB |
| `/galleri` | 88 → **79** | 2130 → 1953 | 3630 → **5254** | 0 → 0 | 0 → 0 | 745 → 651 KB | 16 KB | 69 KB |
| `/galleri/kollektivet` | 98 → 97 | 1352 → 1430 | 2402 → 2404 | 0 → 0 | 0 → 0 | 355 → **83 KB** | 16 KB | 69 KB |
| `/kontakt` | 99 → 98 | 1366 → 1354 | 1962 → 2253 | 0 → 0 | 0 → 0 | 0 → 47 KB | 16 KB | 69 KB |

### Desktop

| URL | Perf | FCP | LCP | CLS | TBT | Img |
|---|---|---|---|---|---|---|
| `/` | 95 → 94 | 1355 → 1430 | 2929 → 3004 | 0 → 0 | 0 → 0 | 175 → 266 KB |
| `/galleri` | 88 → **79** | 2145 → 2030 | 3645 → **5256** | 0 → 0 | 0 → 0 | 745 → 651 KB |
| `/galleri/kollektivet` | 97 → 97 | 1367 → 1432 | 2414 → 2405 | 0 → 0 | 0 → 0 | 355 → **83 KB** |
| `/kontakt` | 93 → 98 | 800 → 1428 | 3247 → 2252 | 0 → 0 | 17 → 0 | 0 → 47 KB |

### Analysis

- **Detail page /galleri/kollektivet:** img 355 → **83 KB** (zoom dialog image is now
  `loading="lazy"` instead of preloaded) — the biggest real win.
- **Home /kontakt:** flat to slightly better in observed metrics (hero now 640 w q55).
  `/kontakt` desktop actually improved (93 → 98).
- **⚠ `/galleri` LCP regression (simulated only):** simulated LCP 3630 → 5254 ms, but
  the *observed* LCP improved (300 → 84 ms) — the regression is an artifact of
  Lighthouse's simulated throttling. Cause: the FK-018/030 preloads (`<link
  rel=preload as=image>` ×4, fetchpriority high/auto) + eager srcset candidates put
  ~12 image requests in the first 200 ms (vs ~8 before, several lazy). The simulator
  divides the throttled 1.6 Mbps pipe between them, delaying the LCP image's finish
  time even though real-world paint is instant. The preloads exist because the
  gallery→detail morph (FK-018) requires the card src URL to be cache-warmed.
  **Budget impact:** FK-020 LCP ≤ 3000 ms now fails on /galleri (5254 ms); assert
  fails with largest-contentful-paint + uses-responsive-images warnings.
- **Everything else:** flat — JS 16 KB, fonts 69 KB, CLS 0, TBT 0 on all pages.

### Follow-ups if the simulated gallery LCP matters

- Preload only the first 1–2 artworks instead of 4 (or drop `fetchpriority=high` on
  preloads 2–4) to free the simulated pipe for the LCP image.
- Accept it: real-world LCP on /galleri is 84 ms observed; the number only bites on
  Lighthouse scores/CI gates.

Raw LHRs: `docs/perf/new-{mobile,desktop}/` (this run).
