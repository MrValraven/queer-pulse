import { FadeIn } from "../../shared/components/ui";
import type { LetterBlock, TypeKind } from "./glossary.data";
import styles from "./GlossaryPage.module.css";

/** Which term-language `GlossaryPage` is showing — independent of the site locale. */
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
                    {lang === "pt" ? term.typePt : term.type}
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
