import { type ReactNode } from "react";

export type TypeKind = "" | "essential" | "med" | "local";

export interface Term {
  name: string;
  type: string;
  typePt: string;
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
