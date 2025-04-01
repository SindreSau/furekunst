'use client'

import { CONSTANTS } from '@/lib/constants'
import { MailIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FadeInSection } from '@/components/fade-in-section'

const ClientContactPage = () => {
  const profilbilde = '/profilbilde.jpeg'

  return (
    <div className="mx-auto flex max-w-4xl flex-col-reverse items-center gap-10 md:gap-6 lg:flex-row lg:gap-8">
      <FadeInSection className="overflow-hidden rounded-md lg:rounded-none">
        <Image
          src={profilbilde}
          alt="Elisabeth Fure Schwarz"
          width={2316}
          height={3088}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 600px"
          className="frame-shadow h-full max-h-[500px] w-full max-w-[50vw] rounded-sm object-cover sm:rounded-none md:max-w-none"
          priority
        />
      </FadeInSection>

      <div className="flex flex-col">
        <FadeInSection delay={100}>
          <h1 className="font-didot mb-8 text-4xl text-gray-800">Kontakt</h1>
        </FadeInSection>

        <FadeInSection delay={150}>
          <p className="mb-6 leading-relaxed text-gray-600">
            Har du spørsmål om kunsten min, eller er du interessert i å kjøpe
            eit bilete? Eg set pris på at du tek kontakt via e-post eller
            Instagram.
          </p>
        </FadeInSection>

        <FadeInSection delay={200}>
          <p className="mb-10 leading-relaxed text-gray-600">
            Viss du ynskjer eit personleg måleri eller har andre førespurnader,
            er eg open for å diskutere moglegheitene.
          </p>
        </FadeInSection>

        <div className="flex w-min flex-col gap-6 font-serif">
          <FadeInSection delay={250}>
            <a
              href={`mailto:${CONSTANTS.email}`}
              className="flex items-center gap-4 text-xl text-gray-500 transition-colors duration-300 hover:text-gray-800"
            >
              <MailIcon size={24} />
              <span>{CONSTANTS.email}</span>
            </a>
          </FadeInSection>

          <FadeInSection delay={300}>
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
          </FadeInSection>
        </div>
      </div>
    </div>
  )
}

export default ClientContactPage
