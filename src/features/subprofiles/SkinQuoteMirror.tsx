import type { Ref } from "react";
import { splitQuoteSegments } from "./quoteEmphasis";
import styles from "./SkinQuoteControl.module.css";

/**
 * One emphasised span as the mirror draws it: faded asterisks around coral
 * italic words, all plain inline text. Both layers set the upright-only
 * Fraunces alias, so the italic here is an oblique the browser synthesises
 * from the upright glyphs: same advances, same break points, and every
 * drawn glyph stays over the textarea's caret.
 */
function EmphasisWords({ words }: { words: string }) {
  return (
    <em className={styles.emphasis}>
      <span className={styles.asterisk}>*</span>
      {words}
      <span className={styles.asterisk}>*</span>
    </em>
  );
}

/**
 * The drawn text of the refined quote field: the same string as the
 * textarea it covers, set in the same type and box, with `*word*` shown as
 * the page will show it. The textarea's own text is transparent, so the
 * caret, selection and spellcheck come from the textarea and the letters
 * from here. `aria-hidden`: the textarea already holds the words.
 */
export function SkinQuoteMirror({
  value,
  mirrorRef,
}: {
  value: string;
  mirrorRef: Ref<HTMLDivElement>;
}) {
  const segments = splitQuoteSegments(value);
  return (
    <div
      ref={mirrorRef}
      aria-hidden
      translate="no"
      className={`${styles.type} ${styles.mirror}`}
    >
      {segments.map((segment, index) =>
        segment.isEmphasis ? (
          <EmphasisWords key={index} words={segment.text} />
        ) : (
          segment.text
        ),
      )}
      {/* A trailing line break needs a character after it, or the mirror's
          last empty line collapses and the text above it shifts. */}
      {value.endsWith("\n") && "\u200B"}
    </div>
  );
}
