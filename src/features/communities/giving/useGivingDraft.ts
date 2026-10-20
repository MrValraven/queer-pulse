import { useState } from "react";
import { GIVING_LIMITS } from "./givingConstants";
import {
  emptyGivingDraftRow,
  type GivingDraft,
  type GivingDraftRow,
} from "./givingDraft";

export type GivingDraftRowPatch = Partial<Omit<GivingDraftRow, "draftId">>;

/**
 * The support section editor's draft state. Every update is functional, so
 * quick edits never overwrite each other. Changing a row's kind keeps what
 * was typed in its value field.
 */
export function useGivingDraft(initial: GivingDraft) {
  const [draft, setDraft] = useState<GivingDraft>(initial);
  const isAtCap = draft.rows.length >= GIVING_LIMITS.maxMethods;

  const setIntro = (intro: string) => {
    setDraft((previous) => ({ ...previous, intro }));
  };

  const updateRow = (draftId: string, patch: GivingDraftRowPatch) => {
    setDraft((previous) => ({
      ...previous,
      rows: previous.rows.map((row) =>
        row.draftId === draftId ? { ...row, ...patch } : row,
      ),
    }));
  };

  /** Appends a blank row and returns its id, or null at the cap. */
  const addRow = (): string | null => {
    if (isAtCap) return null;
    const row = emptyGivingDraftRow();
    setDraft((previous) =>
      previous.rows.length >= GIVING_LIMITS.maxMethods
        ? previous
        : { ...previous, rows: [...previous.rows, row] },
    );
    return row.draftId;
  };

  const removeRow = (draftId: string) => {
    setDraft((previous) => ({
      ...previous,
      rows: previous.rows.filter((row) => row.draftId !== draftId),
    }));
  };

  /** Swaps a row with its neighbour; a move past either end does nothing. */
  const moveRow = (draftId: string, offset: -1 | 1) => {
    setDraft((previous) => {
      const fromIndex = previous.rows.findIndex(
        (row) => row.draftId === draftId,
      );
      const toIndex = fromIndex + offset;
      const movingRow = previous.rows[fromIndex];
      const neighbourRow = previous.rows[toIndex];
      if (fromIndex < 0 || !movingRow || !neighbourRow) return previous;
      const rows = [...previous.rows];
      rows[fromIndex] = neighbourRow;
      rows[toIndex] = movingRow;
      return { ...previous, rows };
    });
  };

  return {
    draft,
    setIntro,
    updateRow,
    addRow,
    removeRow,
    moveRow,
    isAtCap,
  };
}
