/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_KEYSTATIC_REPO?: string
  readonly KEYSTATIC_SECRET?: string
  readonly KEYSTATIC_GITHUB_CLIENT_ID?: string
  readonly KEYSTATIC_GITHUB_CLIENT_SECRET?: string
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
