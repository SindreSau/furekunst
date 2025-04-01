import { getMetadata } from '@/lib/metadata'
import ClientContactPage from './client-contact-page'

export async function generateMetadata() {
  return getMetadata({
    title: 'Kontakt',
    description:
      'Ta kontakt med Elisabeth Fure Schwarz for spørsmål om kjøp eller bestilling av personlege bilete.',
    path: 'kontakt',
    additionalKeywords:
      'kontakt kunstner, bestill, personlig kunst, bestill maleri, kunstnar, Elisabeth Fure Schwarz, Furekunst, kunst, bilete, maleri, kunstverk, kunstner, bestilling, personleg bilete, personleg kunst',
  })
}

const ContactPage = () => {
  return <ClientContactPage />
}

export default ContactPage
