import type { Asset, EntryFields } from 'contentful'

// Custom Asset type to match Contentful's structure
interface ContentfulAsset extends Asset {
  fields: {
    title: string
    description: string
    file: {
      url: string
      details: {
        size: number
        image?: {
          width: number
          height: number
        }
      }
      fileName: string
      contentType: string
    }
  }
}

// SizeAndPrice content type
interface SizeAndPriceFields {
  size: EntryFields.Symbol
  price: EntryFields.Integer
}

// For ContentType structure
// interface SizeAndPriceTypeFields {
//   fields: SizeAndPriceFields
//   contentTypeId: 'sizeAndPrice'
// }

// For actual entries
interface SizeAndPrice {
  fields: SizeAndPriceFields
  sys: {
    id: string
    type: string
    createdAt: string
    updatedAt: string
    locale: string
    revision: number
    contentType: {
      sys: {
        id: string
        type: string
        linkType: string
      }
    }
    space: {
      sys: {
        id: string
        type: string
        linkType: string
      }
    }
    environment: {
      sys: {
        id: string
        type: string
        linkType: string
      }
    }
  }
}

// GalleryPost content type fields
// interface GalleryPostFields {
//   fields: {
//     image: ContentfulAsset
//     title: EntryFields.Symbol
//     description?: EntryFields.Text
//     type: EntryFields.Symbol // 'original' | 'print'
//     size?: EntryFields.Symbol
//     price?: EntryFields.Integer
//     sizeAndPrice?: SizeAndPrice[]
//     passepartout: EntryFields.Boolean
//   }
//   contentTypeId: 'galleryPost'
// }

// For use with getEntries
export interface IGalleryPost {
  fields: {
    image: ContentfulAsset
    title: string
    description?: string
    type: string
    size?: string
    price?: number
    sizeAndPrice?: SizeAndPrice[]
    passepartout: boolean
  }
  sys: {
    id: string
    type: string
    createdAt: string
    updatedAt: string
    locale: string
    revision: number
    contentType: {
      sys: {
        id: string
        type: string
        linkType: string
      }
    }
    space: {
      sys: {
        id: string
        type: string
        linkType: string
      }
    }
    environment: {
      sys: {
        id: string
        type: string
        linkType: string
      }
    }
    publishedVersion?: number
  }
}

// A more usable, processed version of the entry
export interface GalleryPostEntry {
  fields: {
    image: ContentfulAsset
    title: string
    description?: string
    type: 'original' | 'print'
    size?: string
    price?: number
    sizeAndPrice?: Array<{
      fields: {
        size: string
        price: number
      }
      sys: {
        id: string
      }
    }>
    passepartout: boolean
  }
  sys: {
    id: string
    type: string
    createdAt: string
    updatedAt: string
    locale: string
    revision: number
    contentType: {
      sys: {
        id: string
      }
    }
    space: {
      sys: {
        id: string
      }
    }
    environment: {
      sys: {
        id: string
      }
    }
  }
}
