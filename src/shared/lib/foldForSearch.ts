/**
 * Folds text for a client-side search match: NFD splits each accented letter
 * into its base letter plus a combining mark, the marks come off, and the rest
 * is lower cased. Apply it to both the typed term and the field it is compared
 * with, so demo-mode filters match the way the backend's accent-folded search
 * does ("Principe" finds "Príncipe", "sao" finds "São").
 */
export function foldForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
