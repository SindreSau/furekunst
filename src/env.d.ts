/// <reference types="astro/client" />

interface Window {
  // Hook set by the MainLayout <head> script: records when the navigation
  // has finished showing the page (after any cross-document view
  // transition), so reveal.ts can gate the fade-up behind it.
  __furekunst?: {
    revealed: boolean
    onRevealed: Array<() => void>
  }
}

interface ImportMetaEnv {
  readonly CONTENTFUL_SPACE_ID: string
  readonly CONTENTFUL_DELIVERY_TOKEN: string
  readonly CONTENTFUL_PREVIEW_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}