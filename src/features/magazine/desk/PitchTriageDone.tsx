import type { RefObject } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Button, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PitchTriage.module.css";

export interface PitchTriageDoneProps {
  /** "answered" once this opening cleared its pitches; "empty" when it
   *  opened on an inbox with nothing waiting. */
  variant: "answered" | "empty";
  /** Takes focus when the queue runs out, so the end is announced. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  onClose: () => void;
}

/**
 * The end of the queue. The success line is kept for an editor who actually
 * answered pitches here; an inbox that was empty from the start gets a plain
 * line instead. A close button sits right under either, so the editor leaves
 * in one step.
 */
export function PitchTriageDone({
  variant,
  headingRef,
  onClose,
}: PitchTriageDoneProps) {
  const { t } = useTranslation();
  const isAnswered = variant === "answered";
  return (
    <div className={styles.done}>
      {isAnswered ? (
        <FiCheckCircle className={styles.doneIcon} aria-hidden />
      ) : null}
      <h4 ref={headingRef} tabIndex={-1} className={styles.doneTitle}>
        {isAnswered
          ? t("magazine:desk.triage.doneTitle")
          : t("magazine:desk.triage.emptyTitle")}
      </h4>
      {isAnswered ? (
        <p className={styles.doneBody}>{t("magazine:desk.triage.doneBody")}</p>
      ) : null}
      <Button variant="ghost" onClick={onClose}>
        {t("magazine:desk.triage.close")}
      </Button>
    </div>
  );
}

/**
 * Stands in for the pitch while the inbox loads: a title and two note lines
 * in shimmer. The shimmer is hidden from screen readers, which hear one
 * status line instead.
 */
export function PitchTriageLoading() {
  const { t } = useTranslation();
  return (
    <div>
      <p role="status" className="visuallyHidden">
        {t("magazine:desk.triage.loading")}
      </p>
      <div className={styles.loading} aria-hidden="true">
        <SkeletonLine height={30} width="70%" />
        <SkeletonLine height={14} />
        <SkeletonLine height={14} width="55%" />
      </div>
    </div>
  );
}
