import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { DiffSegment } from "./restoreDiff.types";
import styles from "./RestoreDiff.module.css";

/**
 * A word diff read inline, as one paragraph: what stays is plain text, what
 * bringing the saved copy back would take out is struck through, and what it
 * would put in is tinted.
 *
 * Screen readers announce neither `<del>` nor `<ins>`, so each run carries a
 * hidden "removed:" or "added:" ahead of its words. Without it the paragraph
 * would be read aloud with both versions run together as one sentence.
 */
export function RestoreDiffText({ segments }: { segments: DiffSegment[] }) {
  const { t } = useTranslation();
  const removedPrefix = t(
    "marketing:listBusiness.editor.restore.review.removedPrefix",
  );
  const addedPrefix = t(
    "marketing:listBusiness.editor.restore.review.addedPrefix",
  );

  return (
    <p className={styles.diffText}>
      {segments.map((segment, position) => {
        // A diff never reorders, so a run's position is its identity.
        const segmentKey = `${position}-${segment.kind}`;
        if (segment.kind === "removed") {
          return (
            <del key={segmentKey} className={styles.removedRun}>
              <span className="visuallyHidden">{removedPrefix} </span>
              {segment.text}
            </del>
          );
        }
        if (segment.kind === "added") {
          return (
            <ins key={segmentKey} className={styles.addedRun}>
              <span className="visuallyHidden">{addedPrefix} </span>
              {segment.text}
            </ins>
          );
        }
        return <span key={segmentKey}>{segment.text}</span>;
      })}
    </p>
  );
}
