import {
  normalizeKeywords,
  type StickerTemplateItem,
} from "../templateDefinition";

/**
 * Blip's item catalog: labels and keywords straight from spec section 5.5,
 * in table order (also the pack's item order; the cover sticker is `hi`).
 * Labels use gender-neutral Portuguese (linguagem neutra); keywords also
 * carry the common gendered spellings, since people search the way they
 * type. Every item also carries the keyword `blip` in both languages,
 * appended before normalization so a duplicate in the table collapses into
 * one entry.
 */

interface BlipItemSource {
  id: string;
  labelEn: string;
  labelPt: string;
  keywordsEn: readonly string[];
  keywordsPt: readonly string[];
}

const BLIP_ITEM_SOURCES: readonly BlipItemSource[] = [
  {
    id: "hi",
    labelEn: "Blip says hi",
    labelPt: "Blip diz olá",
    keywordsEn: ["hi", "hello", "hey", "wave", "welcome"],
    keywordsPt: ["olá", "oi", "bom dia", "boas-vindas", "acenar"],
  },
  {
    id: "yay",
    labelEn: "Blip cheers",
    labelPt: "Blip celebra",
    keywordsEn: ["yay", "great news", "happy", "excited", "woohoo"],
    keywordsPt: ["boa", "iupi", "fixe", "contente", "boa notícia"],
  },
  {
    id: "crying-laughing",
    labelEn: "Blip crying laughing",
    labelPt: "Blip a chorar a rir",
    keywordsEn: ["lol", "haha", "laughing", "crying laughing", "lmao"],
    keywordsPt: ["ahah", "ahahah", "rir", "a chorar a rir", "kkk"],
  },
  {
    id: "love",
    labelEn: "Blip in love",
    labelPt: "Blip apaixonade",
    keywordsEn: ["love", "heart eyes", "crush", "adore"],
    keywordsPt: [
      "amor",
      "adoro",
      "paixão",
      "coração",
      "apaixonade",
      "apaixonado",
      "apaixonada",
    ],
  },
  {
    id: "shocked",
    labelEn: "Blip shocked",
    labelPt: "Blip em choque",
    keywordsEn: ["shocked", "wait what", "omg", "surprised"],
    keywordsPt: ["choque", "o quê", "meu deus", "surpresa"],
  },
  {
    id: "side-eye",
    labelEn: "Blip side-eye",
    labelPt: "Blip de lado",
    keywordsEn: ["side-eye", "really", "sus", "suspicious", "judging"],
    keywordsPt: ["olhar de lado", "a sério", "desconfiade", "suspeito"],
  },
  {
    id: "sad",
    labelEn: "Blip sad",
    labelPt: "Blip triste",
    keywordsEn: ["sad", "miss you", "oh no", "crying"],
    keywordsPt: ["triste", "saudades", "oh não", "chorar"],
  },
  {
    id: "hug",
    labelEn: "Blip hug",
    labelPt: "Blip abraço",
    keywordsEn: ["hug", "support", "care", "thanks"],
    keywordsPt: ["abraço", "apoio", "carinho", "obrigade"],
  },
  {
    id: "thinking",
    labelEn: "Blip thinking",
    labelPt: "Blip a pensar",
    keywordsEn: ["thinking", "hmm", "not sure", "wondering"],
    keywordsPt: ["a pensar", "hmm", "não sei", "dúvida"],
  },
  {
    id: "sleepy",
    labelEn: "Blip sleepy",
    labelPt: "Blip com sono",
    keywordsEn: ["sleepy", "good night", "tired", "bed"],
    keywordsPt: ["sono", "boa noite", "cansade", "cansado", "cansada", "cama"],
  },
  {
    id: "shy",
    labelEn: "Blip shy",
    labelPt: "Blip envergonhade",
    keywordsEn: ["shy", "aww", "blush", "flattered"],
    keywordsPt: [
      "tímide",
      "envergonhade",
      "envergonhado",
      "envergonhada",
      "ai",
      "corar",
    ],
  },
  {
    id: "sipping-tea",
    labelEn: "Blip sipping tea",
    labelPt: "Blip a beber chá",
    keywordsEn: ["tea", "unbothered", "spill it", "gossip"],
    keywordsPt: ["chá", "tranquile", "conta tudo", "cusquice"],
  },
  {
    id: "thank-you",
    labelEn: "Blip thank you",
    labelPt: "Blip obrigade",
    keywordsEn: ["thank you", "thanks", "grateful", "ty"],
    keywordsPt: ["obrigade", "obrigado", "obrigada", "grate"],
  },
  {
    id: "sorry",
    labelEn: "Blip sorry",
    labelPt: "Blip desculpa",
    keywordsEn: ["sorry", "my bad", "oops", "apologies"],
    keywordsPt: ["desculpa", "foi mal", "ups", "perdão"],
  },
  {
    id: "hmph",
    labelEn: "Blip hmph",
    labelPt: "Blip amuade",
    keywordsEn: ["hmph", "annoyed", "grumpy", "not amused"],
    keywordsPt: ["hmpf", "chateade", "amuade", "irritade"],
  },
  {
    id: "party",
    labelEn: "Blip party",
    labelPt: "Blip festa",
    keywordsEn: ["party", "celebrate", "lets go", "confetti"],
    keywordsPt: ["festa", "bora", "celebrar", "confetes"],
  },
  {
    id: "proud",
    labelEn: "Blip proud",
    labelPt: "Blip orgulhose",
    keywordsEn: ["proud", "pride", "look at us", "confident"],
    keywordsPt: ["orgulho", "orgulhose", "orgulhoso", "orgulhosa", "confiante"],
  },
  {
    id: "fan-clack",
    labelEn: "Blip fan clack",
    labelPt: "Blip leque",
    keywordsEn: ["fan", "clack", "drama", "yes and"],
    keywordsPt: ["leque", "drama", "e então"],
  },
  {
    id: "shrug",
    labelEn: "Blip shrug",
    labelPt: "Blip encolhe os ombros",
    keywordsEn: ["shrug", "whatever", "who knows", "idk"],
    keywordsPt: ["sei lá", "tanto faz", "quem sabe", "encolher os ombros"],
  },
  {
    id: "on-my-way",
    labelEn: "Blip on the way",
    labelPt: "Blip a caminho",
    keywordsEn: ["on my way", "coming", "omw", "running late"],
    keywordsPt: ["a caminho", "vou já", "já vou", "atrasade"],
  },
  {
    id: "home-safe",
    labelEn: "Blip home safe",
    labelPt: "Blip em casa",
    keywordsEn: ["home safe", "got home", "home", "safe"],
    keywordsPt: ["cheguei", "em casa", "cheguei bem", "casa"],
  },
  {
    id: "melting",
    labelEn: "Blip melting",
    labelPt: "Blip a derreter",
    keywordsEn: ["melting", "hot", "heat", "summer"],
    keywordsPt: ["a derreter", "calor", "verão", "quente"],
  },
];

export const BLIP_ITEMS: readonly StickerTemplateItem[] = BLIP_ITEM_SOURCES.map(
  (source) => ({
    id: source.id,
    label: { en: source.labelEn, pt: source.labelPt },
    keywords: {
      en: normalizeKeywords([...source.keywordsEn, "blip"]),
      pt: normalizeKeywords([...source.keywordsPt, "blip"]),
    },
  }),
);
