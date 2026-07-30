import type { RoadmapColumn, RoadmapItemWriteBody } from "./api/roadmapAdmin.api";
import type { AdminRoadmapItem } from "./adminRoadmap.data";

/**
 * Controlled-form mirror of `RoadmapItemWriteBody`. Every field the editor
 * can show lives here as a plain string/boolean so inputs stay simple
 * controlled components — `buildRoadmapItemWriteBody` below folds this back
 * into the column-scoped write body on submit, the same
 * draft-in/write-body-out shape as `adminOrgTierForm.utils.ts`.
 */
export interface RoadmapItemFormDraft {
  column: RoadmapColumn;
  category: string;
  name: string;
  description: string;
  /** Shipped only, e.g. "May 2026". */
  date: string;
  /** Building only, e.g. "In progress". */
  stage: string;
  /** Building only, e.g. "~Q3 2026". */
  eta: string;
  /** Building only, 0-100, kept as a string for the controlled number input. */
  progress: string;
  /** Planned only, kept as a string for the controlled number input. */
  votes: string;
  /** Shipped/building only. */
  requested: boolean;
  /** Planned only — the "🔥 Hot" badge. */
  hot: boolean;
}

export function blankRoadmapItemDraft(
  column: RoadmapColumn,
): RoadmapItemFormDraft {
  return {
    column,
    category: "",
    name: "",
    description: "",
    date: "",
    stage: "",
    eta: "",
    progress: "",
    votes: "",
    requested: false,
    hot: false,
  };
}

/** Seeds the form from an existing item, or a blank draft (pre-set to
 *  `initialColumn`) for "New item". */
export function draftFromRoadmapItem(
  item: AdminRoadmapItem | null,
  initialColumn: RoadmapColumn,
): RoadmapItemFormDraft {
  if (!item) return blankRoadmapItemDraft(initialColumn);
  return {
    column: item.column,
    category: item.category,
    name: item.name,
    description: item.description,
    date: item.date ?? "",
    stage: item.stage ?? "",
    eta: item.eta ?? "",
    progress: item.progress === null ? "" : String(item.progress),
    votes: String(item.votes),
    requested: item.requested,
    hot: item.hot,
  };
}

/**
 * Converts the controlled-input draft back into the API write shape,
 * scoped to the selected `column` — fields the selected column doesn't use
 * are folded to `null` (nullable fields) or an inert default (`votes: 0`,
 * `requested: false`, `hot: false`) rather than carrying over a stale value
 * from a column the item just moved out of. `sortOrder` is computed by the
 * caller (append-to-end on create, or on a column move; unchanged otherwise)
 * since the modal has no ordering UI of its own.
 */
export function buildRoadmapItemWriteBody(
  draft: RoadmapItemFormDraft,
  sortOrder: number,
): RoadmapItemWriteBody {
  const base = {
    column: draft.column,
    category: draft.category.trim(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    sortOrder,
  };

  if (draft.column === "shipped") {
    return {
      ...base,
      date: draft.date.trim() || null,
      stage: null,
      eta: null,
      progress: null,
      votes: 0,
      requested: draft.requested,
      hot: false,
    };
  }

  if (draft.column === "building") {
    return {
      ...base,
      date: null,
      stage: draft.stage.trim() || null,
      eta: draft.eta.trim() || null,
      progress: draft.progress.trim() === "" ? null : Number(draft.progress),
      votes: 0,
      requested: draft.requested,
      hot: false,
    };
  }

  // planned
  return {
    ...base,
    date: null,
    stage: null,
    eta: null,
    progress: null,
    votes: draft.votes.trim() === "" ? 0 : Number(draft.votes),
    requested: false,
    hot: draft.hot,
  };
}
