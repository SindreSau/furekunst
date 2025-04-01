import { getArtistStructuredData, getMetadata } from '@/lib/metadata'
import ClientContactPage from './client-contact-page'
import Script from 'next/script'

export async function generateMetadata() {
  return getMetadata({
    title: 'Kontakt',
    description:
      'Ta kontakt med Elisabeth Fure Schwarz for spørsmål om kjøp av kunst eller bestilling av personlege bilete. Furekunst tilbyr originale måleri, akvarell og print.',
    path: 'kontakt',
    additionalKeywords:
      'kontakt kunstnar, bestill kunst, personleg kunst, bestill måleri, Elisabeth Fure Schwarz kontakt, Furekunst kontakt, Elisabeth Fure kontakt, kunstnar kontakt, kunstbestilling, personlege bilete',
    type: 'profile',
  })
}

const ContactPage = () => {
  // Get structured data for the artist profile
  const artistStructuredData = getArtistStructuredData()

  return (
    <>
      <Script
        id="artist-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(artistStructuredData),
        }}
      />
      <ClientContactPage />
    </>
  )
}

export default ContactPage
