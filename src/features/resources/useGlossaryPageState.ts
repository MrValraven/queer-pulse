import { isValidElement, useMemo, useState, type ReactNode } from "react";
import { useSimulatedLoad } from "../../shared/hooks";
import { GLOSSARY_COPY } from "./glossary.data";
import { useGlossaryData } from "./api/useGlossaryData";
import type { Lang } from "./GlossaryTermBlocks";

/** Which structured intake a glossary CTA opens. Both land on
 *  `POST /intakes/suggest_edit`, and the `context` tag is what tells a curator
 *  whether they are being asked to add a term or to correct one (PRD-264). */
export type SuggestionIntent = "newTerm" | "edit";

/**
 * Recursively flattens a term's ReactNode definition (which may embed <em>,
 * <b>, and cross-reference <Link> elements) down to plain text, so the
 * glossary's existing term data can feed a schema.org FAQPage without
 * hand-duplicating the definitions as separate plain-string copy.
 */
function extractPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("");
  }
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractPlainText(props.children);
  }
  return "";
}

/**
 * All the state and derived data `GlossaryPage` needs: the term-language
 * toggle (starts on the reader's own locale, then a manual flip wins from
 * then on, per PRD-267), the search query, the "suggest a term/edit" modal
 * intent, and the memoized values the page's render depends on.
 */
export function useGlossaryPageState(language: Lang) {
  const [termLanguageOverride, setTermLanguageOverride] = useState<Lang | null>(
    null,
  );
  const lang: Lang = termLanguageOverride ?? language;
  const [query, setQuery] = useState("");
  const [suggestionIntent, setSuggestionIntent] =
    useState<SuggestionIntent | null>(null);
  const {
    blocks: allBlocks,
    loading: dataLoading,
    isError: hasGlossaryError,
    refetch: refetchGlossary,
  } = useGlossaryData();
  const loading = useSimulatedLoad() || dataLoading;
  const trimmedQuery = query.trim().toLowerCase();
  const copy = GLOSSARY_COPY[lang];
  const glossaryFaqEntries = useMemo(
    () =>
      allBlocks.flatMap((block) =>
        block.terms.map((term) => ({
          question: `What does "${term.name}" mean?`,
          answer: extractPlainText(term.def),
        })),
      ),
    [allBlocks],
  );
  const lettersWithTerms = useMemo(
    () => new Set(allBlocks.map((block) => block.letter)),
    [allBlocks],
  );
  // The real term list drives the "suggest an edit" picker, so a reader points
  // at one of the 142 entries this page actually shows.
  const glossaryTermNames = useMemo(
    () => allBlocks.flatMap((block) => block.terms.map((term) => term.name)),
    [allBlocks],
  );

  const blocks = allBlocks
    .map((block) => ({
      ...block,
      terms: block.terms.filter(
        (term) =>
          !trimmedQuery ||
          term.search.includes(trimmedQuery) ||
          term.name.toLowerCase().includes(trimmedQuery),
      ),
    }))
    .filter((block) => block.terms.length > 0);

  const isEmptyResult = Boolean(trimmedQuery) && blocks.length === 0;

  return {
    lang,
    setTermLanguageOverride,
    query,
    setQuery,
    suggestionIntent,
    setSuggestionIntent,
    copy,
    glossaryFaqEntries,
    lettersWithTerms,
    glossaryTermNames,
    blocks,
    isEmptyResult,
    loading,
    hasGlossaryError,
    refetchGlossary,
    allBlocksCount: allBlocks.length,
  };
}
