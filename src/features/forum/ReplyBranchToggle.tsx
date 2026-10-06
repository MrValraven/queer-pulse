import type { Ref } from "react";
import { FiCornerDownRight, FiPlus } from "react-icons/fi";
import { ReplyBranchRegion } from "./ReplyBranchRegion";
import { replyBranchRowClassName } from "./replyBranchVisibility";
import styles from "./ThreadPage.module.css";

/**
 * The branch row standing in for a hidden or deferred subtree: a circled icon
 * sitting where the next reply's avatar would, with the thread line's elbow
 * running into it, then a label. Two variants:
 *   - "hidden": the branch is collapsed ("3 hidden replies"); clicking
 *     expands it again, so it reports `aria-expanded="false"`.
 *   - "continue": the indent cap is reached ("Continue this thread (4)");
 *     clicking opens the rest of the branch as one flat column.
 */
export function ReplyBranchToggle({
  variant,
  label,
  onClick,
  buttonRef,
}: {
  variant: "hidden" | "continue";
  label: string;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const BranchIcon = variant === "continue" ? FiCornerDownRight : FiPlus;
  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.branchToggle}
      aria-expanded={variant === "hidden" ? false : undefined}
      onClick={onClick}
    >
      <span className={styles.branchToggleCircle} aria-hidden="true">
        <BranchIcon />
      </span>
      <span className={styles.branchToggleLabel}>{label}</span>
    </button>
  );
}

/** A branch toggle as one row of the tree, in its own animated region: it
 *  grows in as the branch it stands for shrinks away, and shrinks out as the
 *  branch opens. `isLastRow` ends the thread line at this row's elbow. */
export function ReplyBranchToggleRow({
  isOpen,
  isLastRow,
  ...toggleProps
}: {
  isOpen: boolean;
  isLastRow: boolean;
  variant: "hidden" | "continue";
  label: string;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <ReplyBranchRegion isOpen={isOpen}>
      <div
        className={replyBranchRowClassName(isLastRow, styles.replyBranchToggle)}
      >
        <ReplyBranchToggle {...toggleProps} />
      </div>
    </ReplyBranchRegion>
  );
}
