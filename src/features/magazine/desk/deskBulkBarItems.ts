/**
 * `DeskBulkBar`'s pure item-building helpers, split out to keep the
 * component itself under the 200-line rule (mirrors how `deskMenuItems.ts`
 * sits beside `DeskMenu.tsx`). No `t()` here: every label already arrives
 * translated from the component.
 */

import type { Piece, Stage } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import type {
  DeskMenuActionItem,
  DeskMenuItem,
  DeskMenuRadioItem,
} from "./DeskMenu";
import type { TFunction } from "../../../shared/i18n/types";
import { viewStageLabelKey } from "./stageLabels";

/**
 * "Move issue" once the selection is already on an issue track (mirrors the
 * per-row wording rule in `PieceRow`, generalised from one piece to the whole
 * selection: "everything" only reads as a move once EVERY selected piece
 * already carries an issue). Everywhere else, "Add to issue".
 *
 * This is its own `desk.bulk.*` pair rather than the per-row
 * `desk.reassign.*` keys: the per-row action opens straight into a picker, so
 * its trailing "…" earns its keep, but on the bulk bar it read as the label
 * being cut off. The plan's own bulk-bar copy (6.11) has no
 * ellipsis on any action, so this drops it to match.
 */
export function assignLabelKey(
  track: DeskTrack,
  selectedPieces: Piece[],
): string {
  const isMoveIssue =
    track === "issue" ||
    (track === "everything" &&
      selectedPieces.every((piece) => piece.issueId !== null));
  return `magazine:desk.bulk.${isMoveIssue ? "moveIssue" : "addToIssue"}`;
}

/** One radio per non-terminal stage. Checked only when the WHOLE selection
 *  already sits there, so a selection spanning several stages shows none as
 *  "current" rather than picking one arbitrarily. */
export function buildStageItems(
  stages: Stage[],
  selectedPieces: Piece[],
  onChangeStage: (stage: Stage) => void,
  translate: TFunction,
): DeskMenuRadioItem[] {
  return stages
    .filter((stage) => stage !== "Published")
    .map((stage) => ({
      kind: "radio",
      id: stage,
      label: translate(viewStageLabelKey(stage)),
      isChecked:
        selectedPieces.length > 0 &&
        selectedPieces.every((piece) => piece.stage === stage),
      onSelect: () => onChangeStage(stage),
    }));
}

export interface BuildExtraActionItemsParams {
  hasAnyIssue: boolean;
  assignLabel: string;
  chaseLabel: string;
  canChase: boolean;
  handOffLabel: string;
  /** Muted second line under a disabled "Hand off", explaining why: the
   *  single-piece handoff picker has nowhere to put a second
   *  piece, so the action used to vanish outright once the selection grew
   *  past one, with no hint that it had ever existed. */
  handOffDisabledHint: string;
  canHandOff: boolean;
  onAssignIssue: () => void;
  onChaseAll: () => void;
  onHandOff: () => void;
}

/** The non-stage actions (add/move to issue, chase, hand off). "Add to
 *  issue"/"Move issue" and "Chase" show only while they apply to the current
 *  selection; "Hand off" always shows, disabled with a hint once the
 *  selection holds more than one piece. On a phone these fold,
 *  together with the stage list, into the bar's one "Actions" menu
 *  (`buildCompactItems`); at every wider size each is its own button. */
export function buildExtraActionItems(
  params: BuildExtraActionItemsParams,
): DeskMenuActionItem[] {
  const items: DeskMenuActionItem[] = [];
  if (params.hasAnyIssue) {
    items.push({
      kind: "action",
      id: "assign",
      label: params.assignLabel,
      onSelect: params.onAssignIssue,
    });
  }
  if (params.canChase) {
    items.push({
      kind: "action",
      id: "chase",
      label: params.chaseLabel,
      onSelect: params.onChaseAll,
    });
  }
  items.push({
    kind: "action",
    id: "handOff",
    label: params.handOffLabel,
    description: params.canHandOff ? undefined : params.handOffDisabledHint,
    isDisabled: !params.canHandOff,
    onSelect: params.onHandOff,
  });
  return items;
}

/** "Select all {count}", shown in the compact menu once the page wires
 *  `onSelectAll` and says how many pieces there are to select (phone-only
 *  for now). `null` while either is missing, so the item
 *  is simply absent until both arrive; `deskBulkBarItems.ts` never calls
 *  `t()` itself, so the label comes in ready-made like every other one here. */
export function buildSelectAllItem(
  selectAllLabel: string | null,
  onSelectAll: (() => void) | undefined,
): DeskMenuActionItem | null {
  if (selectAllLabel === null || onSelectAll === undefined) return null;
  return {
    kind: "action",
    id: "selectAll",
    label: selectAllLabel,
    onSelect: onSelectAll,
  };
}

/**
 * The whole bar folded into one menu: a "Change stage" heading over its
 * stage radios, then (once there is at least one) a separator and the extra
 * actions, then (once wired) a separator and "Select all". This is what the
 * bar's single phone-width "Actions" trigger opens: below that
 * width there is no room for Change stage plus a second trigger as separate
 * controls, so everything lives in one menu instead of two.
 */
export function buildCompactItems(
  stageItems: DeskMenuRadioItem[],
  extraActionItems: DeskMenuActionItem[],
  changeStageLabel: string,
  selectAllItem: DeskMenuActionItem | null,
): DeskMenuItem[] {
  const items: DeskMenuItem[] = [
    { kind: "heading", id: "compact-stage-heading", label: changeStageLabel },
    ...stageItems,
  ];
  if (extraActionItems.length > 0) {
    items.push({ kind: "separator", id: "compact-separator" });
    items.push(...extraActionItems);
  }
  if (selectAllItem) {
    items.push({ kind: "separator", id: "compact-select-all-separator" });
    items.push(selectAllItem);
  }
  return items;
}
