import {
  normalizeKeywords,
  type StickerTemplateItem,
} from "../templateDefinition";

/**
 * Tea, shade and sparkle's item catalog: labels and keywords straight from
 * spec section 6.3, in table order. Every item also carries the keyword
 * `tea` / `chá`, appended before normalization so a duplicate in the table
 * collapses into one entry.
 */

interface TeaItemSource {
  id: string;
  labelEn: string;
  labelPt: string;
  keywordsEn: readonly string[];
  keywordsPt: readonly string[];
}

const TEA_ITEM_SOURCES: readonly TeaItemSource[] = [
  {
    id: "spill-the-tea",
    labelEn: "Spill the tea",
    labelPt: "Conta tudo",
    keywordsEn: ["spill the tea", "gossip", "tell me", "tea"],
    keywordsPt: ["cusquice", "fofoca", "babado", "conta tudo", "chá"],
  },
  {
    id: "throwing-shade",
    labelEn: "Throwing shade",
    labelPt: "Indireta",
    keywordsEn: ["shade", "throwing shade", "sunglasses", "and i oop"],
    keywordsPt: ["shade", "indireta", "óculos de sol", "sombra"],
  },
  {
    id: "sparkles",
    labelEn: "Sparkles",
    labelPt: "Brilho",
    keywordsEn: ["sparkles", "yas", "slay", "sparkle"],
    keywordsPt: ["brilho", "arrasou", "brilhante", "yas"],
  },
  {
    id: "mother",
    labelEn: "Mother",
    labelPt: "Mãe",
    keywordsEn: ["mother", "queen", "crown", "iconic"],
    keywordsPt: ["mãe", "rainha", "coroa", "icónique", "icónica"],
  },
  {
    id: "receipts",
    labelEn: "Receipts",
    labelPt: "Provas",
    keywordsEn: ["receipts", "proof", "screenshots", "evidence"],
    keywordsPt: ["provas", "prints", "recibos", "evidências"],
  },
  {
    id: "watching",
    labelEn: "Watching the drama",
    labelPt: "A ver o drama",
    keywordsEn: ["popcorn", "drama", "watching", "eyes"],
    keywordsPt: ["pipocas", "drama", "a ver", "olhos"],
  },
  {
    id: "unbothered",
    labelEn: "Unbothered",
    labelPt: "Tranquile",
    keywordsEn: ["nails", "unbothered", "nail polish", "no notes"],
    keywordsPt: ["unhas", "tranquile", "verniz", "zero stress"],
  },
  {
    id: "mwah",
    labelEn: "Mwah",
    labelPt: "Beijinhos",
    keywordsEn: ["kiss", "mwah", "lips", "kisses"],
    keywordsPt: ["beijo", "beijinhos", "lábios", "muah"],
  },
  {
    id: "ate",
    labelEn: "Ate",
    labelPt: "Arrasou",
    keywordsEn: ["ate", "no crumbs", "left no crumbs", "served"],
    keywordsPt: ["arrasou", "comeu tudo", "sem migalhas", "serviu"],
  },
  {
    id: "the-walk",
    labelEn: "The walk",
    labelPt: "O desfile",
    keywordsEn: ["heels", "strut", "walk", "walking out", "runway"],
    keywordsPt: ["saltos", "desfile", "passerelle", "a sair"],
  },
  {
    id: "lets-dance",
    labelEn: "Let's dance",
    labelPt: "Bora dançar",
    keywordsEn: ["disco", "dance", "party", "lets dance"],
    keywordsPt: ["disco", "dançar", "bora dançar", "festa"],
  },
  {
    id: "fan-clack",
    labelEn: "Fan clack",
    labelPt: "Leque",
    keywordsEn: ["fan", "clack", "drama", "the drama"],
    keywordsPt: ["leque", "drama", "clack"],
  },
];

export const TEA_ITEMS: readonly StickerTemplateItem[] = TEA_ITEM_SOURCES.map(
  (source) => ({
    id: source.id,
    label: { en: source.labelEn, pt: source.labelPt },
    keywords: {
      en: normalizeKeywords([...source.keywordsEn, "tea"]),
      pt: normalizeKeywords([...source.keywordsPt, "chá"]),
    },
  }),
);
