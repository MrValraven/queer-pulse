/**
 * Saved desk views as data: reading the desk's current state into a
 * `DeskViewQuery`, comparing two queries, and putting a saved query back.
 *
 * A view restores the whole table setup. Scope (`track`) and the focus chips
 * live in the URL; format, section, stage, editor, sort and grouping live in
 * `useDeskState`. Both halves go through `applyDeskView`, so the page has one
 * call to make when an editor picks a view.
 *
 * Every value written here stays inside the backend's closed sets and caps
 * (`desk-view-query.validation.ts`), so saving the current desk cannot 400.
 * A key left out of a saved query means the desk default, with one
 * exception: a view with no `track` keeps whichever scope is open, so a
 * view like "Essays section" works in every scope.
 */

import type { SetURLSearchParams } from "react-router-dom";
import type { DeskViewQuery } from "../api/deskViews.api";
import { DEMO_STAGES, type Stage } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import type { DeskGroupBy } from "./pipelineGroups";
import { readFocusParam } from "./useDeskFocus";
import type {
  PieceFormatFilter,
  PieceSortOption,
  UseDeskStateResult,
} from "./useDeskState";

const TRACK_PARAM = "track";
const FOCUS_PARAM = "focus";

// Mirrors the backend validator's caps.
const MAX_LIST_ITEMS = 20;
const MAX_TEXT_LENGTH = 80;

const TRACKS: DeskTrack[] = ["unassigned", "issue", "everything"];
const FORMATS: PieceFormatFilter[] = ["all", "article", "deck"];
const SORTS: PieceSortOption[] = ["due", "stage", "sec"];
const GROUPINGS: DeskGroupBy[] = ["waiting", "stage", "section", "none"];

const DEFAULT_FORMAT: PieceFormatFilter = "all";
const DEFAULT_SORT: PieceSortOption = "due";
const DEFAULT_GROUP_BY: DeskGroupBy = "waiting";

/** The `useDeskState` fields a view reads, plus the resolved scope. */
export type DeskViewSourceState = Pick<
  UseDeskStateResult,
  "fmt" | "sort" | "groupBy" | "sectionFilter" | "stageFilter" | "editorFilter"
> & {
  /** The scope the desk shows (`useDeskTracks().track`), used when the URL
   *  carries no `?track=` and the desk fell back to its default. */
  track?: DeskTrack;
};

/** The `useDeskState` setters a view writes through. */
export type DeskViewStateSetters = Pick<
  UseDeskStateResult,
  | "setFmt"
  | "setSort"
  | "setGroupBy"
  | "setSectionFilter"
  | "setStageFilter"
  | "setEditorFilter"
  | "setQ"
>;

/** The table state a query resolves to, defaults filled in. */
export interface DeskViewTableState {
  fmt: PieceFormatFilter;
  sort: PieceSortOption;
  groupBy: DeskGroupBy;
  sectionFilter: string[];
  stageFilter: Stage[];
  editorFilter: string | null;
}

function isOneOf<Value extends string>(
  choices: readonly Value[],
  value: unknown,
): value is Value {
  return typeof value === "string" && choices.includes(value as Value);
}

/** The URL's scope, reading the legacy `highlights` name as Unassigned the
 *  way `useDeskTracks` does. */
function readTrackParam(rawTrack: string | null): DeskTrack | undefined {
  if (rawTrack === "highlights") return "unassigned";
  return isOneOf(TRACKS, rawTrack) ? rawTrack : undefined;
}

/** Unique, non-empty, within the caps, sorted so equal sets read equal. */
function boundedSections(sections: readonly string[]): string[] {
  const kept = sections.filter(
    (section) => section.length > 0 && section.length <= MAX_TEXT_LENGTH,
  );
  return [...new Set(kept)]
    .sort((sectionA, sectionB) => sectionA.localeCompare(sectionB))
    .slice(0, MAX_LIST_ITEMS);
}

/** Known stages only, in pipeline order. */
function orderedStages(stages: readonly string[]): Stage[] {
  return DEMO_STAGES.filter((stage) => stages.includes(stage));
}

function boundedEditor(editorId: string | null | undefined): string | null {
  if (!editorId || editorId.length > MAX_TEXT_LENGTH) return null;
  return editorId;
}

/**
 * The desk as it stands, as a query to save. Only values that differ from
 * the defaults are written, plus the scope whenever it is known.
 */
export function readDeskViewQuery(
  searchParams: URLSearchParams,
  state: DeskViewSourceState,
): DeskViewQuery {
  const query: DeskViewQuery = {};
  const track = readTrackParam(searchParams.get(TRACK_PARAM)) ?? state.track;
  if (track !== undefined) query.track = track;
  const focus = readFocusParam(searchParams.get(FOCUS_PARAM));
  if (focus.length > 0) query.focus = focus;
  if (isOneOf(FORMATS, state.fmt) && state.fmt !== DEFAULT_FORMAT) {
    query.format = state.fmt;
  }
  const sections = boundedSections(state.sectionFilter);
  if (sections.length > 0) query.sections = sections;
  const stages = orderedStages(state.stageFilter);
  if (stages.length > 0) query.stages = stages;
  const editor = boundedEditor(state.editorFilter);
  if (editor !== null) query.editor = editor;
  if (isOneOf(SORTS, state.sort) && state.sort !== DEFAULT_SORT) {
    query.sort = state.sort;
  }
  if (isOneOf(GROUPINGS, state.groupBy) && state.groupBy !== DEFAULT_GROUP_BY) {
    query.groupBy = state.groupBy;
  }
  return query;
}

/**
 * The URL half of a view: `track` (when the view has one) and `focus`, in one
 * params object that keeps every other param (`issue`, `commission`, ...).
 */
export function deskViewQueryToParams(
  query: DeskViewQuery,
  currentParams: URLSearchParams,
): URLSearchParams {
  const nextParams = new URLSearchParams(currentParams);
  if (isOneOf(TRACKS, query.track)) nextParams.set(TRACK_PARAM, query.track);
  const focus = readFocusParam((query.focus ?? []).join(","));
  if (focus.length > 0) nextParams.set(FOCUS_PARAM, focus.join(","));
  else nextParams.delete(FOCUS_PARAM);
  return nextParams;
}

/** The `useDeskState` half of a view, with defaults for every missing key
 *  and anything outside the desk's own sets dropped. */
export function deskViewTableState(query: DeskViewQuery): DeskViewTableState {
  return {
    fmt: isOneOf(FORMATS, query.format) ? query.format : DEFAULT_FORMAT,
    sort: isOneOf(SORTS, query.sort) ? query.sort : DEFAULT_SORT,
    groupBy: isOneOf(GROUPINGS, query.groupBy)
      ? query.groupBy
      : DEFAULT_GROUP_BY,
    sectionFilter: boundedSections(query.sections ?? []),
    stageFilter: orderedStages(query.stages ?? []),
    editorFilter: boundedEditor(query.editor),
  };
}

/**
 * Puts a saved view back on the desk: one URL write (replacing the history
 * entry, like the desk's other URL writers) and one call per table setter.
 * A view restores the whole table setup, so a search left over from before
 * the pick is cleared along with everything else.
 */
export function applyDeskView(
  query: DeskViewQuery,
  target: {
    setSearchParams: SetURLSearchParams;
    deskState: DeskViewStateSetters;
  },
): void {
  target.setSearchParams(
    (currentParams) => deskViewQueryToParams(query, currentParams),
    { replace: true },
  );
  const tableState = deskViewTableState(query);
  target.deskState.setFmt(tableState.fmt);
  target.deskState.setSort(tableState.sort);
  target.deskState.setGroupBy(tableState.groupBy);
  target.deskState.setSectionFilter(tableState.sectionFilter);
  target.deskState.setStageFilter(tableState.stageFilter);
  target.deskState.setEditorFilter(tableState.editorFilter);
  target.deskState.setQ("");
}

/**
 * Whether the desk currently shows `viewQuery`. Lists compare as sets and
 * missing keys as their defaults. The scope counts only when the view names
 * one, matching how `applyDeskView` leaves the scope alone otherwise.
 */
export function isSameDeskViewQuery(
  viewQuery: DeskViewQuery,
  currentQuery: DeskViewQuery,
): boolean {
  if (viewQuery.track !== undefined && viewQuery.track !== currentQuery.track) {
    return false;
  }
  const comparable = (query: DeskViewQuery) =>
    JSON.stringify({
      focus: readFocusParam((query.focus ?? []).join(",")),
      ...deskViewTableState(query),
    });
  return comparable(viewQuery) === comparable(currentQuery);
}
