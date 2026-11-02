import type { EventBatchTemplateDTO } from "../api/eventBatch.api";
import type { CostKind } from "../gatheringExtras";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import { EVENT_BATCH_MAX_ROWS } from "./addMonth.data";
import { sortedDates } from "./addMonthDates";

// ── Add a month of events: page state ───────────────────────────────────────
// One pure reducer drives the whole page and its state is what the local
// draft saves. Dates are "YYYY-MM-DD" and times "HH:mm", wall clock in the
// template's zone.

/** An uploaded photo: the storage key the server reads and, while this page
 *  lives, a preview URL to show it. */
export interface AddMonthPhoto {
  key: string;
  previewUrl: string | null;
}

/** Start and optional end on the clock. An end at or before the start reads
 *  as the next day. */
export interface AddMonthTimes {
  startTime: string;
  endTime: string | null;
}

/** One card on the page: what one selected date publishes. */
export interface AddMonthRow {
  date: string;
  title: string;
  description: string;
  /** Null keeps the shared cover. */
  photo: AddMonthPhoto | null;
  /** Null keeps the shared times. */
  timeOverride: AddMonthTimes | null;
}

/** The place fields the shared edit shows, in the wizard's vocabulary. */
export interface AddMonthPlaceValues {
  hood: string;
  venue: string;
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  address: string;
  directions: string;
  onlineUrl: string;
}

/** The cost fields the shared edit shows. */
export interface AddMonthCostValues {
  costKind: CostKind;
  cost: string;
  paymentUrl: string;
  paymentInstructions: string;
}

export interface AddMonthState {
  templateSlug: string | null;
  /** Which template last set the shared times, so each template sets them once. */
  timesTemplateSlug: string | null;
  times: AddMonthTimes;
  /** Null keeps the template's place. */
  place: AddMonthPlaceValues | null;
  /** Null keeps the template's cost. */
  cost: AddMonthCostValues | null;
  /** Null keeps the template's cover, which the server copies. */
  sharedCover: AddMonthPhoto | null;
  /** Always in date order, one per selected date. */
  rows: AddMonthRow[];
  /**
   * Rows removed while they held typed work, by date. A mis-tap on the
   * calendar must never cost typed work: picking the date again brings the
   * row back from here.
   */
  stashedRows: Record<string, AddMonthRow>;
  pledges: [boolean, boolean];
}

export type AddMonthRowField =
  "date" | "title" | "description" | "startTime" | "endTime";

export type AddMonthRowProblem =
  "titleMissing" | "descriptionMissing" | "startPassed" | "server";

export interface AddMonthRowIssue {
  field: AddMonthRowField;
  problem: AddMonthRowProblem;
}

/** Why the Publish button is held back. */
export type AddMonthBlock =
  | { reason: "noTemplate" }
  | { reason: "templateLoading" }
  | { reason: "noDates" }
  | { reason: "sharedInvalid" }
  | { reason: "rowsInvalid"; invalidRowCount: number }
  | { reason: "tooLarge" }
  | { reason: "pledgesOpen" };

export type AddMonthAction =
  | { type: "pickTemplate"; slug: string }
  | { type: "applyTemplateTimes"; template: EventBatchTemplateDTO }
  | { type: "toggleDate"; date: string }
  | { type: "removeDate"; date: string }
  | {
      type: "editRow";
      date: string;
      patch: Partial<Pick<AddMonthRow, "title" | "description">>;
    }
  | { type: "setRowPhotoKey"; date: string; key: string }
  | {
      type: "setRowPhotoPreview";
      date: string;
      key: string;
      previewUrl: string | null;
    }
  | { type: "setRowTime"; date: string; timeOverride: AddMonthTimes | null }
  | { type: "setSharedTimes"; times: AddMonthTimes }
  | { type: "setSharedCoverKey"; key: string }
  | { type: "setSharedCoverPreview"; key: string; previewUrl: string | null }
  | {
      type: "startEditingShared";
      place: AddMonthPlaceValues;
      cost: AddMonthCostValues;
    }
  | { type: "patchPlace"; patch: Partial<AddMonthPlaceValues> }
  | { type: "patchCost"; patch: Partial<AddMonthCostValues> }
  | { type: "resetShared" }
  | { type: "togglePledge"; index: 0 | 1 }
  | { type: "restore"; state: AddMonthState }
  | { type: "reset" };

export const EMPTY_ADD_MONTH_STATE: AddMonthState = {
  templateSlug: null,
  timesTemplateSlug: null,
  times: { startTime: "19:00", endTime: null },
  place: null,
  cost: null,
  sharedCover: null,
  rows: [],
  stashedRows: {},
  pledges: [false, false],
};

function emptyRow(date: string): AddMonthRow {
  return { date, title: "", description: "", photo: null, timeOverride: null };
}

/** Whether a row holds anything the host set: a title, a description, a
 *  photo or its own times. */
export function isRowStarted(row: AddMonthRow): boolean {
  return (
    row.title.trim() !== "" ||
    row.description.trim() !== "" ||
    row.photo !== null ||
    row.timeOverride !== null
  );
}

/** The template's place as the shared edit's starting values. An online
 *  template reads as the Online hood with its join link. */
export function placeValuesFromTemplate(
  template: EventBatchTemplateDTO,
): AddMonthPlaceValues {
  const isOnline = template.isOnline;
  return {
    hood: isOnline ? ONLINE_HOOD_VALUE : (template.neighbourhood ?? ""),
    venue: isOnline ? "" : (template.venue ?? ""),
    venueListingId: isOnline ? null : template.listingId,
    venueListing: isOnline ? null : template.venueListing,
    address: isOnline ? "" : (template.address ?? ""),
    directions: isOnline ? "" : (template.arrivalNotes ?? ""),
    onlineUrl: template.onlineUrl ?? "",
  };
}

/**
 * The cost kind a template carries, or the closest reading of a legacy one.
 * An event written before the field existed has a null `costKind` and only
 * its free-text `cost`. Reading that as "free" would drop the price from the
 * whole month (a free kind sends no cost), so any written cost reads as
 * `fixed` with the host's own words kept beside it. Mirrors `seedCostKind`
 * in `gatheringSeed.ts`.
 */
export function costKindOfTemplate(template: EventBatchTemplateDTO): CostKind {
  if (template.costKind) return template.costKind;
  return template.cost?.trim() ? "fixed" : "free";
}

/** The template's cost as the shared edit's starting values. */
export function costValuesFromTemplate(
  template: EventBatchTemplateDTO,
): AddMonthCostValues {
  return {
    costKind: costKindOfTemplate(template),
    cost: template.cost ?? "",
    paymentUrl: template.paymentUrl ?? "",
    paymentInstructions: template.paymentInstructions ?? "",
  };
}

/** A photo after a new key: an empty key clears it, the same key keeps it
 *  with its preview, and a new key waits for its own preview. */
function photoForKey(
  current: AddMonthPhoto | null,
  key: string,
): AddMonthPhoto | null {
  if (key === "") return null;
  if (current?.key === key) return current;
  return { key, previewUrl: null };
}

/** A photo after a preview arrives: applied only while the photo still holds
 *  the key the preview belongs to, so a late preview for a replaced photo is
 *  dropped. */
function photoWithPreview(
  current: AddMonthPhoto | null,
  key: string,
  previewUrl: string | null,
): AddMonthPhoto | null {
  if (current === null || current.key !== key) return current;
  return { ...current, previewUrl };
}

function updateRow(
  state: AddMonthState,
  date: string,
  change: (row: AddMonthRow) => AddMonthRow,
): AddMonthState {
  if (!state.rows.some((row) => row.date === date)) return state;
  return {
    ...state,
    rows: state.rows.map((row) => (row.date === date ? change(row) : row)),
  };
}

function removeDate(state: AddMonthState, date: string): AddMonthState {
  const removedRow = state.rows.find((row) => row.date === date);
  if (!removedRow) return state;
  const { [date]: _previousStash, ...otherStashedRows } = state.stashedRows;
  return {
    ...state,
    rows: state.rows.filter((row) => row.date !== date),
    stashedRows: isRowStarted(removedRow)
      ? { ...otherStashedRows, [date]: removedRow }
      : otherStashedRows,
  };
}

function addDate(state: AddMonthState, date: string): AddMonthState {
  if (state.rows.length >= EVENT_BATCH_MAX_ROWS) return state;
  const { [date]: stashedRow, ...otherStashedRows } = state.stashedRows;
  const rowsByDate = new Map(state.rows.map((row) => [row.date, row]));
  rowsByDate.set(date, stashedRow ?? emptyRow(date));
  const rows = sortedDates(rowsByDate.keys()).flatMap((rowDate) => {
    const row = rowsByDate.get(rowDate);
    return row ? [row] : [];
  });
  return { ...state, rows, stashedRows: otherStashedRows };
}

function toggleDate(state: AddMonthState, date: string): AddMonthState {
  const isSelected = state.rows.some((row) => row.date === date);
  return isSelected ? removeDate(state, date) : addDate(state, date);
}

/** A new template clears the shared place, cost and cover edits, which
 *  belonged to the old one. The rows and the shared times stay. */
function pickTemplate(state: AddMonthState, slug: string): AddMonthState {
  if (state.templateSlug === slug) return state;
  return {
    ...state,
    templateSlug: slug,
    place: null,
    cost: null,
    sharedCover: null,
  };
}

/** Each template sets the shared times once, so a restored draft keeps the
 *  times the host chose when the template loads again. */
function applyTemplateTimes(
  state: AddMonthState,
  template: EventBatchTemplateDTO,
): AddMonthState {
  if (state.timesTemplateSlug === template.slug) return state;
  return {
    ...state,
    timesTemplateSlug: template.slug,
    times: { startTime: template.startTime, endTime: template.endTime },
  };
}

function reduceRowAction(
  state: AddMonthState,
  action: Extract<
    AddMonthAction,
    {
      type: "editRow" | "setRowPhotoKey" | "setRowPhotoPreview" | "setRowTime";
    }
  >,
): AddMonthState {
  switch (action.type) {
    case "editRow":
      return updateRow(state, action.date, (row) => ({
        ...row,
        ...action.patch,
      }));
    case "setRowPhotoKey":
      return updateRow(state, action.date, (row) => ({
        ...row,
        photo: photoForKey(row.photo, action.key),
      }));
    case "setRowPhotoPreview":
      return updateRow(state, action.date, (row) => ({
        ...row,
        photo: photoWithPreview(row.photo, action.key, action.previewUrl),
      }));
    case "setRowTime":
      return updateRow(state, action.date, (row) => ({
        ...row,
        timeOverride: action.timeOverride,
      }));
  }
}

function reduceSharedAction(
  state: AddMonthState,
  action: Extract<
    AddMonthAction,
    {
      type:
        | "setSharedTimes"
        | "setSharedCoverKey"
        | "setSharedCoverPreview"
        | "startEditingShared"
        | "patchPlace"
        | "patchCost"
        | "resetShared";
    }
  >,
): AddMonthState {
  switch (action.type) {
    case "setSharedTimes":
      return { ...state, times: action.times };
    case "setSharedCoverKey":
      return {
        ...state,
        sharedCover: photoForKey(state.sharedCover, action.key),
      };
    case "setSharedCoverPreview":
      return {
        ...state,
        sharedCover: photoWithPreview(
          state.sharedCover,
          action.key,
          action.previewUrl,
        ),
      };
    case "startEditingShared":
      return { ...state, place: action.place, cost: action.cost };
    case "patchPlace":
      if (state.place === null) return state;
      return { ...state, place: { ...state.place, ...action.patch } };
    case "patchCost":
      if (state.cost === null) return state;
      return { ...state, cost: { ...state.cost, ...action.patch } };
    case "resetShared":
      return { ...state, place: null, cost: null };
  }
}

export function addMonthReducer(
  state: AddMonthState,
  action: AddMonthAction,
): AddMonthState {
  switch (action.type) {
    case "pickTemplate":
      return pickTemplate(state, action.slug);
    case "applyTemplateTimes":
      return applyTemplateTimes(state, action.template);
    case "toggleDate":
      return toggleDate(state, action.date);
    case "removeDate":
      return removeDate(state, action.date);
    case "editRow":
    case "setRowPhotoKey":
    case "setRowPhotoPreview":
    case "setRowTime":
      return reduceRowAction(state, action);
    case "setSharedTimes":
    case "setSharedCoverKey":
    case "setSharedCoverPreview":
    case "startEditingShared":
    case "patchPlace":
    case "patchCost":
    case "resetShared":
      return reduceSharedAction(state, action);
    case "togglePledge": {
      const pledges: [boolean, boolean] = [...state.pledges];
      pledges[action.index] = !pledges[action.index];
      return { ...state, pledges };
    }
    case "restore":
      return action.state;
    case "reset":
      return EMPTY_ADD_MONTH_STATE;
  }
}
