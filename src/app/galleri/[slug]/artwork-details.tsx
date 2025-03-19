'use client'

import { GalleryPostEntry } from '@/types/gallery-post.types'

export function ArtworkDetails({ artwork }: { artwork: GalleryPostEntry }) {
  const { fields } = artwork
  const { title, description, type, price, sizeAndPrice = [] } = fields

  return (
    <div className="flex flex-col max-w-md">
      <h1 className="font-didot text-3xl">{title}</h1>

      {description && <p className="leading-relaxed">{description}</p>}

      <div className="space-y-5">
        <div className="flex text-gray-700 items-center gap-2">
          <div className="  ">Type: </div>
          <div className="capitalize">{type}</div>
        </div>

        {/* Size and price for prints */}
        {type === 'print' && sizeAndPrice.length > 0 && (
          <div>
            <span className=" text-gray-700 block mb-4">
              Størrelsar og prisar
            </span>
            <div className="space-y-3">
              {sizeAndPrice.map(item => (
                <div
                  key={item.sys.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
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
          <>
            {fields.size && (
              <div className="flex items-center">
                <span className="text-gray-700 w-28">Størrelse</span>
                <span>{fields.size}</span>
              </div>
            )}
            {price && price > 0 && (
              <div className="flex items-center pt-2">
                <span className="text-gray-700 w-28">Pris</span>
                <span className="text-xl">kr {price},-</span>
              </div>
            )}
          </>
        )}

        {/* Contact info */}
        <div className="mt-8">
          <p className="text-gray-700 leading-relaxed">
            Interessert i dette verket? Ta kontakt på{' '}
            <a
              href="mailto:fure.kunst@gmail.com"
              className="font-didot hover:text-black transition-colors"
            >
              fure.kunst@gmail.com
            </a>{' '}
            eller via{' '}
            <a
              href="https://www.instagram.com/fure.kunst"
              target="_blank"
              rel="noopener noreferrer"
              className="font-didot hover:text-black transition-colors"
            >
              Instagram
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
