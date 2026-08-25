import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { IssueSummary } from "../data/desk.data";
import styles from "./AssignIssueModal.module.css";

/** Sentinel for the "no issue" choice. An empty string cannot collide with a
 *  real issue number, which is always at least two digits. */
const UNASSIGNED_VALUE = "";

export interface AssignIssueModalProps {
  /** How many pieces this assignment will move — drives the confirm label so
   *  a bulk assign says how big it is before it runs. */
  pieceCount: number;
  /** Title of the single piece being moved, when there is exactly one. */
  pieceTitle?: string;
  issues: IssueSummary[];
  /** Id of the issue these pieces are on now, or `null` when unassigned.
   *  Pre-selects the current choice and marks it so an editor can see where
   *  the piece already sits before moving it. */
  currentIssueId: string | null;
  onClose: () => void;
  onAssign: (target: { id: string; number: string } | null) => void;
}

/**
 * Picks the issue a piece (or a whole bulk selection) belongs to. One modal
 * serves both the row action and the bulk bar, so "which issue does this run
 * in?" is answered the same way regardless of how many pieces are in hand.
 *
 * A modal rather than an inline dropdown on purpose: the pipeline's row
 * actions live inside `.pieces`, which is `overflow: hidden`, so a popover
 * anchored in a row would be clipped by the table's own rounded box. The
 * shared `Modal` portals to `<body>` and sidesteps that entirely.
 */
export function AssignIssueModal({
  pieceCount,
  pieceTitle,
  issues,
  currentIssueId,
  onClose,
  onAssign,
}: AssignIssueModalProps) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<string>(
    issues.find((issue) => issue.id === currentIssueId)?.number ??
      UNASSIGNED_VALUE,
  );

  const confirm = () => {
    const target = issues.find((issue) => issue.number === choice);
    onAssign(target ? { id: target.id, number: target.number } : null);
    onClose();
  };

  const options: {
    value: string;
    label: string;
    meta: string;
    isCurrent: boolean;
  }[] = [
    ...issues.map((issue) => ({
      value: issue.number,
      label: t("magazine:desk.assignIssue.issueOption", {
        number: issue.number,
        title: issue.title,
      }),
      meta: t("magazine:desk.assignIssue.issueOptionMeta", {
        filled: issue.filled,
        slots: issue.slots,
      }),
      isCurrent: issue.id === currentIssueId,
    })),
    {
      value: UNASSIGNED_VALUE,
      label: t("magazine:desk.assignIssue.unassignedOption"),
      meta: t("magazine:desk.assignIssue.unassignedOptionMeta"),
      isCurrent: currentIssueId === null,
    },
  ];

  return (
    <Modal
      title={t("magazine:desk.assignIssue.title")}
      sub={
        pieceCount === 1 && pieceTitle
          ? pieceTitle
          : t("magazine:desk.assignIssue.subPieces", { count: pieceCount })
      }
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button variant="primary" onClick={confirm}>
            {t("magazine:desk.assignIssue.confirm", { count: pieceCount })}
          </Button>
        </div>
      }
    >
      <div
        className={styles.options}
        role="radiogroup"
        aria-label={t("magazine:desk.assignIssue.title")}
      >
        {options.map((option) => (
          <button
            key={option.value || "unassigned"}
            type="button"
            role="radio"
            aria-checked={choice === option.value}
            className={styles.option}
            data-selected={choice === option.value}
            onClick={() => setChoice(option.value)}
          >
            <span className={styles.optionMark} aria-hidden>
              {choice === option.value && <FiCheck />}
            </span>
            <span className={styles.optionText}>
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionMeta}>
                {option.meta}
                {option.isCurrent && (
                  <> · {t("magazine:desk.assignIssue.currentSuffix")}</>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
