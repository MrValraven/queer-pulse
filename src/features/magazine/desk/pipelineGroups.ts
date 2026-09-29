/**
 * Splits the desk's visible pieces into the groups the pipeline table draws
 * headers for. Grouping never reorders: each group keeps the order the pieces
 * arrived in, so the toolbar's sort still decides the order inside a group.
 *
 * Pure logic with no `t()`: groups carry an i18n key, or a plain `label` for
 * data that is already display text (a section name).
 */

import type { Piece } from "../data/desk.data";
import { DEMO_STAGES } from "../data/desk.data";
import { DESK_FOCUS_DEFINITIONS, type DeskFocusId } from "./deskFocus";
import { viewStageLabelKey } from "./stageLabels";

export type DeskGroupBy = "waiting" | "stage" | "section" | "none";

/** Pieces an earlier group took that this group's focus chip also counts. */
export interface DeskGroupOverlap {
  /** i18n key of the earlier group that holds them. */
  labelKey: string;
  count: number;
}

export interface DeskPieceGroup {
  id: string;
  /** i18n key for the header, or `null` when the group has no header. */
  labelKey: string | null;
  /** Display text used when `labelKey` is null and the group is named by data. */
  label?: string;
  pieces: Piece[];
  isCollapsedByDefault: boolean;
  /** Set on a group named after a focus chip: the chip's other pieces, which
   *  sit under an earlier group. The header says so, so "With writers 4" on
   *  the chip and "With writers 2" on the group read as one fact. */
  heldElsewhere?: DeskGroupOverlap[];
}

/** Past this many pieces the Ready group starts folded, so a backlog of
 *  finished work does not push the pieces that need someone below the fold. */
const READY_COLLAPSE_THRESHOLD = 5;

interface WaitingGroupRule {
  id: string;
  labelKey: string;
  matches: (piece: Piece, me: string) => boolean;
  /** The rule is a focus chip's own, so the chip can count more pieces than
   *  the group holds (earlier groups win). */
  isFocusChipRule?: boolean;
}

function focusMatcher(id: DeskFocusId): (piece: Piece, me: string) => boolean {
  const definition = DESK_FOCUS_DEFINITIONS.find(
    (candidate) => candidate.id === id,
  );
  return definition ? definition.matches : () => false;
}

/** In priority order; a piece lands in the FIRST group it matches. The first
 *  three use the same rule as their focus chip, but earlier groups take
 *  priority, so a group can hold fewer pieces than its chip counts
 *  (`heldElsewhere` names the difference). The catch-all comes last here;
 *  the table draws the groups in `WAITING_GROUP_DISPLAY_ORDER`. */
const WAITING_GROUP_RULES: WaitingGroupRule[] = [
  {
    id: "your-turn",
    labelKey: "magazine:desk.groups.yourTurn",
    matches: focusMatcher("your-turn"),
    isFocusChipRule: true,
  },
  {
    id: "late",
    labelKey: "magazine:desk.groups.late",
    matches: focusMatcher("late"),
    isFocusChipRule: true,
  },
  {
    id: "with-writers",
    labelKey: "magazine:desk.groups.withWriters",
    matches: focusMatcher("with-writers"),
    isFocusChipRule: true,
  },
  {
    id: "in-production",
    labelKey: "magazine:desk.groups.inProduction",
    matches: (piece) =>
      piece.stage === "Layout" || piece.stage === "Sensitivity read",
  },
  {
    id: "ready",
    labelKey: "magazine:desk.groups.ready",
    matches: (piece) => piece.stage === "Ready",
  },
  {
    id: "published",
    labelKey: "magazine:desk.groups.published",
    matches: (piece) => piece.stage === "Published",
  },
  {
    id: "other",
    labelKey: "magazine:desk.groups.inProgress",
    matches: () => true,
  },
];

/** Action order down the page: work still moving comes first, so "In
 *  progress" sits above Ready, and shipped work is always last. */
const WAITING_GROUP_DISPLAY_ORDER: readonly string[] = [
  "your-turn",
  "late",
  "with-writers",
  "in-production",
  "other",
  "ready",
  "published",
];

function displayRank(groupId: string): number {
  const rank = WAITING_GROUP_DISPLAY_ORDER.indexOf(groupId);
  return rank === -1 ? WAITING_GROUP_DISPLAY_ORDER.length : rank;
}

/** For a focus-chip group: how many of the chip's pieces each earlier group
 *  took, in rule order, leaving out the groups that took none. */
function overlapsBefore(
  ruleIndex: number,
  groupIdByPiece: Map<Piece, string>,
  pieces: Piece[],
  me: string,
): DeskGroupOverlap[] {
  const rule = WAITING_GROUP_RULES[ruleIndex];
  if (!rule?.isFocusChipRule) return [];
  return WAITING_GROUP_RULES.slice(0, ruleIndex)
    .map((earlierRule) => ({
      labelKey: earlierRule.labelKey,
      count: pieces.filter(
        (piece) =>
          groupIdByPiece.get(piece) === earlierRule.id &&
          rule.matches(piece, me),
      ).length,
    }))
    .filter((overlap) => overlap.count > 0);
}

function groupByWaiting(pieces: Piece[], me: string): DeskPieceGroup[] {
  const piecesByGroupId = new Map<string, Piece[]>(
    WAITING_GROUP_RULES.map((rule) => [rule.id, []]),
  );
  const groupIdByPiece = new Map<Piece, string>();
  for (const piece of pieces) {
    const rule = WAITING_GROUP_RULES.find((candidate) =>
      candidate.matches(piece, me),
    );
    if (!rule) continue;
    piecesByGroupId.get(rule.id)?.push(piece);
    groupIdByPiece.set(piece, rule.id);
  }
  return WAITING_GROUP_RULES.map((rule, ruleIndex) => {
    const groupPieces = piecesByGroupId.get(rule.id) ?? [];
    const heldElsewhere = overlapsBefore(ruleIndex, groupIdByPiece, pieces, me);
    return {
      id: rule.id,
      labelKey: rule.labelKey,
      pieces: groupPieces,
      isCollapsedByDefault:
        rule.id === "published" ||
        (rule.id === "ready" && groupPieces.length > READY_COLLAPSE_THRESHOLD),
      ...(heldElsewhere.length > 0 ? { heldElsewhere } : {}),
    };
  })
    .filter((group) => group.pieces.length > 0)
    .sort((groupA, groupB) => displayRank(groupA.id) - displayRank(groupB.id));
}

function groupByStage(pieces: Piece[]): DeskPieceGroup[] {
  return DEMO_STAGES.map((stage) => ({
    id: stage,
    labelKey: viewStageLabelKey(stage),
    pieces: pieces.filter((piece) => piece.stage === stage),
    // Shipped work folds away here too, same as the waiting view.
    isCollapsedByDefault: stage === "Published",
  })).filter((group) => group.pieces.length > 0);
}

/** Pieces filed under no section share one group, named by a key and
 *  sorted after every named section. */
function groupBySection(pieces: Piece[]): DeskPieceGroup[] {
  const sectionNames = [
    ...new Set(pieces.map((piece) => piece.section.trim())),
  ].sort((sectionA, sectionB) => {
    if (!sectionA || !sectionB) return Number(!sectionA) - Number(!sectionB);
    return sectionA.localeCompare(sectionB);
  });
  return sectionNames.map((sectionName) => ({
    id: `section:${sectionName}`,
    labelKey: sectionName ? null : "magazine:desk.groups.noSection",
    label: sectionName || undefined,
    pieces: pieces.filter((piece) => piece.section.trim() === sectionName),
    isCollapsedByDefault: false,
  }));
}

export function groupDeskPieces(
  pieces: Piece[],
  me: string,
  groupBy: DeskGroupBy,
): DeskPieceGroup[] {
  switch (groupBy) {
    case "waiting":
      return groupByWaiting(pieces, me);
    case "stage":
      return groupByStage(pieces);
    case "section":
      return groupBySection(pieces);
    case "none":
      return [
        {
          id: "all",
          labelKey: null,
          pieces,
          isCollapsedByDefault: false,
        },
      ];
  }
}

/**
 * The pieces the table shows, in the order it draws them: group by group,
 * each group's pieces in their own order. A folded group contributes nothing,
 * so a keyboard walking this list steps down the screen and skips what is
 * hidden.
 */
export function flattenDeskGroups(
  groups: DeskPieceGroup[],
  collapsedGroupIds: ReadonlySet<string>,
): Piece[] {
  return groups.flatMap((group) =>
    collapsedGroupIds.has(group.id) ? [] : group.pieces,
  );
}
