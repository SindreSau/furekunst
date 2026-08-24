# Furekunst

Kunstnar Elisabeth Fure Schwarz sine måleri og kunstverk.

Personal art portfolio built with [Astro](https://astro.build) 7.x, styled with
Tailwind CSS v4 (via `@tailwindcss/vite`). Content is managed with
[Keystatic](https://keystatic.dev): content entries live in `src/content/*`
(JSON) and artwork images in `src/assets/artworks`, edited through the Keystatic
Admin UI at `/keystatic`. In production Keystatic commits edits back to the
GitHub repo (`PUBLIC_KEYSTATIC_REPO`). Deployed to Vercel (`@astrojs/vercel`)
with ISR caching (1 h) for the dynamic routes; `/kontakt` and the 404 are
prerendered.

## Getting started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321`. The Keystatic Admin UI is at `/keystatic`.

## Commands

| Command              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Start dev server                                      |
| `pnpm build`         | Type-check (`astro check`) + production build         |
| `pnpm preview`       | Preview the production build locally                  |
| `pnpm check`         | Run `astro check`                                     |
| `pnpm test`          | Run the Playwright suite (`pnpm test:ui` for UI mode) |
| `pnpm format`        | Format with Prettier                                  |
| `pnpm perf:run`      | Lighthouse CI collect + assert against local preview  |
| `pnpm perf:baseline` | Lighthouse CI mobile run against prod furekunst.no    |

## Environment variables

None are required for local development (Keystatic uses local storage). On
Vercel, set:

| Variable                | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `PUBLIC_KEYSTATIC_REPO` | GitHub repo (`owner/repo`) for Keystatic storage in production |

## Adding an artwork

1. Open `/keystatic` locally (or the deployed admin) and create a new
   "Kunstverk (Galleri)" entry.
2. Add a title, description, type (original/print), optional size/price, and
   upload the artwork image.
3. In production the edit is committed to the repo and picked up on rebuild
   (ISR keeps existing pages fresh); locally it is written straight to
   `src/content/gallery/`.

## Image optimization

- Local images are optimized at build time by Astro's asset pipeline
  (`astro:assets`); on Vercel, transformed variants are served through the
  Vercel image service with ISR caching.

## Measurement budget

Performance targets are enforced by Lighthouse CI (`lighthouserc.cjs`):
performance score ≥ 0.85, LCP ≤ 3000 ms, CLS ≤ 0.1, TBT ≤ 200 ms, total bytes
≤ 2.5 MB. Baseline and after-migration numbers are tracked in `docs/metrics.md`.
