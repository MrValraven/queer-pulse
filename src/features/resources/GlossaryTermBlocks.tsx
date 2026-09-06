import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  glossaryCategoryKey,
  type LetterBlock,
  type TypeKind,
} from "./glossary.data";
import styles from "./GlossaryPage.module.css";

/** Which term-language `GlossaryPage` is showing. It starts on the reader's
 *  site locale and stays flippable from there (PRD-267). */
export type Lang = "en" | "pt";

const TYPE_CLASS: Record<TypeKind, string> = {
  "": "",
  essential: "typeEssential",
  med: "typeMed",
  local: "typeLocal",
};

/**
 * The glossary's grouped, 2-column term list: one anchored block per letter,
 * each holding its filtered terms. Rendering lives here so `GlossaryPage`
 * keeps to its hero, search row and footer chrome.
 */
export function GlossaryTermBlocks({
  blocks,
  lang,
}: {
  blocks: LetterBlock[];
  lang: Lang;
}) {
  const { t } = useTranslation();

  /**
   * The chip label in the term language. Live terms carry only the English
   * `category` the backend stores, so Portuguese mode resolves it through the
   * catalog and falls back to the mock's own `typePt`, then to the English
   * label for a category outside the closed set (PRD-267).
   */
  function categoryLabel(term: LetterBlock["terms"][number]): string {
    if (lang === "en") return term.type;
    const categoryKey = glossaryCategoryKey(term.type);
    if (categoryKey) return t(categoryKey);
    return term.typePt ?? term.type;
  }

  return (
    <>
      {blocks.map((b, bi) => (
        <FadeIn
          as="div"
          className={styles.letterBlock}
          id={b.letter}
          key={b.letter}
          delay={Math.min(bi, 8) * 60}
        >
          <div className={styles.letterH}>{b.letter}</div>
          <div className={styles.termList}>
            {b.terms.map((term) => (
              <div className={styles.term} key={term.name}>
                <div className={styles.termRow}>
                  <div className={styles.termName}>{term.name}</div>
                  <span
                    className={[
                      styles.termType,
                      term.typeKind && styles[TYPE_CLASS[term.typeKind]],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {categoryLabel(term)}
                  </span>
                </div>
                <div className={styles.termDef}>
                  {lang === "pt" ? term.defPt : term.def}
                </div>
                {(lang === "pt" ? (term.metaPt ?? term.meta) : term.meta) && (
                  <div className={styles.termMeta}>
                    {lang === "pt" ? (term.metaPt ?? term.meta) : term.meta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      ))}
    </>
  );
}
