import type { Asset, Entry, EntryFields } from 'contentful';

// Custom Asset type to match Contentful's structure
interface ContentfulAsset extends Asset {
    fields: {
        title: string;
        description: string;
        file: {
            url: string;
            details: {
                size: number;
                image?: {
                    width: number;
                    height: number;
                };
            };
            fileName: string;
            contentType: string;
        };
    };
}

interface SizeAndPriceFields {
    fields: {
        size: EntryFields.Symbol;
        price: EntryFields.Integer;
    };
    contentTypeId: 'sizeAndPrice';
}

interface SizeAndPrice extends Entry<SizeAndPriceFields> {
    contentTypeId: 'sizeAndPrice';
}

interface GalleryPostFields {
    fields: {
        image: ContentfulAsset;
        title: EntryFields.Symbol;
        description?: EntryFields.Text;
        type: EntryFields.Symbol;
        size?: EntryFields.Symbol;
        price?: EntryFields.Integer;
        sizeAndPrice?: SizeAndPrice[];
        passepartout: EntryFields.Boolean;
    };
    contentTypeId: 'galleryPost';
}

export interface IGalleryPost extends Entry<GalleryPostFields> {
    contentTypeId: 'galleryPost';
}

export interface GalleryPostEntry {
    fields: {
        image: ContentfulAsset;
        title: string;
        description?: string;
        type: 'original' | 'print';
        size?: string;
        price?: number;
        sizeAndPrice?: Array<{
            fields: {
                size: string;
                price: number;
            };
        }>;
        passepartout: boolean;
    };
    contentTypeId: 'galleryPost';
    sys: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
        locale: string;
        revision: number;
    };
}
