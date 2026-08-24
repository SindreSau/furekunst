import { getEntry } from 'astro:content'
import { CONSTANTS } from './constants'

export interface SiteSettings {
  artistName: string
  email: string
  instagramUrl: string
  instagramHandle: string
  facebookUrl: string
  footerCopyright: string
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const entry = await getEntry('settings', 'index')
    if (entry?.data) {
      return {
        artistName: entry.data.artistName ?? 'Elisabeth Fure Schwarz',
        email: entry.data.email ?? CONSTANTS.email,
        instagramUrl: entry.data.instagramUrl ?? CONSTANTS.instagram,
        instagramHandle: entry.data.instagramHandle ?? 'fure.kunst',
        facebookUrl: entry.data.facebookUrl ?? CONSTANTS.facebook,
        footerCopyright:
          entry.data.footerCopyright ?? 'Furekunst. Alle rettar reserverte.',
      }
    }
  } catch {
    // Fallback if settings entry is not found
  }

  return {
    artistName: 'Elisabeth Fure Schwarz',
    email: CONSTANTS.email,
    instagramUrl: CONSTANTS.instagram,
    instagramHandle: 'fure.kunst',
    facebookUrl: CONSTANTS.facebook,
    footerCopyright: 'Furekunst. Alle rettar reserverte.',
  }
}
