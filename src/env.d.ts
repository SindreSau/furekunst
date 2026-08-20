/// <reference types="astro/client" />

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
