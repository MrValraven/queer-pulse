import { FadeIn } from "../../shared/components/ui";
import { type LetterBlock } from "./glossary.data";
import { GlossaryTermCard, type Lang } from "./GlossaryTermCard";
import styles from "./GlossaryPage.module.css";

export type { Lang } from "./GlossaryTermCard";

/**
 * The glossary's grouped, 2-column term list: one anchored block per letter,
 * each holding its filtered terms. Rendering lives here so `GlossaryPage`
 * keeps to its hero, search row and footer chrome; each term's cell is
 * `GlossaryTermCard`, shared with the admin console's preview.
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
      {blocks.map((block, blockIndex) => (
        <FadeIn
          as="div"
          className={styles.letterBlock}
          id={block.letter}
          key={block.letter}
          delay={Math.min(blockIndex, 8) * 60}
        >
          <div className={styles.letterH}>{block.letter}</div>
          <div className={styles.termList}>
            {block.terms.map((term) => (
              <GlossaryTermCard key={term.name} term={term} lang={lang} />
            ))}
          </div>
        </FadeIn>
      ))}
    </>
  );
}
