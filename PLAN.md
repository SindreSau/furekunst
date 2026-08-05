# Furekunst — Overhaul & Optimization Plan

> **Status:** Migration complete. **Done:** FK-001–FK-031 (incl. FK-018 live collection + ISR, FK-019 `track()`, FK-021 tokens, FK-022/024/025/026 — see table notes for intentional reverts).
> **Partial:** FK-033 (phase 1 — non-destructive cleanup; commits/branches/OTFs pending user confirmation).
> **TODO:** FK-032 (deploy — prod still runs Next.js; pending user confirmation).
> **Date:** 2026-08-05
> **Goal:** Migrate the site to the latest Astro, fix all discovered bugs, make it faster, and make it look better.

---

## 0. Executive Summary

The repository at `furekunst` is **not an Astro project** — it is a **Next.js 15.2.2 + React 19 + Tailwind v4** app (the `working` branch), deployed to Vercel at `furekunst.no`. Per your request, the plan below migrates it to **Astro 7.1.6 (latest, July 2026)** while fixing a set of real bugs found during the audit, then optimizing performance and visual design.

### Migration progress

- FK-001–FK-010: foundation, baseline, design tokens, shared shell, Contentful collection, and home page are ported and verified.
- FK-008: gallery index is ported with CSS masonry, optimized Contentful images, static pagination at `/galleri/page/2`, descriptive alts, and no gallery client island.
- FK-009: all 21 static artwork detail pages are ported with server-rendered details, price offers, `VisualArtwork` JSON-LD, optimized images, and desktop-only zoom.
- FK-010: contact is ported as a static page with an optimized portrait, mail/Instagram actions, staggered reveals, and `Person` JSON-LD.
- FK-011: 404, robots, and sitemap are done (26 URLs in `sitemap-0.xml`, verified 200/404 matrix).
- FK-012: single `Frame.astro` component; dead `frame.tsx`/`loading-image.tsx` deleted with FK-013.
- FK-013: all Next.js code deleted (`src/app/`, all `.tsx`, `next/*` imports); `rg "next/" src` is empty.
- FK-014: **React eliminated entirely** — mobile menu, carousel (CSS scroll-snap), and artwork zoom are vanilla `.astro` components with bundled scripts; `@astrojs/react` + all React deps removed from `package.json` and `pnpm-lock.yaml`.
- FK-015: source images compressed ~87–96% (sharp script at `scripts/optimize-images.mjs`); gallery cards use 3–4 width candidates.
- FK-016: Didot converted to WOFF2 (4 weights, ~40 KB each), loaded via `@font-face`; body font Geist Variable.
- FK-017: `prefetch: true` + `data-astro-prefetch` on nav, gallery cards, and pagination.
- FK-019: Umami only (Vercel Analytics dropped); `track()` helper not yet added.
- FK-020: Lighthouse CI budgets in `lighthouserc.cjs` + baseline recorded in `docs/metrics.md`.
- FK-023: **View Transitions enabled** (native cross-document `@view-transition { navigation: auto }` — no `<ClientRouter />`, which avoids withastro/astro#11919): gallery → artwork image morph via per-artwork `view-transition-name`s, zoom opens/closes with `document.startViewTransition` shared-element morph (gated to fine-pointer devices), reveal content gated on `pagereveal` (no flicker), and touch/coarse-pointer + reduced-motion devices get an instant flash-free swap via media-scoped neutralization (`animation: none !important`, `mix-blend-mode: normal !important`, frame names stripped).
- FK-027: `src/lib/seo.ts` centralizes OG/twitter/canonical; per-page OG images incl. Contentful `?w=1200&h=630&fit=fill`; 404 is noindex.
- FK-028: JSON-LD `Person` (layout), `VisualArtwork` + multi-size `Offer` (artwork pages), `Person` on contact.
- FK-029: one h1 per page, focus-visible ring, skip-link, `aria-current` pagination, `prefers-reduced-motion` guards.
- FK-030: scripts `dev/build/check/lint/format/perf:*`; `lint` = `astro check` (ESLint removed with Next code).
- FK-031: README rewritten for Astro stack + `.env.example`; `.env` stays untracked.

### Remaining work (2026-08-05 status)

| Issue                            | Status  | Notes                                                                                                                                                                                                                                                          |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FK-018 ISR/caching               | DONE    | Live content collection (`src/live.config.ts` + `src/loaders/contentful-gallery-live.ts`) with Vercel ISR (1 h) + cache provider; sitemap served from live endpoint `/sitemap.xml`                                                                             |
| FK-019 `track()` helper          | DONE    | Umami only ✓; typed `track()` for artwork clicks in `src/lib/analytics.ts`                                                                                                                                                                                     |
| FK-021 typography & color tokens | DONE    | `global.css` token set trimmed to what's consumed; oklch only, shadcn leftovers removed                                                                                                                                                                        |
| FK-022 home redesign             | DONE    | Responsive hero done (Mas on mobile via `<picture>`, live data). NOTE: featured grid intentionally reverted to hard-coded `hjort/sjimpanse/labrador` (user preference); only the mobile Mas hero uses live data                                                |
| FK-023 motion & transitions      | DONE    | Implemented with native CSS cross-document view transitions instead of `<ClientRouter />` — avoids withastro/astro#11919 iOS history bug; `@view-transition { navigation: auto }` sits top-level (nesting it in `@media` drops named-element capture in Chromium), active only on `(hover: hover) and (pointer: fine)` devices without reduced motion — touch/coarse-pointer and reduced-motion users get an instant flash-free swap via media-scoped neutralization (pseudo-element animations + frame view-transition-names); zoom `document.startViewTransition` is gated to fine-pointer devices |
| FK-024 gallery UX                | DONE    | Path-based type filters (`/galleri/original`, `/galleri/print`), "frå kr X,-" price hints on cards, pagination active state tokens                                                                                                                             |
| FK-025 header & footer refresh   | DONE    | Wordmark + mobile menu (`aria-expanded`, ESC, focus return). NOTE: footer intentionally reverted to original shape (user preference)                                                                                                                           |
| FK-026 contact & 404 polish      | DONE    | Kontakt with card-like rows, 404 with two escape paths. NOTE: kontakt intentionally reverted to original layout (user preference)                                                                                                                              |
| FK-032 deploy & verify prod      | TODO    | **Prod `furekunst.no` still serves Next.js** (`/_next` confirmed); `docs/metrics.md` comparison table unfilled — pending user confirmation                                                                                                                     |
| FK-033 repo cleanup              | PARTIAL | Phase 1 (non-destructive) done; commits, branch deletion and OTF removal pending user confirmation — see below                                                                                                                                                 |

There is an old `vercel-astro-prod` branch that was an early Astro 5 + Tailwind 3 prototype. It predates the current design and should be used as reference only, not as a starting point. We migrate the _current_ Next.js codebase.

### Key facts discovered during the audit

| Area          | Finding                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 15.2.2 (`app/` router, Turbopack dev), React 19, Tailwind v4, Contentful CMS                           |
| Live site     | `furekunst.no` runs Next.js (confirmed via `/_next/image` URLs) and works — 18/21 artworks                     |
| Local dev     | **Gallery crashes with HTTP 500** — real bug, see FK-007                                                       |
| Deploy target | Vercel (Umami self-hosted analytics, `@vercel/analytics`, both enabled)                                        |
| Content       | Contentful space `yohdcpeddje2`, content type `galleryPost` (21 published + 1 draft entry)                     |
| Images        | `public/` holds multi-MB JPEGs (1.4–2.9 MB each); gallery artwork images come from Contentful                  |
| Fonts         | Didot (4× OTF, ~400 KB) loaded via `next/font/local` — but the **body font CSS variables are broken** (FK-004) |
| Tooling       | npm scripts + `pnpm-lock.yaml` (mixed), Prettier + tailwind plugin, ESLint 9 flat config, no tests             |

### Verified target stack (checked against registries + docs, 2026-08-04)

| Package                   | Version                                                                                              | Notes                                                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `astro`                   | **7.1.6**                                                                                            | Vite 8 (Rolldown), Rust compiler, queued rendering default, advanced routing, route caching. Breaks: stricter HTML, `src/fetch.ts` reserved, `compressHTML` default is now `'jsx'` |
| `@astrojs/vercel`         | **11.0.4**                                                                                           | peer: `astro ^7.0.0` ✓                                                                                                                                                             |
| `@astrojs/react`          | **6.0.2**                                                                                            | peer: React 17–19 ✓                                                                                                                                                                |
| `@astrojs/sitemap`        | **3.7.3**                                                                                            | works with Astro 7                                                                                                                                                                 |
| `tailwindcss`             | **4.3.3**                                                                                            | via **`@tailwindcss/vite`** — `@astrojs/tailwind` is deprecated and does **not** support Tailwind 4                                                                                |
| `contentful`              | ^11.5.8                                                                                              | official Astro docs recommend using the Contentful SDK directly                                                                                                                    |
| `sharp`                   | latest                                                                                               | required by Astro's default image service                                                                                                                                          |
| `@astrojs/check` + TS 5/6 | 0.9.10                                                                                               | for `astro check`                                                                                                                                                                  |
| Keep from today           | `embla-carousel`, `react-medium-image-zoom`, `lucide-react` (or astro-icon), `clsx`+`tailwind-merge` |                                                                                                                                                                                    |

---

## 1. Audit findings

### 1.1 Bugs (in current Next.js code, proven or near-certain)

| #   | Bug                                                                                                                                                                                                                                                                                                             | Evidence                                                                                                                 | Ref                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| B1  | **Gallery 500 in dev.** Preview API returns a draft post whose image asset has fields but **no `file`** → `post.fields.image.fields.file.url` throws `TypeError: Cannot read properties of undefined (reading 'url')`. Production is not immune: any CMS entry missing/breaking an image crashes the whole page | Reproduced locally; verified the preview API returns 22 items incl. 1 without `file`; delivery API resolves fine via SDK | `src/components/gallery-artwork.tsx:19`                                 |
| B2  | Root layout OG image points to `/lazydogs.jpg` — file is `lazy-dogs.jpg` → broken social card                                                                                                                                                                                                                   | `src/app/layout.tsx:42,49` vs `public/lazy-dogs.jpg`                                                                     |                                                                         |
| B3  | Gallery page OG image points to `/galleri/og-image.jpeg` — file is `open-graph.jpeg` → broken social card                                                                                                                                                                                                       | `src/app/galleri/page.tsx:15` vs `public/galleri/`                                                                       |                                                                         |
| B4  | `metadataBase` not set in root layout → Next warns and resolves OG images against `localhost:3000`                                                                                                                                                                                                              | dev log warning                                                                                                          | `src/app/layout.tsx:8`                                                  |
| B5  | `frame-shadow` class is used on 3 images but **defined nowhere** → intended drop-shadow silently missing                                                                                                                                                                                                        | grep shows usage only, no definition                                                                                     | `src/app/page.tsx:66,137`, `src/app/kontakt/client-contact-page.tsx:21` |
| B6  | Body font is broken: `--font-geist-sans` / `--font-geist-mono` referenced in `globals.css` but never defined (only Didot is loaded) → `font-body`/`font-sans` resolve to browser default                                                                                                                        | `src/app/globals.css:13-15,21-22` vs `src/lib/fonts.ts`                                                                  |                                                                         |
| B7  | `FadeImage` uses deprecated `onLoadingComplete` (Next 15 deprecation warning)                                                                                                                                                                                                                                   | dev log warning                                                                                                          | `src/components/fade-image.tsx:16`                                      |
| B8  | Mobile users download **both** the mobile carousel images **and** the desktop grid images (both are in the DOM; CSS `hidden` does not stop loading)                                                                                                                                                             | `src/app/page.tsx:120-143`                                                                                               |                                                                         |
| B9  | `FadeInSection` mutates `document.body.style.overflow/height` on every mount — side-effect hack (originally a mobile-menu workaround) that can leave the body scroll-locked                                                                                                                                     | `src/components/fade-in-section.tsx:25-26`                                                                               |                                                                         |
| B10 | Generic alt text: `Image 1/2/3` on home grid + carousel; hurts a11y/SEO                                                                                                                                                                                                                                         | `src/app/page.tsx:133`, `src/components/image-carousel.tsx:89`                                                           |                                                                         |
| B11 | `src/app/sitemap.ts` has a dev-only module-level cache — dead code in prod builds                                                                                                                                                                                                                               | `src/app/sitemap.ts:18-32`                                                                                               |                                                                         |
| B12 | Pagination uses raw `<a href>` (full page reloads) instead of prefetching links; active state styling is inverted vs design (`bg-gray-800 text-white` hard-coded)                                                                                                                                               | `src/components/ui/pagination.tsx`                                                                                       |                                                                         |
| B13 | `border-6` / `shadow-[...]` / `bg-primary-foreground/70` combos rely on Tailwind v4 numeric utilities — fine today, but several color values have alpha baked in (e.g. `--primary-foreground: #e9dbf49c`), making opacity modifiers behave unexpectedly                                                         | `src/app/globals.css:66-67`                                                                                              |                                                                         |

### 1.2 Performance problems

- **~451 MB `node_modules`**, `.next` build artifacts committed to disk; package.json still named `"next"`.
- **Home page weight:** hero `lazy-dogs.jpg` 2.0 MB source (served through `_next/image`, but the CDN source is huge); `labrador.jpeg` 2.7 MB, `profilbilde.jpeg` 1.5 MB, `sjimpanse.jpeg` 1.4 MB — none are compressed at the source.
- **All pages carry heavy client JS for mostly-static content:** `motion` (12.x), `react-masonry-css`, `embla-carousel-react`, `react-medium-image-zoom`, `lucide-react` bundle, plus Next's runtime (~14 script tags on the home page in dev, more in prod).
- **Didot OTF fonts:** 4 weights preloaded as OTF (larger than WOFF2); not subsetted; `font-display: swap` is set but there's no `preload` of the hero-critical weight only.
- **No `sizes`/`fetchpriority` tuning on gallery images beyond `priority={index < 6}`**; grid images request 7 candidate widths each (w=384…2048) for a 600 px slot.
- **Two analytics trackers** (Umami self-hosted + Vercel Analytics) duplicate tracking overhead.
- **No ISR/cache strategy beyond `revalidate = 3600`** on `/galleri`; artwork pages are fully static at build time (fine) but the gallery re-fetches all 21 posts on every revalidation.
- `getGalleryPostBySlug` fetches **all** posts to find one by slug (21 entries — OK today, but wasteful and will not scale).

### 1.3 Design / UX observations

- Typography is the site's identity (Didot), but body text falls back to a default font (B6) — the single most visible visual bug.
- The "framed artwork" visual language (double shadow, passepartout, inner edge highlights) is implemented twice with drift: `framed-image.tsx`, `gallery-artwork.tsx`, plus a dead `frame.tsx` and `loading-image.tsx`. Should be one `Frame.astro` component.
- Hero image has no fixed aspect ratio (`h-full w-full` in an unconstrained wrapper) → CLS risk; no LCP `fetchpriority="high"` on the `<img>` (Next maps `priority` to it, but we'll set it explicitly in Astro).
- No `prefers-reduced-motion` handling anywhere despite many animations.
- Mobile menu: hard-coded `top-[64px]`, no `aria-expanded`/focus trap, relies on the body style hack (B9).
- Pagination/menu/button hover styles mutate layout (padding changes on hover).
- Design tokens are a mix of oklch + hex with unused sidebar/chart/dark-theme tokens (Tailwind v4 purges some, but the CSS is confusing).
- Contentful's `sizeAndPrice` entries are resolved only by the SDK's `includes`; slugs are derived from titles (trailing space on "Juleførebuingar " produces slug `julefrebuingar-`).

### 1.4 SEO / a11y summary

- Good: per-page `generateMetadata`, JSON-LD (`Person`, `VisualArtwork`), `robots.ts`, `sitemap.ts`, canonical URLs.
- Broken by B2/B3 (social cards). No `theme-color`, no viewport override needed but verify in Astro. No focus-visible styles, no skip-link focus styles (skip link exists in header). Alt text gaps (B10). `h1` count: home page has two `h1`s ("Om Kunstnaren" + "Nokre utvalgte bilete") — the gallery title `h1` is fine per page.

---

## 2. Migration strategy

**Branch-based, parity-first:** each issue is a self-contained unit of work that keeps the site deployable. Recommended order: Phase A (foundation) → Phase B (migration issues, ported components) → Phase C (fixes + performance) → Phase D (design) → Phase E (SEO/analytics/a11y) → Phase F (quality/verification).

**Recommendation on client JS during migration:** port 1:1 to React islands (`@astrojs/react`) first for visual parity (menu, carousel, zoom, fade-ins), then remove React entirely in FK-014/FK-015 by replacing islands with vanilla `embla-carousel` scripts and CSS — Astro pages should ship ~0 JS except the zoom/carousel.

**Recommendation on data fetching:** use a **build-time content collection with a custom Contentful loader** (`src/content.config.ts` + `contentful.js` SDK), giving typed data, `getCollection()` queries, and automatic asset handling. Pre-render all pages; re-validate via Vercel ISR (`@astrojs/vercel` `isr` per-route) or a cache provider when the artist edits content.

---

## 3. The Issues

### Phase A — Foundation

#### FK-001 — Repository cleanup & package-manager consistency

- **Why:** mixed npm/pnpm lockfiles, `node_modules` at 451 MB, `.next/` build artifacts on disk, package name `"next"`, README is the create-next-app boilerplate.
- **Do:** choose **pnpm** (already the lockfile format); delete `.next/`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`; update `.gitignore` (add `/dist`, `.astro/`); fix `package.json` name/scripts to Astro scripts.
- **Acceptance:** clean `git status`, one lockfile, `pnpm install` works from scratch.

#### FK-002 — Scaffold Astro 7 project + config

- **Why:** this is the core migration step; everything else builds on it.
- **Do:** install `astro@7.1.6`, `@astrojs/vercel@11.0.4`, `@astrojs/react@6.0.2`, `@astrojs/sitemap@3.7.3`, `@tailwindcss/vite@4.3.x`, `tailwindcss@4.3.x`, `sharp`, `contentful@^11`, `@astrojs/check`, `typescript`. Create `astro.config.mjs`:
  - `site: 'https://furekunst.no'`, `output: 'static'` initially (switch per-route to ISR later — FK-019)
  - `adapter: vercel({ imageService: true, isr: ... })` (verify image service on Vercel)
  - `integrations: [react(), sitemap()]`, `vite: { plugins: [tailwindcss()] }`
  - `image.remotePatterns: [{ hostname: 'images.ctfassets.net' }]`
  - Astro 7 notes: **do not** create `src/fetch.ts` (reserved for advanced routing); HTML must be strictly closed (Rust compiler); check `compressHTML` default.
- **Acceptance:** `pnpm dev` serves a blank Astro page on :4321; `pnpm build` + `astro check` pass.

#### FK-003 — Baseline measurements

- **Why:** you cannot optimize what you don't measure; needed to verify every later issue.
- **Do:** run Lighthouse (mobile+desktop) on `/`, `/galleri`, one `/galleri/[slug]`, `/kontakt` against the current Next site (record numbers into `PLAN.md` or a `docs/metrics.md`); measure home page transfer size with DevTools; capture `dist/` sizes after the Astro port.
- **Acceptance:** a recorded baseline (LCP, CLS, TBT, total JS/CSS/image bytes) that later issues are compared against.

### Phase B — Migration (port with parity)

#### FK-004 — Port design tokens, global CSS, fonts

- **Why:** the foundation of the look; also fixes B6 (broken body font).
- **Do:** move `globals.css` → `src/styles/global.css` imported in a layout; clean the `@theme` block: define `--font-didot` + a real body font (e.g. `Georgia`/system serif — the site's body currently _intends_ Geist Sans; choose a matching serif such as `Georgia, 'Times New Roman', serif` or add a WOFF2 body font); drop unused sidebar/chart/dark tokens or keep a trimmed, commented token set; fix `--primary-foreground` (remove baked-in alpha). Load Didot via `@font-face` with **WOFF2** (convert the 4 OTF files — see FK-016) and `font-display: swap`.
- **Acceptance:** headings render Didot, body renders the chosen font on all pages; no undefined-font fallback.

#### FK-005 — Layout: Header, Footer, base page shell

- **Why:** every page shares these.
- **Do:** `src/layouts/MainLayout.astro` with `<html lang="nn">`, viewport meta, theme-color, skip-link, JSON-LD `Person` script, Umami script (`<script src defer>`), slots for `head`/`body`. Port `Header`/`Footer` as `.astro` components (static nav + **one small React island only for the mobile menu toggle**). Keep the three pages array (`Heim/Galleri/Kontakt`), active-state logic via `Astro.url.pathname`.
- **Acceptance:** parity with today's header/footer on desktop and mobile; menu works with `aria-expanded`, closes on nav/resize, no body-style hacks (B9).

#### FK-006 — Contentful data layer (content collection)

- **Why:** single typed source of truth; fixes the preview/delivery inconsistency and the slug lookup waste.
- **Do:** `src/content.config.ts` with a `galleryPosts` collection + custom loader using `contentful.js`:
  - `include: 2` on `getEntries`, and a `contentful` client factory honoring `CONTENTFUL_PREVIEW_TOKEN` in dev
  - schema (zod): title, description, type (`original|print`), size, price, sizeAndPrice, passepartout, image (url, width, height) — **image optional + `transform` that drops posts without a usable `file.url`** (fixes B1 permanently)
  - keep `titleToSlug()` util shared (slug from title, trim trailing whitespace).
- **Acceptance:** dev (preview) and build (delivery) both return the same 21 published artworks; a draft entry with a broken image no longer crashes anything.

#### FK-007 — Port Home page

- **Why:** the LCP page.
- **Do:** `src/pages/index.astro` with: hero (`FadeImage` → plain `<Image>`/`<Picture>` with explicit `aspect-ratio`, `fetchpriority="high"`, blur placeholder via `getImage` or a tiny `lazy-dogs-blur` asset — B5 fixed by defining a real shadow utility), separator, About section (real alt text), and the "Nokre utvalgte bilete" section.
- **Fix B8 during port:** render **one** responsive treatment — e.g. CSS grid on `md+` and a carousel _only_ under `md` using a client:visible island that mounts only on small screens (or `matchMedia` inside the island) — never both.
- **Fix B10:** use descriptive alts (`"Bilde: Hjort"` etc.).
- **Acceptance:** visually equivalent to today minus the broken font/shadow; single LCP image; no duplicate downloads on mobile.

#### FK-008 — Port Gallery index (masonry + pagination)

- **Why:** the content hub; currently the crashing page.
- **Do:** `src/pages/galleri/index.astro`:
  - static prerender; page-size 12 with `Astro.url.searchParams` for `?page=`
  - replace `react-masonry-css` with **CSS multi-column masonry** (`columns-1 md:columns-2 lg:columns-3`, `break-inside-avoid`) — removes a client dependency (FK-014)
  - one `GalleryPost.astro` card (shared Frame markup — FK-012) with hover effects via CSS only
  - server-render the pagination (B12: real `<Link>`s via `<a>` is fine in Astro — but use `client:visible` prefetching later FK-017).
- **Acceptance:** gallery renders all 21 artworks in production mode; pagination works; no crash on broken entries.

#### FK-009 — Port artwork detail page (zoom + frame)

- **Why:** the money page (buy/sold intent).
- **Do:** `src/pages/galleri/[slug].astro` with `getStaticPaths()` from the collection; port `ArtworkDetails` as `.astro` (title, description, type badge, price table for prints, contact links) and the framed image as a `Frame.astro` component; zoom stays as a React island (`react-medium-image-zoom`) initially; port JSON-LD `VisualArtwork` (with all size/price offers) + OG image via Contentful URL (B2/B3-style mistakes avoided by building URLs in one place — FK-021).
- **Acceptance:** detail pages work for every published artwork; zoom works desktop-only as today.

#### FK-010 — Port Contact page

- **Why:** conversion page.
- **Do:** `src/pages/kontakt.astro` — port `ClientContactPage` to static Astro (no island needed; the mailto/Instagram links are plain links), keep `Person` JSON-LD, profile photo with fixed aspect ratio.
- **Acceptance:** parity with today, zero client JS on the page.

#### FK-011 — Port 404, robots, sitemap

- **Why:** SEO plumbing.
- **Do:** `src/pages/404.astro` (keep the "Oisann!" copy + button), `public/robots.txt` (with sitemap URL), `@astrojs/sitemap` config (it reads the collection-less routes automatically; add the artwork URLs via `customPages` or a small endpoint — simplest: use sitemap integration + include `pages/galleri/[slug]` static routes automatically). Drop the Next `sitemap.ts` dev-cache (B11).
- **Acceptance:** `/sitemap.xml` lists `/`, `/galleri`, all 21 artwork slugs, `/kontakt`; robots.txt correct.

#### FK-012 — Unify the Frame component

- **Why:** three drifting implementations today (B: framed-image/gallery-artwork/frame.tsx dead).
- **Do:** single `Frame.astro` (border-6 slate-800, double offset shadows, inner edge highlights, optional passepartout padding + shadows) used by the gallery card, detail page, and home grid. Delete `frame.tsx`, `loading-image.tsx`, duplicated classes.
- **Acceptance:** visually identical output from one component; dead components removed.

#### FK-013 — Delete Next.js code, verify parity

- **Why:** end of migration; keeps repo honest.
- **Do:** remove `src/app/`, `next-env.d.ts`, `next.config.ts`, all `next/*` imports; `pnpm install` clean; run the site through the FK-003 checklist; fix any drift.
- **Acceptance:** `rg "next/" src` returns nothing; Lighthouse parity or better on all pages.

### Phase C — Performance

#### FK-014 — Eliminate non-essential client JS

- **Why:** the biggest performance lever; most pages should ship ~0 JS.
- **Do:** remove `motion/react` (replace scroll fade-ins with CSS `animation-timeline: view()` / small vanilla `IntersectionObserver` script, respecting `prefers-reduced-motion`), remove `react-masonry-css` (CSS columns already), drop `lucide-react` in favor of inline SVGs or `astro-icon`, and migrate the **carousel + zoom to vanilla** (`embla-carousel` has a framework-agnostic package) so `@astrojs/react` can be removed entirely.
- **Acceptance:** home + gallery + contact pages have **0 JS modules**; detail page has only the zoom module (or 0 with a CSS-only lightbox). Total JS per page < 20 KB gzip (from several hundred KB today).

#### FK-015 — Image pipeline (the big one)

- **Why:** multi-MB sources; Astro gives us build-time AVIF/WebP + proper `srcset`/`sizes`.
- **Do:**
  - move `public/*.jpeg` into `src/assets/` so Astro optimizes them (except OG images which must remain absolute-URL public files)
  - compress/convert the sources (e.g. `sharp` script: resize hero to ≤1600px wide, q≈75; profile ≤1000px) so even the _originals_ are small
  - use `<Picture>` with `formats={['avif','webp']}` for the hero; `<Image layout="constrained/full-width" sizes>` with sensible `breakpoints` for gallery cards (drop the 2048w candidates)
  - Contentful artwork images: use Contentful's own resize params (`?w=&h=&fm=webp&fit=`) or let Astro process via `image.remotePatterns` — pick one and centralize in a `lib/images.ts` helper
  - hero: `fetchpriority="high"`, aspect-ratio wrapper, tiny inline blur placeholder.
- **Acceptance:** hero image served ~10× smaller (AVIF, ≤1600px); gallery cards fetch only 2–3 candidates; CLS ~0 on all pages; total image transfer < 1 MB on home.

#### FK-016 — Font optimization

- **Why:** Didot is the brand; currently 4×OTF, un-subsetted, body font broken (B6).
- **Do:** convert OTFs → **WOFF2** (single `Didot` family with weights 400/700/800 + italic; or serve only weights actually used — check usage: 400 body?, 700/800 headings); subset to latin-ext/norsk chars; `font-display: swap`; `preload` only the weights used above the fold; self-host in `src/assets/fonts` with `@font-face` + `font-synthesis` off.
- **Acceptance:** total font bytes ≤ ~80 KB; headings render Didot with no FOUT flash beyond swap; Lighthouse "font-display" check passes.

#### FK-017 — Prefetch & navigation feel

- **Why:** near-instant page transitions for a 5-page site.
- **Do:** add `@astrojs/prefetch` (prefetch links on hover/visible), or enable Astro **View Transitions** (`<ViewTransitions />`) for a premium feel (see FK-023) which includes prefetching. Use `data-astro-prefetch` on the gallery pagination links.
- **Acceptance:** navigating Galleri→artwork→Heim feels instant; no full-page flash.

#### FK-018 — Caching & revalidation on Vercel

- **Why:** today `/galleri` re-fetches Contentful every 3600 s and artwork pages are stale until rebuild.
- **Do:** switch to `output: 'hybrid'`/ISR: prerender all artwork pages, keep `/galleri` and home as ISR (e.g. 1 h) via `@astrojs/vercel` `isr` route config; set sensible `Cache-Control` for `/_image` (Vercel image service) and static assets; ensure Contentful webhooks trigger rebuilds (or rely on ISR).
- **Acceptance:** gallery TTFB drops after first visit; CMS edits appear ≤ 1 h without manual rebuild; cache hit rate > 95% for images.

#### FK-019 — Analytics consolidation

- **Why:** two trackers double the (small but non-zero) cost and skew data.
- **Do:** keep self-hosted **Umami** (privacy-friendly, no cookie banner needed), remove `@vercel/analytics`; add a small typed `track()` helper for gallery-card clicks (event: "artwork_click").
- **Acceptance:** single analytics request per page; gallery interactions measured.

#### FK-020 — JS/CSS budget + bundle analysis

- **Why:** keep regressions out.
- **Do:** add `astro build` size output check, or a CI step running `lhci` (Lighthouse CI) with budgets (LCP < 2.5 s, CLS < 0.1, JS < 25 KB, images < 1 MB on home). Optionally use the Vite `build.assetsDir` and manual chunks.
- **Acceptance:** a budget file exists and passes on all pages; documented in README.

### Phase D — Design & UX polish

#### FK-021 — Typography & color system

- **Why:** foundation of "looks better".
- **Do:** finalize the pair Didot (display) + chosen body serif; set a type scale (h1 3xl→4xl with tracking, body 17–18 px, leading relaxed); normalize colors to a small token set (ink `#2b1d38`-ish, paper pastel, accent violet) — replace mixed oklch/hex; ensure `text-primary`/`muted-foreground` used consistently; add focus-visible ring styles globally.
- **Acceptance:** cohesive, gallery-style typography; consistent spacing rhythm.

#### FK-022 — Hero & home page redesign

- **Why:** first impression; currently a full-bleed photo with no hierarchy.
- **Do:** hero with fixed aspect ratio, subtle frame treatment (match gallery cards), maybe a pull-quote/CTA overlay; replace the three hard-coded sample images (`hjort`, `sjimpanse`, `labrador`) with **latest 3 artworks from Contentful** (with correct alts); polish the "Om Kunstnaren" section (drop the gray divider, use consistent spacing); keep the double FrameButton CTA.
- **Mobile hero art direction:** use the vertical **Mas** image on narrow screens, while retaining the landscape **Lazy Dogs** image on desktop; implement this with a responsive `<Picture>`/`<source media>` treatment so each viewport fetches the appropriate crop/source.
- **Acceptance:** hero is the single LCP element, no CLS, features current work.

#### FK-023 — Motion & View Transitions

- **Why:** the site feels alive without heavy JS.
- **Do:** enable Astro View Transitions with a subtle fade/slide (respect `prefers-reduced-motion`); keep scroll reveal via CSS `animation-timeline: view()` (no JS); add micro-interactions (image scale on hover via CSS `transform`, keep frame shadows static to avoid layout shifts).
- **Acceptance:** MPA-like feel with zero JS on content pages; reduced-motion users get instant transitions.

#### FK-024 — Gallery UX

- **Why:** the main browse surface.
- **Do:** type filter chips (`Alle / Original / Print`) implemented as static filtered pages (`/galleri?type=print`) — no client JS; hover state unify; show price hints on cards ("frå kr X,-") using the same price logic as the detail page; verify masonry column gap/padding consistency; keep pagination but restyle active page per design (fix B12).
- **Acceptance:** browsable with/without JS; filters share state via URL.

#### FK-025 — Header & footer refresh

- **Why:** navigation chrome.
- **Do:** sticky header with backdrop blur on scroll; wordmark "ELISABETH FURE" + small "FUREKUNST" tagline; mobile menu: proper `aria-expanded`, focus management, ESC-to-close, stagger animation via CSS only; footer: replace `flex-col-reverse` hack with ordered layout, add nav links + credit line, hover states consistent.
- **Acceptance:** menu is keyboard-accessible; no body scroll hack; parity+ polish.

#### FK-026 — Contact & 404 polish

- **Why:** conversion + trust.
- **Do:** contact page: card-like contact block with email/Instagram rows, optional WhatsApp/phone if provided by artist; add opening-hours-free "svarar vanlegvis innan 1-2 dagar"; 404 page: keep charm ("Nedsnøva"), add links to gallery + home.
- **Acceptance:** contact actions are obvious; 404 has two escape paths.

### Phase E — SEO, social & accessibility

#### FK-027 — Centralize metadata + fix all OG URLs

- **Why:** B2/B3 currently break social cards.
- **Do:** one `src/lib/seo.ts` (port of `metadata.ts`) generating `title/description/OG/twitter/canonical` + JSON-LD builders; wire per-page in each `.astro` frontmatter; fix the two wrong filenames; ensure every artwork page has its Contentful-based OG image (`?w=1200&h=630&fit=fill`); add `theme-color`, `og:locale: nn_NO`.
- **Acceptance:** `furekunst.no/galleri/[slug]` share links produce correct previews (verify with opengraph debugger); no 404 OG requests in network log.

#### FK-028 — Structured data completeness

- **Why:** rich results.
- **Do:** port `Person` (root), `VisualArtwork` + `Offer` (artwork pages, incl. multi-size offers), `Organization`/`ContactPage` on `/kontakt`; validate with Google Rich Results test.
- **Acceptance:** all pages have valid JSON-LD; artwork pages show offers.

#### FK-029 — Accessibility pass

- **Why:** the fixes listed are cheap and high-value.
- **Do:** one `h1` per page (home currently has two — B10-adjacent); descriptive alts everywhere (gallery uses artwork titles — done via FK-008/015); `aria-label` for carousel controls (already present), `aria-expanded` menu (FK-025); `prefers-reduced-motion` global guard; skip-link visible on focus; pagination `aria-current` (B12); contrast check of `#3a2548`-on-paper and gray-on-paper text.
- **Acceptance:** axe/Lighthouse a11y score ≥ 95 on all pages; keyboard-only navigation works end-to-end.

### Phase F — Quality, tooling, deploy

#### FK-030 — Lint, format, type-check

- **Why:** currently only Next-specific ESLint; `astro check` is the new gate.
- **Do:** Prettier (+ `prettier-plugin-astro`) with the existing `.prettierrc`; ESLint 9 flat config with `eslint-plugin-astro` + `typescript-eslint` (or rely on `astro check`); scripts: `dev`, `build` (`astro check && astro build`), `preview`, `lint`, `format`.
- **Acceptance:** `pnpm lint`, `pnpm format --check`, `pnpm build` all green.

#### FK-031 — README & docs

- **Why:** today's README is create-next-app boilerplate.
- **Do:** document stack, commands, Contentful env vars (and that `.env` is local-only; add `.env.example`), deploy workflow to Vercel, how to add an artwork, and the measurement budget.
- **Acceptance:** README matches reality; `.env.example` committed, real `.env` stays untracked.

#### FK-032 — Deploy & verify production

- **Why:** the last mile.
- **Do:** deploy the `working`→new branch to Vercel with the new framework preset; verify: all 24 URLs (5 static + 21 artwork + 404) return 200, sitemap/robots, OG tags, Umami events, no console errors; run Lighthouse on prod; record final numbers next to FK-003 baseline.
- **Acceptance:** prod numbers ≥ baseline on every metric; visual parity or better.

#### FK-033 — Clean up the codebase

- **Why:** the porting/optimization pass is nearly done and the repo has accumulated review artifacts, unused assets, build output, and Next-era leftovers that must not ship or be committed.
- **Do:**
  - delete review screenshots at repo root: `home-check.png` (1.2 MB, not gitignored), `review-home-*.png` (gitignored but still on disk — remove); check `git status` is clean of untracked media
  - remove unused OG files: `public/twitter.jpeg`, `public/galleri/twitter.jpeg` (referenced nowhere; `seo.ts` uses `/open-graph.jpeg` and `/galleri/open-graph.jpeg`)
  - decide on the original Didot OTFs in `src/assets/fonts/Didot Font Family/` (~100 KB × 4): either delete (WOFF2 in `src/assets/fonts/woff2/` is what ships) or move to a non-repo backup location
  - prune Next-era `.gitignore` entries (`/.next/`, `/out/`, `next-env.d.ts`, `/.pnp`, `.yarn/*`) and Next-era `.prettierignore` entries (`build`, `coverage`, `out`) that no longer apply
  - verify `scripts/optimize-images.mjs` is still needed (one-shot vs keep for future source imports)
  - delete stale branches if safe: `master`, `migrate-to-next`, `vercel-astro-prod` (keep `working`), or document them in README
  - final sweep: `rg "next/|react|_next" src/`, confirm `pnpm install` from clean clone works, `git status` shows no stray artifacts
- **Acceptance:** clean `git status` after `pnpm build`; repo contains only files the Astro site actually uses; README documents what was removed.

---

## 4. Suggested execution order

| Order | Issues                                                                             |
| ----- | ---------------------------------------------------------------------------------- |
| 1     | FK-001 → FK-003 (foundation + baseline)                                            |
| 2     | FK-004 → FK-013 (migration; FK-006 & FK-007 fix B1, B5, B6, B8, B10 along the way) |
| 3     | FK-014 → FK-020 (performance)                                                      |
| 4     | FK-021 → FK-026 (design)                                                           |
| 5     | FK-027 → FK-029 (SEO/a11y)                                                         |
| 6     | FK-030 → FK-033 (quality + ship + cleanup)                                         |

Issues inside each phase can be tackled one by one in any order; FK-006 must precede FK-008/FK-009, and FK-004 precedes everything that renders pages.

---

## 5. Known decisions to make (flag for the user)

1. **Body font choice** — the current site intended Geist Sans for body text but never shipped it (B6). Options: (a) bundle a WOFF2 body sans (e.g. `Inter`), (b) use system serif `Georgia` for an all-Didot-family feel, (c) system sans stack.
2. **Vercel Analytics vs Umami** — recommend keeping only Umami (FK-019).
3. **View Transitions** (FK-023) — recommend yes; it's the biggest "wow" per effort for a small site.
4. **Contentful revalidation** — webhook-triggered rebuilds vs ISR-only (FK-018); ISR-only is zero-config.
5. **Whether to keep React at all** — plan removes it in FK-014; if you'd rather keep islands (React) for future growth, FK-014 becomes optional.
