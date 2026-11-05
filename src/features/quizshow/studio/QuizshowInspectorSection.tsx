import { useId, type ReactNode } from "react";
import { cx } from "../../../shared/lib/cx";
import styles from "./QuizshowStudioInspector.module.css";

interface QuizshowInspectorSectionProps {
  title: string;
  /** The heading is read by screen readers but not drawn, for a section whose one field already says it. */
  isTitleHidden?: boolean;
  /** A quiet sentence under the heading. */
  lead?: string;
  children: ReactNode;
}

/** One group of settings under a sticky heading. */
export function QuizshowInspectorSection({
  title,
  isTitleHidden = false,
  lead,
  children,
}: QuizshowInspectorSectionProps) {
  const headingId = useId();
  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={cx(styles.section, isTitleHidden && styles.isTitleHidden)}
    >
      <h3
        id={headingId}
        className={cx(
          styles.sectionHeading,
          isTitleHidden && styles.visuallyHidden,
        )}
      >
        {title}
      </h3>
      <div className={styles.sectionBody}>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
      </div>
    </div>
  );
}
