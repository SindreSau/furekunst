# Furekunst

Kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk.

Personal art portfolio built with [Astro](https://astro.build) (7.x), styled with
Tailwind CSS v4 (via `@tailwindcss/vite`). Content is managed in
[Contentful](https://www.contentful.com) and loaded **at request time** through
an Astro 7 live content collection (`src/live.config.ts` +
`src/loaders/contentful-gallery-live.ts`), with Vercel ISR caching (1 h) — CMS
edits appear without rebuilds. `/kontakt` and the 404 stay static; the sitemap
is served from the live endpoint `/sitemap.xml`. Deployed to Vercel
(`@astrojs/vercel`).

## Getting started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321`.

## Commands

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `pnpm dev`           | Start dev server (preview API — drafts visible)      |
| `pnpm build`         | Type-check (`astro check`) + production build        |
| `pnpm preview`       | Preview the production build locally                 |
| `pnpm check`         | Run `astro check`                                    |
| `pnpm format`        | Format with Prettier                                 |
| `pnpm perf:run`      | Lighthouse CI collect + assert against local preview |
| `pnpm perf:baseline` | Lighthouse CI mobile run against prod furekunst.no   |

## Environment variables

Copy `.env.example` to `.env` and fill in your Contentful credentials:

| Variable                    | Description                            |
| --------------------------- | -------------------------------------- |
| `CONTENTFUL_SPACE_ID`       | Contentful space ID                    |
| `CONTENTFUL_DELIVERY_TOKEN` | Delivery API token (published entries) |
| `CONTENTFUL_PREVIEW_TOKEN`  | Preview API token (draft entries)      |

Dev mode uses the preview API, so unpublished drafts are visible locally; builds
use the delivery API and only ship published entries.

## Adding an artwork

1. In Contentful, create a new entry of content type `galleryPost`.
2. Add the title and an image asset (the image asset is required — entries
   without a usable `file.url` are skipped at build time).
3. Rebuild and redeploy (or just refresh the dev server).

## Image optimization

- Local images under `src/assets/img/` are optimized at build time by Astro's
  asset pipeline.
- Contentful-hosted images (`images.ctfassets.net`) are processed via
  `image.remotePatterns` in `astro.config.mjs`.

## Measurement budget

Performance targets are enforced by Lighthouse CI (`lighthouserc.cjs`):
performance score ≥ 0.85, LCP ≤ 3000 ms, CLS ≤ 0.1, TBT ≤ 200 ms, total bytes
≤ 2.5 MB. Baseline and after-migration numbers are tracked in `docs/metrics.md`.
