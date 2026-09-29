import styles from "./GlossaryPage.module.css";
import type { Lang } from "./GlossaryTermBlocks";

interface GlossarySearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

/** The glossary's sticky search row: the term filter input and the EN/PT
 *  term-language toggle, which flips GlossaryPage's own copy independently
 *  of the site locale. */
export function GlossarySearchBar({
  query,
  onQueryChange,
  searchPlaceholder,
  searchAriaLabel,
  lang,
  onLangChange,
}: GlossarySearchBarProps) {
  return (
    <div className={styles.searchRow}>
      <div className={styles.searchInner}>
        <div className={styles.searchInput}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <div className={styles.langToggle}>
          <button
            type="button"
            className={lang === "en" ? styles.langActive : undefined}
            aria-pressed={lang === "en"}
            onClick={() => onLangChange("en")}
          >
            {/* eslint-disable-line local/no-literal-string -- a language's own name is never translated (this toggles GLOSSARY_COPY's own term-language, which starts on the site locale and can then be flipped) */}
            English
          </button>
          <button
            type="button"
            className={lang === "pt" ? styles.langActive : undefined}
            aria-pressed={lang === "pt"}
            onClick={() => onLangChange("pt")}
          >
            {/* eslint-disable-line local/no-literal-string -- a language's own name is never translated (this toggles GLOSSARY_COPY's own term-language, which starts on the site locale and can then be flipped) */}
            Português
          </button>
        </div>
      </div>
    </div>
  );
}
