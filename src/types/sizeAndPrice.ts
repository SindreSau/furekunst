import type { EntryFields } from 'contentful';

// Content type fields
export interface SizeAndPriceFields {
    size: EntryFields.Text;
    price: EntryFields.Integer;
}

// Simplified entry type focusing only on fields
export interface SizeAndPriceEntry {
    fields: SizeAndPriceFields;
}

// Type for use with getEntries
export interface SizeAndPriceCollection {
    items: SizeAndPriceEntry[];
}
