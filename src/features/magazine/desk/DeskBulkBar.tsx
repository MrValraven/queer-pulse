import { FiChevronDown } from "react-icons/fi";
import { BulkActionBar, Button } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import { DeskMenu } from "./DeskMenu";
import {
  assignLabelKey,
  buildCompactItems,
  buildExtraActionItems,
  buildSelectAllItem,
  buildStageItems,
} from "./deskBulkBarItems";
import { DeskBulkBarWideActions } from "./DeskBulkBarWideActions";
import { chaseQueueForSelection } from "./useDeskBulkActions";
import styles from "./DeskBulkBar.module.css";

/**
 * Below this width there is no room for "Change stage" plus a second trigger
 * for the rest of the actions as separate controls. 1023px, up from 640px in
 * an earlier pass: a width sweep of the un-compacted row found it wrapping
 * onto 3 to 4 lines anywhere
 * from 641px to 1023px, in English once "Hand off" became always-visible and
 * in Portuguese throughout. The CSS module's own literal
 * `@media (max-width: 1023px)` is the same breakpoint, so the JS and CSS
 * switch together; 1023px sits off the shared breakpoint ladder
 * (`shared/theme/breakpoints` has nothing between `md` 640 and `lg` 760), so
 * it stays a raw pixel value in both places.
 */
const BULK_BAR_COMPACT_QUERY = mediaMax(1023);

export interface DeskBulkBarProps {
  selectedPieces: Piece[];
  stages: Stage[];
  hasAnyIssue: boolean;
  track: DeskTrack;
  /** Existing `assignment.openForSelection`. */
  onAssignIssue: () => void;
  /** Integration loops `useDeskBulkActions().changeStageForSelection` over
   *  the current selection with the chosen stage. */
  onChangeStage: (stage: Stage) => void;
  /**
   * Called with the chase queue for the current selection: the pieces
   * actually waiting on a writer, in table order (`chaseQueueForSelection`,
   * the same count the "Chase {count}" label is sized with). Integration:
   * opens `ChaseModal` for each queued piece in turn ("Chase {current} of
   * {total}", with a Skip control) via `useDeskModals().openChase`.
   */
  onChaseAll: (queue: Piece[]) => void;
  /** Integration: `useDeskBulkActions().handOffSelection(selectedPieces)`. */
  onHandOff: () => void;
  onClear: () => void;
  /**
   * How many pieces are there to select in the current view: the table's
   * `visiblePieces.length`. Paired with `onSelectAll`
   * below, shown as "Select all {count}" in the compact (phone-width) menu
   * once both are supplied. The page wires this later; omitted, the item is
   * simply absent.
   */
  selectableCount?: number;
  /** Selects every piece in the current view. See `selectableCount`. */
  onSelectAll?: () => void;
}

/**
 * The desk's one bulk action bar: replaces the separate `BulkAssignBar` /
 * `BulkTriageBar`-style copies that would otherwise multiply per action.
 * Renders nothing while `selectedPieces` is empty (the shared
 * `BulkActionBar`'s own `count === 0` guard).
 *
 * Above `BULK_BAR_COMPACT_QUERY`, "Change stage" is its own `DeskMenu`
 * trigger (the desk's most common bulk move stays one tap away) alongside
 * "Add to issue"/"Move issue", "Chase" and "Hand off" as their own buttons.
 * Below it, the bar becomes a full-width bottom bar with one row: the count,
 * a single "Actions" trigger folding all of the above (stage list included,
 * plus "Select all" once `selectableCount`/`onSelectAll` are wired) into one
 * menu, then Clear (the previous split between a "Change stage" trigger and
 * a second "More" trigger wrapped into a three-line blob at phone widths).
 */
export function DeskBulkBar({
  selectedPieces,
  stages,
  hasAnyIssue,
  track,
  onAssignIssue,
  onChangeStage,
  onChaseAll,
  onHandOff,
  onClear,
  selectableCount,
  onSelectAll,
}: DeskBulkBarProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isCompact = useMediaQuery(BULK_BAR_COMPACT_QUERY);
  const count = selectedPieces.length;
  // The exact pieces a "Chase" click queues up, in order: computed once here
  // so the label below and the click handler can never name a different
  // count than they act on (see `chaseQueueForSelection`'s doc
  // comment).
  const chaseQueue = chaseQueueForSelection(selectedPieces);
  // `HandoffModal` only ever carries one piece (see `useDeskBulkActions`'s
  // doc comment). "Hand off" stays visible either way: past one piece it
  // shows disabled, with a hint.
  const canHandOff = count === 1;
  const assignKey = assignLabelKey(track, selectedPieces);
  const changeStageLabel = t("magazine:desk.bulk.changeStage");
  const chaseLabel = t("magazine:desk.bulk.chase", {
    count: chaseQueue.length,
  });
  const handleChaseAll = () => onChaseAll(chaseQueue);
  const stageItems = buildStageItems(stages, selectedPieces, onChangeStage, t);
  const handOffDisabledHint = t("magazine:desk.bulk.handOffOneAtATime");
  const extraActionItems = buildExtraActionItems({
    hasAnyIssue,
    assignLabel: t(assignKey),
    chaseLabel,
    canChase: chaseQueue.length > 0,
    handOffLabel: t("magazine:desk.pieceRow.handOff"),
    handOffDisabledHint,
    canHandOff,
    onAssignIssue,
    onChaseAll: handleChaseAll,
    onHandOff,
  });
  const selectAllLabel =
    selectableCount !== undefined
      ? t("magazine:desk.bulk.selectAll", { count: selectableCount })
      : null;
  const selectAllItem = buildSelectAllItem(selectAllLabel, onSelectAll);
  const compactItems = buildCompactItems(
    stageItems,
    extraActionItems,
    changeStageLabel,
    selectAllItem,
  );

  return (
    <BulkActionBar
      count={count}
      label={
        <Translation
          i18nKey="magazine:desk.bulk.selected"
          values={{ count }}
          slots={{
            count: (
              <RollingNumber value={fmt.number(count)} numericValue={count} />
            ),
          }}
        />
      }
      ariaLabel={t("magazine:desk.bulk.ariaLabel")}
      onClear={onClear}
      clearLabel={t("magazine:desk.bulkAssign.clearSelection")}
      className={styles.bar}
    >
      {isCompact ? (
        <DeskMenu
          label={t("magazine:desk.bulk.actions")}
          items={compactItems}
          align="end"
          renderTrigger={(triggerProps) => (
            <Button
              {...triggerProps}
              variant="ghost-dark"
              size="sm"
              className={styles.trigger}
            >
              {t("magazine:desk.bulk.actions")}
              <FiChevronDown aria-hidden className={styles.chevron} />
            </Button>
          )}
        />
      ) : (
        <DeskBulkBarWideActions
          hasAnyIssue={hasAnyIssue}
          assignLabel={t(assignKey)}
          onAssignIssue={onAssignIssue}
          changeStageLabel={changeStageLabel}
          stageItems={stageItems}
          chaseLabel={chaseLabel}
          canChase={chaseQueue.length > 0}
          onChaseAll={handleChaseAll}
          canHandOff={canHandOff}
          handOffLabel={t("magazine:desk.pieceRow.handOff")}
          handOffDisabledHint={handOffDisabledHint}
          onHandOff={onHandOff}
        />
      )}
    </BulkActionBar>
  );
}
