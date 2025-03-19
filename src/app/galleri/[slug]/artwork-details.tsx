'use client'

import { GalleryPostEntry } from '@/types/gallery-post.types'
import Link from 'next/link'

export function ArtworkDetails({ artwork }: { artwork: GalleryPostEntry }) {
  const { fields } = artwork
  const { title, description, type, price, sizeAndPrice = [] } = fields

  return (
    <div className="flex max-w-md flex-col">
      <h1 className="font-didot text-3xl">{title}</h1>

      {description && <p className="leading-relaxed">{description}</p>}

      <div className="space-y-5">
        <div className="flex items-center gap-2 text-gray-700">
          <div className=" ">Type: </div>
          <div className="capitalize">{type}</div>
        </div>

        {/* Size and price for prints */}
        {type === 'print' && sizeAndPrice.length > 0 && (
          <div>
            <span className="mb-4 block text-gray-700">
              Størrelsar og prisar
            </span>
            <div className="space-y-3">
              {sizeAndPrice.map(item => (
                <div
                  key={item.sys.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2"
                >
                  <span className="">{item.fields.size}</span>
                  <span className="">kr {item.fields.price},-</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Size and price for originals */}
        {type === 'original' && (
          <div className="space-y-1">
            {fields.size && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Størrelse:</span>
                <span>{fields.size}</span>
              </div>
            )}
            {price && price > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Pris:</span>
                <span className="">kr {price},-</span>
              </div>
            )}
          </div>
        )}

        {/* Contact info */}
        <div className="mt-6">
          <p className="leading-relaxed text-gray-700">
            Interessert i dette verket? Ta kontakt på{' '}
            <Link
              href="mailto:fure.kunst@gmail.com"
              className="underline-red-100 cursor-pointer underline transition-colors hover:text-violet-800"
            >
              fure.kunst@gmail.com
            </Link>{' '}
            eller via{' '}
            <Link
              href="https://www.instagram.com/fure.kunst"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-red-100 cursor-pointer underline transition-colors hover:text-violet-800"
            >
              Instagram
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
