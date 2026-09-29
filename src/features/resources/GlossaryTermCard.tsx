import { useTranslation } from "../../shared/i18n/useTranslation";
import { glossaryCategoryKey, type Term, type TypeKind } from "./glossary.data";
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
 * One glossary term cell: name, category chip, definition and optional
 * cross-reference line, in the chosen term language. `GlossaryTermBlocks`
 * renders one per term, and the admin glossary console reuses it so an
 * editor's preview is the public card itself.
 */
export function GlossaryTermCard({ term, lang }: { term: Term; lang: Lang }) {
  const { translateIn } = useTranslation();

  /**
   * The chip label in the term language. Live terms carry only the English
   * `category` the backend stores, so Portuguese mode resolves it through the
   * PT catalog (whatever the site language) and falls back to the mock's own
   * `typePt`, then to the English label, while that catalog loads or for a
   * category outside the closed set (PRD-267).
   */
  function categoryLabel(): string {
    if (lang === "en") return term.type;
    const categoryKey = glossaryCategoryKey(term.type);
    const translated = categoryKey ? translateIn("pt", categoryKey) : undefined;
    return translated ?? term.typePt ?? term.type;
  }

  const meta = lang === "pt" ? (term.metaPt ?? term.meta) : term.meta;

  return (
    <div className={styles.term}>
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
          {categoryLabel()}
        </span>
      </div>
      <div className={styles.termDef}>
        {lang === "pt" ? term.defPt : term.def}
      </div>
      {meta && <div className={styles.termMeta}>{meta}</div>}
    </div>
  );
}
