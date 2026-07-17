export const SPECS = [
  "Voice + piano",
  "Key · D minor",
  "PT lyrics",
  "4 pages",
  "PDF · A4",
];

/** Content — this specific work's title/composer/album; stays English in both modes (§1). */
export const SHEET_TITLE = "Carta para a santa";
export const SHEET_COMPOSER = "Mariana Sol";
export const SHEET_ALBUM = "Cidade dos santos";
export const SHEET_TRANSCRIBER = "Teresa Rocha";
export const SHEET_SPEC = "voice + piano · 4 pages";

/** Money — route through useFormat().currency() at render, never hand-rolled. */
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

export const ALSO: {
  pre: string;
  em: string;
  who: string;
  price?: number;
  tint: "plum" | "jade" | "coral";
  image?: string;
}[] = [
  {
    pre: "A ",
    em: "Beja",
    who: "Mariana Sol · piano",
    price: 1,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1717699841849-98dcc1c6184a?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Cantiga para a ",
    em: "vizinha",
    who: "Coro de Outubro · SATB",
    price: 1,
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1453906971074-ce568cccbc63?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "The first ",
    em: "Sunday",
    who: "Helena P. · lead sheet",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1485688809171-248861015a63?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Salt water, ",
    em: "slowly",
    who: "Akin Diallo · guitar tab",
    price: 1,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop",
  },
];
