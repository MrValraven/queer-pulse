import type { Piece, Section, Stage } from "../../data/desk.data";
import { STAGE_STEP } from "../deskTones";

export interface StageShare {
  stage: Stage;
  /** The stage's 1-based pipeline step, the `N` in `--desk-stage-N`. */
  step: number;
  count: number;
}

export interface SectionSlots {
  name: string;
  filled: number;
  target: number;
  /** Slots still open; zero once the section is full or over. */
  gaps: number;
}

/** Every stage in pipeline order, read from the one step mapping so the bar
 * and the stage pills agree on order and colour. */
const STAGES_IN_ORDER = (Object.keys(STAGE_STEP) as Stage[]).sort(
  (first, second) => STAGE_STEP[first] - STAGE_STEP[second],
);

/**
 * The issue's pieces counted per stage, in pipeline order, keeping only the
 * stages that hold at least one piece. The stacked bar and its legend both
 * read this, so a stage with no pieces never draws a sliver or a legend row.
 */
export function stageShares(pieces: Piece[]): StageShare[] {
  return STAGES_IN_ORDER.map((stage) => ({
    stage,
    step: STAGE_STEP[stage],
    count: pieces.filter((piece) => piece.stage === stage).length,
  })).filter((share) => share.count > 0);
}

/**
 * Filled against target per section, the same count IssuePlan draws: pieces
 * whose `section` names the section, against `section.target`.
 */
export function sectionSlots(
  pieces: Piece[],
  sections: Section[],
): SectionSlots[] {
  return sections.map((section) => {
    const filled = pieces.filter(
      (piece) => piece.section === section.name,
    ).length;
    return {
      name: section.name,
      filled,
      target: section.target,
      gaps: Math.max(0, section.target - filled),
    };
  });
}

/** How many sections with open slots Issue health lists before "Show all
 * sections" takes over. */
export const LISTED_GAP_SECTION_COUNT = 3;

/**
 * The sections Issue health lists while collapsed: the ones with the most
 * open slots (up to `limit`), plus any section the table is filtered by, so a
 * pressed toggle never hides. Kept in the issue's section order.
 */
export function slotsToList(
  slots: SectionSlots[],
  pressedSectionNames: string[] = [],
  limit: number = LISTED_GAP_SECTION_COUNT,
): SectionSlots[] {
  const topGapNames = new Set(
    slots
      .filter((slot) => slot.gaps > 0)
      .sort((first, second) => second.gaps - first.gaps)
      .slice(0, limit)
      .map((slot) => slot.name),
  );
  return slots.filter(
    (slot) =>
      topGapNames.has(slot.name) || pressedSectionNames.includes(slot.name),
  );
}
