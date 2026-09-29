/**
 * The issue's slot count, derived once from the pieces and the section
 * targets, so every place that says how full an issue is agrees: the header
 * pulse ("9 of 15 slots filled"), the Issue plan layout ("6 slots open") and
 * the rail's Issue health slots. A stored `issue.filled` can lag the pieces
 * actually filed, so it never feeds these counts.
 */

import type { Piece, Section } from "../data/desk.data";

/** One section's slots: pieces filed under it against its target. */
export interface IssueSectionSlots {
  name: string;
  /** Pieces whose `section` names this section. May exceed `target`. */
  filled: number;
  target: number;
  /** Slots still open; zero once the section is full or over. */
  open: number;
}

/** The whole issue's slots. `filled` counts only pieces that take a slot, so
 *  a section filed past its target never hides another section's gap:
 *  `filled + open === slots` always holds. */
export interface IssueSlotTotals {
  filled: number;
  slots: number;
  open: number;
}

/** Filled against target per section, in the sections' own order. */
export function issueSectionSlots(
  pieces: readonly Piece[],
  sections: readonly Section[],
): IssueSectionSlots[] {
  return sections.map((section) => {
    const filled = pieces.filter(
      (piece) => piece.section === section.name,
    ).length;
    return {
      name: section.name,
      filled,
      target: section.target,
      open: Math.max(0, section.target - filled),
    };
  });
}

/** The issue's slots summed over every section. */
export function issueSlotTotals(
  pieces: readonly Piece[],
  sections: readonly Section[],
): IssueSlotTotals {
  let slots = 0;
  let open = 0;
  for (const section of issueSectionSlots(pieces, sections)) {
    slots += section.target;
    open += section.open;
  }
  return { filled: slots - open, slots, open };
}
