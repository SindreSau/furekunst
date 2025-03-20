import { CONSTANTS } from '@/lib/constants'
import { MailIcon } from 'lucide-react'
import Link from 'next/link'

const ContactPage = () => {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-didot mb-8 text-4xl text-gray-800">Kontakt</h1>

      <p className="mb-6 leading-relaxed text-gray-600">
        Har du spørsmål om kunsten min eller er du interessert i å kjøpe eit
        bilete? Eg set pris på om du tek kontakt via e-post eller Instagram.
      </p>

      <p className="mb-10 leading-relaxed text-gray-600">
        Om du ynskjer eit personleg maleri eller har andre førespurnader, er eg
        open for å diskutere moglegheitene.
      </p>

      <div className="flex flex-col gap-6 font-serif">
        <a
          href={`mailto:${CONSTANTS.email}`}
          className="flex items-center gap-4 text-xl text-gray-500 transition-colors duration-300 hover:text-gray-800"
        >
          <MailIcon size={24} />
          <span>{CONSTANTS.email}</span>
        </a>
        <Link
          href={CONSTANTS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 text-xl text-gray-500 transition-colors duration-300 hover:text-gray-800"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <span>fure.kunst</span>
        </Link>
      </div>
    </div>
  )
}

export default ContactPage
