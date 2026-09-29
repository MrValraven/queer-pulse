/**
 * The calendar dot legend's static rows (`PiecesCalendarLegend.tsx`).
 * Colocated data file per the component-decomposition convention.
 *
 * Tones and keys mirror the table's own "Waiting on" vocabulary
 * (`deskWaitingOn.ts`), but two of the three read a piece's holder more
 * broadly than a single word: the amber "writer" tone also marks a piece out
 * with the sensitivity reader, and the neutral tone also marks a piece
 * nobody holds at all (`pieceHolder`/`describeWaitingOn`). The legend's own
 * labels say so directly ("Writer or reader", "Editor or nobody"); the
 * table's own per-row word can stay narrower ("Writer", "Editor") because a
 * row always names the ACTUAL holder beside it.
 */

import type { DeskTone } from "./deskTones";

export interface CalendarLegendRow {
  tone: DeskTone;
  labelKey: string;
}

export const CALENDAR_LEGEND_TONES: CalendarLegendRow[] = [
  { tone: "writer", labelKey: "magazine:desk.calendar.legendWriter" },
  { tone: "you", labelKey: "magazine:desk.pieceRow.you" },
  { tone: "neutral", labelKey: "magazine:desk.calendar.legendNeutral" },
];
