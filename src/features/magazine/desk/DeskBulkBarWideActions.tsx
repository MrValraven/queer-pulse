import { useId } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button, Tooltip } from "../../../shared/components/ui";
import type { DeskMenuRadioItem } from "./DeskMenu";
import { DeskMenu } from "./DeskMenu";
import styles from "./DeskBulkBar.module.css";

export interface DeskBulkBarWideActionsProps {
  hasAnyIssue: boolean;
  assignLabel: string;
  onAssignIssue: () => void;
  changeStageLabel: string;
  stageItems: DeskMenuRadioItem[];
  chaseLabel: string;
  canChase: boolean;
  onChaseAll: () => void;
  /** Whether the current selection is exactly one piece: `HandoffModal` only
   *  ever carries one. Past that, "Hand off" stays on screen, disabled, with
   *  `handOffDisabledHint` in a tooltip. */
  canHandOff: boolean;
  handOffLabel: string;
  handOffDisabledHint: string;
  onHandOff: () => void;
}

/**
 * `DeskBulkBar`'s row above `BULK_BAR_COMPACT_QUERY`: every action as its own
 * button, split out only to keep `DeskBulkBar.tsx` under the 200-line rule.
 * Below that width the bar shows the single folded "Actions" menu instead
 * (`DeskBulkBar.tsx` itself, `compactItems`).
 */
export function DeskBulkBarWideActions({
  hasAnyIssue,
  assignLabel,
  onAssignIssue,
  changeStageLabel,
  stageItems,
  chaseLabel,
  canChase,
  onChaseAll,
  canHandOff,
  handOffLabel,
  handOffDisabledHint,
  onHandOff,
}: DeskBulkBarWideActionsProps) {
  const handOffHintId = useId();
  return (
    <>
      {hasAnyIssue && (
        <Button variant="ghost-dark" size="sm" onClick={onAssignIssue}>
          {assignLabel}
        </Button>
      )}
      <DeskMenu
        label={changeStageLabel}
        items={stageItems}
        renderTrigger={(triggerProps) => (
          <Button
            {...triggerProps}
            variant="ghost-dark"
            size="sm"
            className={styles.trigger}
          >
            {changeStageLabel}
            <FiChevronDown aria-hidden className={styles.chevron} />
          </Button>
        )}
      />
      {canChase && (
        <Button variant="ghost-dark" size="sm" onClick={onChaseAll}>
          {chaseLabel}
        </Button>
      )}
      <Tooltip
        label={handOffDisabledHint}
        placement="top"
        isDisabled={canHandOff}
      >
        <Button
          variant="ghost-dark"
          size="sm"
          aria-disabled={!canHandOff}
          aria-describedby={canHandOff ? undefined : handOffHintId}
          onClick={canHandOff ? onHandOff : undefined}
        >
          {handOffLabel}
        </Button>
      </Tooltip>
      {/* `Tooltip`'s own bubble is `aria-hidden`, a hover/focus reveal only,
          so a screen reader needs its own copy of the hint, pointed at only
          while disabled: otherwise "Hand off, dimmed" reaches assistive tech
          with no reason why (the compact menu's own `description` already
          had this right). */}
      {!canHandOff && (
        <span id={handOffHintId} className="visuallyHidden">
          {handOffDisabledHint}
        </span>
      )}
    </>
  );
}
