import { type ReactNode } from "react";

export type TypeKind = "" | "essential" | "med" | "local";

export interface Term {
  name: string;
  type: string;
  /**
   * Portuguese chip label carried by the demo mock only. Live terms leave it
   * unset and the chip resolves through {@link GLOSSARY_CATEGORY_KEYS}: the
   * backend's `category` column is one free-form English label, so a live term
   * has no Portuguese label to send (PRD-267).
   */
  typePt?: string;
  typeKind: TypeKind;
  def: ReactNode;
  defPt: ReactNode;
  meta?: ReactNode;
  metaPt?: ReactNode;
  search: string;
}
export interface LetterBlock {
  letter: string;
  terms: Term[];
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Catalog keys for the glossary's category chips, keyed by the English label
 * the backend stores in `GlossaryTerm.category`.
 *
 * The column is documented as free-form, but every seeded value comes from
 * this closed set, and a category label is UI chrome rather than content: it
 * belongs in the catalog, not in the API payload. A category outside the set
 * falls back to its English label, which is honest rather than a chip reading
 * as a missing translation.
 */
export const GLOSSARY_CATEGORY_KEYS: Record<string, string> = {
  Essential: "resources:glossary.category.essential",
  Healthcare: "resources:glossary.category.healthcare",
  Identity: "resources:glossary.category.identity",
  "Identity · contested": "resources:glossary.category.identityContested",
  Lisbon: "resources:glossary.category.lisbon",
  Performance: "resources:glossary.category.performance",
  "Portuguese · in-community":
    "resources:glossary.category.portugueseInCommunity",
  "QueerPulse · platform": "resources:glossary.category.queerpulsePlatform",
};

/** The catalog key for a category label, or undefined when it is off the
 *  closed set above (a curator can type anything into the admin console). */
export function glossaryCategoryKey(category: string): string | undefined {
  return GLOSSARY_CATEGORY_KEYS[category];
}

/** UI copy in both languages, toggled with the EN/PT switch. */
export const GLOSSARY_COPY = {
  en: {
    eyebrow: "Reference · maintained by Trans Hub & Wellbeing",
    searchPlaceholder: "Search terms · 142 entries",
    noResultsTitle: "No terms match",
    noResultsBody: "Try a different search, or browse alphabetically above.",
    suggestTerm: "Suggest a term",
    suggestEdit: "Suggest an edit",
    footTitle: (
      <>
        Found a term we're <em>missing or wrong about?</em>
      </>
    ),
  },
  pt: {
    eyebrow: "Referência · mantido pelo Trans Hub & Bem-estar",
    searchPlaceholder: "Pesquisar termos · 142 entradas",
    noResultsTitle: "Nenhum termo corresponde",
    noResultsBody:
      "Tenta uma pesquisa diferente, ou navega alfabeticamente acima.",
    suggestTerm: "Sugerir um termo",
    suggestEdit: "Sugerir uma alteração",
    footTitle: (
      <>
        Falta um termo ou <em>dissemos algo errado?</em>
      </>
    ),
  },
} as const;
