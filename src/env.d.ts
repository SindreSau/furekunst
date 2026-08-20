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
  readonly PUBLIC_KEYSTATIC_REPO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace astroHTML.JSX {
  interface ImgHTMLAttributes {
    fetchpriority?: 'auto' | 'high' | 'low' | string | undefined | null
  }
  interface LinkHTMLAttributes {
    fetchpriority?: 'auto' | 'high' | 'low' | string | undefined | null
  }
  interface ScriptHTMLAttributes {
    fetchpriority?: 'auto' | 'high' | 'low' | string | undefined | null
  }
  interface IframeHTMLAttributes {
    fetchpriority?: 'auto' | 'high' | 'low' | string | undefined | null
  }
}
