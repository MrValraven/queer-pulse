import { useCallback, useMemo, useState } from "react";
import type { DeskPieceGroup } from "./pipelineGroups";

/** Where the editor's open and folded pipeline groups are remembered. */
export const COLLAPSED_GROUPS_STORAGE_KEY = "qp.desk.groups.collapsed";

/** Group id to "folded". Only groups the editor has toggled are stored; the
 *  rest follow their `isCollapsedByDefault`. */
type CollapsedGroupChoices = Record<string, boolean>;

/** Storage can be missing, throw or hold something another build wrote, and
 *  the desk must still render, so anything unreadable reads as no choices. */
function readStoredChoices(): CollapsedGroupChoices {
  try {
    const raw = window.localStorage.getItem(COLLAPSED_GROUPS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const choices: CollapsedGroupChoices = {};
    for (const [groupId, isCollapsed] of Object.entries(parsed)) {
      if (typeof isCollapsed === "boolean") choices[groupId] = isCollapsed;
    }
    return choices;
  } catch {
    return {};
  }
}

function writeStoredChoices(choices: CollapsedGroupChoices): void {
  try {
    window.localStorage.setItem(
      COLLAPSED_GROUPS_STORAGE_KEY,
      JSON.stringify(choices),
    );
  } catch {
    // Not remembered this time; the fold still applies for this visit.
  }
}

export interface CollapsedGroups {
  isCollapsed: (group: DeskPieceGroup) => boolean;
  toggleCollapsed: (group: DeskPieceGroup) => void;
  /** Ids of the groups folded right now, for `flattenDeskGroups`. */
  collapsedGroupIds: ReadonlySet<string>;
}

/** The group held open for the keyboard's current row, without touching the
 *  editor's stored choice. `groupId` is null once the editor folds it again. */
interface RevealedGroup {
  pieceId: string;
  groupId: string | null;
}

/**
 * Which pipeline groups are folded, remembered per group id in this browser.
 * An editor who folds Published once should find it folded tomorrow, while a
 * group they never touched keeps following its own default (Ready folds
 * itself only once it grows long).
 *
 * When the keyboard's current row (`revealPieceId`) moves into a folded
 * group, that group opens for as long as the current row stays inside it, so
 * j/k never land on a row nobody can see. The stored choice is left alone:
 * the group folds back once the current row moves on, and folding it by hand
 * while the row is inside wins.
 *
 * While `isFocusActive` (a focus chip has the desk narrowed), every group
 * shows fully open unless the editor folds it: `focusFolds` holds only the
 * ids folded during this focus session, separate from the stored choices, so
 * a fold made while chasing a chip never touches what the editor keeps
 * folded day to day. Clearing focus drops that session's folds and the
 * stored choices take over again.
 */
export function useCollapsedGroups(
  groups: DeskPieceGroup[],
  revealPieceId: string | null,
  isFocusActive = false,
): CollapsedGroups {
  const [choices, setChoices] =
    useState<CollapsedGroupChoices>(readStoredChoices);
  const [revealed, setRevealed] = useState<RevealedGroup | null>(null);
  const [focusFolds, setFocusFolds] = useState<ReadonlySet<string>>(new Set());
  const [wasFocusActive, setWasFocusActive] = useState(isFocusActive);

  const holdingGroupId = revealPieceId
    ? (groups.find((group) =>
        group.pieces.some((piece) => piece.id === revealPieceId),
      )?.id ?? null)
    : null;

  // Adjusted during render (React's pattern for state derived from a prop
  // change), so the unfolded group paints in the same pass as the new row.
  if (revealPieceId !== (revealed?.pieceId ?? null)) {
    if (!revealPieceId) setRevealed(null);
    // Not in the list yet (still loading) leaves it to a later render.
    else if (holdingGroupId) {
      setRevealed({ pieceId: revealPieceId, groupId: holdingGroupId });
    }
  } else if (
    revealed?.groupId &&
    holdingGroupId &&
    holdingGroupId !== revealed.groupId
  ) {
    // Same row, new group (its wait changed, or the grouping did): follow it.
    setRevealed({ pieceId: revealed.pieceId, groupId: holdingGroupId });
  }

  // Same pattern as `revealed`: the previous flag is tracked in state, so a
  // change is caught and applied in this render pass. Leaving focus starts
  // the next focus session with every group open again.
  if (isFocusActive !== wasFocusActive) {
    setWasFocusActive(isFocusActive);
    if (!isFocusActive) setFocusFolds(new Set());
  }

  const isCollapsed = useCallback(
    (group: DeskPieceGroup) => {
      if (isFocusActive) {
        return group.id !== revealed?.groupId && focusFolds.has(group.id);
      }
      return (
        group.id !== revealed?.groupId &&
        (choices[group.id] ?? group.isCollapsedByDefault)
      );
    },
    [isFocusActive, focusFolds, choices, revealed],
  );

  const toggleCollapsed = useCallback(
    (group: DeskPieceGroup) => {
      if (isFocusActive) {
        setFocusFolds((currentFolds) => {
          const nextFolds = new Set(currentFolds);
          if (nextFolds.has(group.id)) nextFolds.delete(group.id);
          else nextFolds.add(group.id);
          return nextFolds;
        });
        return;
      }
      const nextChoices = { ...choices, [group.id]: !isCollapsed(group) };
      setChoices(nextChoices);
      writeStoredChoices(nextChoices);
      if (revealed && group.id === revealed.groupId) {
        setRevealed({ pieceId: revealed.pieceId, groupId: null });
      }
    },
    [isFocusActive, choices, isCollapsed, revealed],
  );

  const collapsedGroupIds = useMemo(
    () =>
      new Set(
        groups.filter((group) => isCollapsed(group)).map((group) => group.id),
      ),
    [groups, isCollapsed],
  );

  return { isCollapsed, toggleCollapsed, collapsedGroupIds };
}
