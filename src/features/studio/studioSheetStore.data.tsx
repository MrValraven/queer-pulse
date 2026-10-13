import type { TranslateOptions } from "../../shared/i18n/types";

/** Pages in the demo lead sheet: feeds the spec chips and the checkout line. */
export const SHEET_PAGE_COUNT = 4;

/** A spec chip under the sheet title. Pattern A: a catalog key plus values. */
export interface SheetSpec {
  id: string;
  labelKey: string;
  values?: TranslateOptions;
}

export const SPECS: SheetSpec[] = [
  { id: "scoring", labelKey: "studioShowcase:sheetStore.spec.scoring" },
  { id: "key", labelKey: "studioShowcase:sheetStore.spec.key" },
  { id: "lyrics", labelKey: "studioShowcase:sheetStore.spec.lyrics" },
  {
    id: "pages",
    labelKey: "studioShowcase:sheetStore.spec.pages",
    values: { count: SHEET_PAGE_COUNT },
  },
  { id: "format", labelKey: "studioShowcase:sheetStore.spec.format" },
];

/** Content: this specific work's title, composer and album; proper nouns, literal in both languages. */
export const SHEET_TITLE = "Carta para a santa";
export const SHEET_COMPOSER = "Mariana Sol";
export const SHEET_ALBUM = "Cidade dos santos";
export const SHEET_TRANSCRIBER = "Teresa Rocha";

/** Money: always formatted through useFormat().currency() at render. */
export const SHEET_PRICE = 1;
export const SHEET_PROCESSING_FEE = 0.04;
export const SHEET_SPLIT_RATIO = "90/10";

export const SHEET_SPLIT_SHARES = {
  transcriber: 0.55,
  composer: 0.35,
  coop: 0.1,
};

export const PAY_METHODS: {
  labelKey: string;
  subKey: string;
  detail?: string;
}[] = [
  {
    labelKey: "studio:sheet.checkout.payMethod.card.label",
    subKey: "studio:sheet.checkout.payMethod.card.sub",
    detail: "Visa ·· 4291",
  },
  {
    labelKey: "studio:sheet.checkout.payMethod.sepa.label",
    subKey: "studio:sheet.checkout.payMethod.sepa.sub",
  },
];

export const scoreCoverImage =
  "https://images.unsplash.com/photo-1591025810539-a321000cda85?q=80&w=600&auto=format&fit=crop";

export interface SplitRow {
  color: string;
  name: string;
  roleKey?: string;
  amount: number;
}

export const SPLIT: SplitRow[] = [
  {
    color: "var(--jade-light)",
    name: SHEET_TRANSCRIBER,
    roleKey: "studio:sheet.checkout.role.transcriber",
    amount: SHEET_SPLIT_SHARES.transcriber,
  },
  {
    color: "var(--accent)",
    name: SHEET_COMPOSER,
    roleKey: "studio:sheet.checkout.role.composer",
    amount: SHEET_SPLIT_SHARES.composer,
  },
  {
    color: "rgba(247,243,238,.3)",
    name: "",
    amount: SHEET_SPLIT_SHARES.coop,
  },
];

/**
 * More sheets from the same transcriber. Titles and credits are proper nouns;
 * the arrangement after the credit is a catalog key.
 */
export const ALSO: {
  pre: string;
  em: string;
  who: string;
  formatKey: string;
  price?: number;
  tint: "plum" | "jade" | "coral";
  image?: string;
}[] = [
  {
    pre: "A ",
    em: "Beja",
    who: "Mariana Sol",
    formatKey: "studioShowcase:sheetStore.also.format.piano",
    price: 1,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1717699841849-98dcc1c6184a?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Cantiga para a ",
    em: "vizinha",
    who: "Coro de Outubro",
    formatKey: "studioShowcase:sheetStore.also.format.satb",
    price: 1,
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1453906971074-ce568cccbc63?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "The first ",
    em: "Sunday",
    who: "Helena P.",
    formatKey: "studioShowcase:sheetStore.also.format.leadSheet",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1485688809171-248861015a63?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Salt water, ",
    em: "slowly",
    who: "Akin Diallo",
    formatKey: "studioShowcase:sheetStore.also.format.guitarTab",
    price: 1,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop",
  },
];
