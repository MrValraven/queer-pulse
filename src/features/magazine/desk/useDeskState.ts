/**
 * Desk local UI state: search/format/sort, the section/stage/editor filters,
 * grouping and row density, the pitch selection and keyboard focus, plus the
 * derived `visiblePieces` list.
 * Pure UI state that fetches nothing: callers pass in the already-loaded
 * pieces and the current editor's id.
 *
 * Focus chips live in the URL (`useDeskFocus`), so the caller passes them in
 * through `options.activeFocusIds`. That keeps this hook free of router
 * context, and every existing caller keeps working unchanged.
 */

import { useMemo, useState } from "react";
import type { Piece, Stage } from "../data/desk.data";
import { DEMO_STAGES } from "../data/desk.data";
import { matchesAllFocus, type DeskFocusId } from "./deskFocus";
import { compareByDue } from "./deskDue";
import type { DeskGroupBy } from "./pipelineGroups";
import {
  readStoredDensity,
  writeStoredDensity,
  type DeskDensity,
} from "./deskDensity";

export type PieceFormatFilter = "all" | "article" | "deck";
export type PieceSortOption = "due" | "stage" | "sec";
export type { DeskDensity } from "./deskDensity";
export interface UseDeskStateOptions {
  /** The active focus chips (from `useDeskFocus`); every one must match. */
  activeFocusIds?: DeskFocusId[];
  /** The scope's close day (`YYYY-MM-DD`), so the "at-risk" chip reads the
   *  same forecast the rail does. `null` outside the issue scope. The
   *  matchers' clock stays their default "now", the instant the chip counts
   *  and the row badges read, so "stalled" filters exactly what it counts;
   *  the forecast works in whole days, so "now" gives it the same answer. */
  closesOn?: string | null;
  /** Ids of the pitches currently in the triage queue, so a pitch selection
   *  is dropped the moment its pitch answers or drops out with a refetch,
   *  the same prune `useDeskPieceSelection` runs for piece selection.
   *  Omitted skips the prune (a caller with no pitches yet). */
  pitchIds?: string[];
}

const NO_FOCUS: DeskFocusId[] = [];

export interface UseDeskStateResult {
  q: string;
  setQ: (value: string) => void;
  fmt: PieceFormatFilter;
  setFmt: (value: PieceFormatFilter) => void;
  sort: PieceSortOption;
  setSort: (value: PieceSortOption) => void;
  selected: string[];
  toggleSelect: (id: string) => void;
  clearSelected: () => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
  /** Sections to show; empty shows every section. */
  sectionFilter: string[];
  setSectionFilter: (sections: string[]) => void;
  /** Stages to show; empty shows every stage. */
  stageFilter: Stage[];
  setStageFilter: (stages: Stage[]) => void;
  /** One editor's queue (the team card's "view queue"); null shows everyone's. */
  editorFilter: string | null;
  setEditorFilter: (editorId: string | null) => void;
  groupBy: DeskGroupBy;
  setGroupBy: (groupBy: DeskGroupBy) => void;
  density: DeskDensity;
  setDensity: (density: DeskDensity) => void;
  visiblePieces: Piece[];
}

export function useDeskState(
  pieces: Piece[],
  me: string,
  options: UseDeskStateOptions = {},
): UseDeskStateResult {
  const activeFocusIds = options.activeFocusIds ?? NO_FOCUS;
  const closesOn = options.closesOn ?? null;
  const pitchIds = options.pitchIds ?? null;
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState<PieceFormatFilter>("all");
  const [sort, setSort] = useState<PieceSortOption>("due");
  const [rawSelected, setRawSelected] = useState<string[]>([]);

  // Adjusted during render (React's pattern for state derived from a prop
  // change): a selected pitch that drops out of the current pitch list (a
  // pass, a commission, a refetch) is dropped from the raw state right away,
  // so a stale id cannot ride along into a later bulk pass.
  const selected =
    pitchIds === null
      ? rawSelected
      : rawSelected.filter((id) => pitchIds.includes(id));
  if (pitchIds !== null && selected.length !== rawSelected.length) {
    setRawSelected(selected);
  }

  const [focusId, setFocusId] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<Stage[]>([]);
  const [editorFilter, setEditorFilter] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<DeskGroupBy>("waiting");
  const [density, setDensityState] = useState<DeskDensity>(readStoredDensity);

  function setDensity(nextDensity: DeskDensity): void {
    setDensityState(nextDensity);
    writeStoredDensity(nextDensity);
  }

  function toggleSelect(id: string): void {
    setRawSelected((currentSelected) =>
      currentSelected.includes(id)
        ? currentSelected.filter((selectedId) => selectedId !== id)
        : [...currentSelected, id],
    );
  }

  function clearSelected(): void {
    setRawSelected([]);
  }

  const visiblePieces = useMemo(() => {
    const lowerCaseQuery = q.toLowerCase();
    const filteredPieces = pieces.filter((piece) => {
      const matchesFormat = fmt === "all" || piece.format === fmt;
      const matchesFocus = matchesAllFocus(
        piece,
        me,
        activeFocusIds,
        undefined,
        closesOn,
      );
      const matchesSection =
        sectionFilter.length === 0 || sectionFilter.includes(piece.section);
      const matchesStage =
        stageFilter.length === 0 || stageFilter.includes(piece.stage);
      const matchesEditor =
        editorFilter === null || piece.editorId === editorFilter;
      // Joined with a space so the end of one field does not run into the
      // start of the next.
      const matchesQuery =
        !q ||
        [piece.title, piece.byline, piece.section, piece.kind]
          .join(" ")
          .toLowerCase()
          .includes(lowerCaseQuery);
      return (
        matchesFormat &&
        matchesFocus &&
        matchesSection &&
        matchesStage &&
        matchesEditor &&
        matchesQuery
      );
    });

    const sortedPieces = [...filteredPieces];
    if (sort === "stage") {
      sortedPieces.sort(
        (pieceA, pieceB) =>
          DEMO_STAGES.indexOf(pieceA.stage) - DEMO_STAGES.indexOf(pieceB.stage),
      );
    } else if (sort === "sec") {
      sortedPieces.sort((pieceA, pieceB) =>
        pieceA.section.localeCompare(pieceB.section),
      );
    } else {
      sortedPieces.sort(compareByDue);
    }
    return sortedPieces;
  }, [
    pieces,
    fmt,
    me,
    activeFocusIds,
    closesOn,
    sectionFilter,
    stageFilter,
    editorFilter,
    q,
    sort,
  ]);

  return {
    q,
    setQ,
    fmt,
    setFmt,
    sort,
    setSort,
    selected,
    toggleSelect,
    clearSelected,
    focusId,
    setFocusId,
    sectionFilter,
    setSectionFilter,
    stageFilter,
    setStageFilter,
    editorFilter,
    setEditorFilter,
    groupBy,
    setGroupBy,
    density,
    setDensity,
    visiblePieces,
  };
}
