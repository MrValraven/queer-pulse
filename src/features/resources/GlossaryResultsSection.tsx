import { FiArrowRight } from "react-icons/fi";
import styles from "./GlossaryPage.module.css";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { ALPHABET, type LetterBlock } from "./glossary.data";
import { GlossaryTermBlocks, type Lang } from "./GlossaryTermBlocks";
import { GlossarySkeleton } from "./GlossarySkeleton";

interface GlossaryResultsSectionProps {
  lettersWithTerms: Set<string>;
  loading: boolean;
  hasGlossaryError: boolean;
  allBlocksCount: number;
  onRetryGlossary: () => void;
  loadErrorBody: string;
  blocks: LetterBlock[];
  lang: Lang;
  isEmptyResult: boolean;
  noResultsTitle: string;
  noResultsBody: string;
  suggestTermLabel: string;
  onSuggestNewTerm: () => void;
}

/** The glossary's body: the A-Z jump nav, the loading skeleton, a load-error
 *  retry state, the term blocks themselves, and the "no terms match" empty
 *  state with its "suggest a term" CTA. */
export function GlossaryResultsSection({
  lettersWithTerms,
  loading,
  hasGlossaryError,
  allBlocksCount,
  onRetryGlossary,
  loadErrorBody,
  blocks,
  lang,
  isEmptyResult,
  noResultsTitle,
  noResultsBody,
  suggestTermLabel,
  onSuggestNewTerm,
}: GlossaryResultsSectionProps) {
  return (
    <div className={styles.body}>
      <div className={styles.alphabet}>
        {ALPHABET.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className={lettersWithTerms.has(letter) ? styles.has : styles.no}
          >
            {letter}
          </a>
        ))}
      </div>

      {loading && <GlossarySkeleton />}

      {/* A failed term fetch used to render as an alphabet with nothing
          under it, which reads as an empty glossary. It now says the
          glossary did not load and offers a retry (DES-22). */}
      {!loading && hasGlossaryError && allBlocksCount === 0 && (
        <LoadErrorState
          onRetry={onRetryGlossary}
          title={
            <Translation
              i18nKey="resources:glossary.loadError.title"
              components={{ em: <em /> }}
            />
          }
          description={loadErrorBody}
        />
      )}

      {!loading && <GlossaryTermBlocks blocks={blocks} lang={lang} />}

      {isEmptyResult && (
        <div className={styles.noResults}>
          <h3>{noResultsTitle}</h3>
          <p>{noResultsBody}</p>
          <Button variant="primary" onClick={onSuggestNewTerm}>
            {suggestTermLabel} <FiArrowRight aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
