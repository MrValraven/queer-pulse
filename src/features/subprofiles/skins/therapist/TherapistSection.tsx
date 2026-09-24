import { useId, type ReactNode } from "react";
import styles from "./therapistShared.module.css";
import { renderEmphasis } from "./renderEmphasis";
import { TherapistEditLink } from "./TherapistEditLink";
import type { TherapistEditTarget } from "./therapistEditLinks.data";

interface TherapistSectionProps {
  /** Eyebrow above the heading, e.g. "What Sofia can help with". */
  label: string;
  /** Serif h2. `*word*` renders as coral italic. */
  heading: string;
  /** Right-hand slot beside the heading (a stamp, a link). */
  aside?: ReactNode;
  /** Where the owner edits this section; renders an "Edit" link in the
   *  head, beside `aside`, in owner mode only. */
  editTarget?: TherapistEditTarget;
  id?: string;
  children: ReactNode;
}

/** One therapist-profile section card: eyebrow, serif h2, body. */
export function TherapistSection({
  label,
  heading,
  aside,
  editTarget,
  id,
  children,
}: TherapistSectionProps) {
  const headingId = useId();
  const editLink = editTarget ? (
    <TherapistEditLink target={editTarget} />
  ) : null;
  return (
    <section className={styles.section} id={id} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <div className={styles.headMain}>
          <p className={styles.label}>{label}</p>
          <h2 id={headingId} className={styles.heading}>
            {renderEmphasis(heading)}
          </h2>
        </div>
        {aside && editLink ? (
          <div className={styles.headAside}>
            {aside}
            {editLink}
          </div>
        ) : (
          (aside ?? editLink)
        )}
      </div>
      {children}
    </section>
  );
}

interface TherapistSubBlockProps {
  /** Eyebrow for the block, e.g. "Also speaks the language of". */
  label: string;
  /** Where the owner edits this block; an "Edit" link at the eyebrow's
   *  end, in owner mode only. */
  editTarget?: TherapistEditTarget;
  children: ReactNode;
}

/** A block inside a section, set off by a top hairline and its own eyebrow. */
export function TherapistSubBlock({
  label,
  editTarget,
  children,
}: TherapistSubBlockProps) {
  return (
    <div className={styles.sub}>
      <p
        className={
          editTarget ? `${styles.label} ${styles.labelWithEdit}` : styles.label
        }
      >
        <span>{label}</span>
        {editTarget && <TherapistEditLink target={editTarget} />}
      </p>
      {children}
    </div>
  );
}

/** Quiet small print under a section's content. */
export function TherapistNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
