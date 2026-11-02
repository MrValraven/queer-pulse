import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { isUpcoming } from "../personaSkinRender";
import {
  commitDraftRow,
  reorderRow,
  type SubprofileEditorRow,
} from "../subprofileSectionEditorRows";
import { gigSortTime } from "./gigDate";

/** One gig row with its slot in the flat, persisted `sectionRows["gigs"]`. */
export interface GigRowEntry {
  row: SubprofileEditorRow;
  globalIndex: number;
}

/** The flat gig list split the way the public stage page splits it. */
export interface GigRowGroups {
  upcoming: GigRowEntry[];
  past: GigRowEntry[];
}

/** Which of the two editor groups a gig belongs to. */
export type GigGroupName = "upcoming" | "past";

/**
 * Splits the flat gig list into Upcoming and Past with the SAME `isUpcoming`
 * rule the public stage page uses (an empty or unparseable date is Past).
 * Relative order inside each group follows the flat array, and the flat array
 * itself is never reordered or mutated.
 */
export function groupGigRows(rows: SubprofileEditorRow[]): GigRowGroups {
  const groups: GigRowGroups = { upcoming: [], past: [] };
  rows.forEach((row, globalIndex) => {
    const groupName: GigGroupName = isUpcoming(row.date) ? "upcoming" : "past";
    groups[groupName].push({ row, globalIndex });
  });
  return groups;
}

/** Writes `replacements` back into the flat array at the given slots. */
function writeIntoSlots(
  rows: SubprofileEditorRow[],
  slots: number[],
  replacements: SubprofileEditorRow[],
): SubprofileEditorRow[] {
  const next = [...rows];
  slots.forEach((slot, groupIndex) => {
    next[slot] = replacements[groupIndex]!;
  });
  return next;
}

/**
 * Moves one gig from one position to another INSIDE its group (positions are
 * group-local). The group's own flat slots are reused, so rows of the other
 * group never move. A no-op for equal or out-of-range positions.
 */
export function reorderWithinGroup(
  rows: SubprofileEditorRow[],
  group: GigGroupName,
  fromGroupIndex: number,
  toGroupIndex: number,
): SubprofileEditorRow[] {
  const entries = groupGigRows(rows)[group];
  const groupRows = entries.map((entry) => entry.row);
  const reorderedRows = reorderRow(groupRows, fromGroupIndex, toGroupIndex);
  if (reorderedRows === groupRows) return rows;
  return writeIntoSlots(
    rows,
    entries.map((entry) => entry.globalIndex),
    reorderedRows,
  );
}

/** Swaps a gig with its neighbour inside its group; a no-op at a group edge. */
export function moveWithinGroup(
  rows: SubprofileEditorRow[],
  group: GigGroupName,
  groupIndex: number,
  direction: -1 | 1,
): SubprofileEditorRow[] {
  return reorderWithinGroup(rows, group, groupIndex, groupIndex + direction);
}

/** Orders two gigs of one group: upcoming ascending, past descending, and
 *  gigs without a readable date last. */
function compareGigRows(group: GigGroupName) {
  return (first: SubprofileEditorRow, second: SubprofileEditorRow): number => {
    const firstTime = gigSortTime(first.date);
    const secondTime = gigSortTime(second.date);
    if (firstTime === null && secondTime === null) return 0;
    if (firstTime === null) return 1;
    if (secondTime === null) return -1;
    return group === "upcoming"
      ? firstTime - secondTime
      : secondTime - firstTime;
  };
}

/**
 * Sorts each group by date (upcoming ascending, past descending, undated gigs
 * last) inside the group's own flat slots. Equal dates keep their relative
 * order. Rows never cross between groups.
 */
export function sortGigsByDate(
  rows: SubprofileEditorRow[],
): SubprofileEditorRow[] {
  const groups = groupGigRows(rows);
  let next = rows;
  (["upcoming", "past"] as const).forEach((groupName) => {
    const entries = groups[groupName];
    const sortedRows = entries
      .map((entry) => entry.row)
      .sort(compareGigRows(groupName));
    next = writeIntoSlots(
      next,
      entries.map((entry) => entry.globalIndex),
      sortedRows,
    );
  });
  return next;
}

/** Inserts `newRow` into the flat array at the date-sorted spot of its group
 *  (after equal dates; undated gigs go last in the group). */
function insertDateSorted(
  rows: SubprofileEditorRow[],
  newRow: SubprofileEditorRow,
  group: GigGroupName,
): SubprofileEditorRow[] {
  const entries = groupGigRows(rows)[group];
  const newTime = gigSortTime(newRow.date);
  const followingEntry =
    newTime === null
      ? undefined
      : entries.find((entry) => {
          const entryTime = gigSortTime(entry.row.date);
          if (entryTime === null) return false;
          return group === "upcoming"
            ? entryTime > newTime
            : entryTime < newTime;
        });
  const lastEntry = entries[entries.length - 1];
  const insertAt = followingEntry
    ? followingEntry.globalIndex
    : lastEntry
      ? lastEntry.globalIndex + 1
      : rows.length;
  const next = [...rows];
  next.splice(insertAt, 0, newRow);
  return next;
}

/**
 * Commits the gig drawer's draft into the flat list. Spotlight stays
 * single-select within gigs (same rule as `toggleRowFeature`). A NEW gig lands
 * date-sorted in its group (upcoming ascending, past descending). An edited
 * gig keeps its slot when it stays in its group, and re-enters the other
 * group date-sorted when the new date moves it across. `landedGroup` names the
 * group the saved gig ended up in, so the Past group can auto-open.
 */
export function commitGigDraft(
  rows: SubprofileEditorRow[],
  draft: SubprofileItemView,
  editingUid: string | null,
): { rows: SubprofileEditorRow[]; landedGroup: GigGroupName } {
  const landedGroup: GigGroupName = isUpcoming(draft.date)
    ? "upcoming"
    : "past";
  const originalRow =
    editingUid === null
      ? undefined
      : rows.find((row) => row._uid === editingUid);
  const committedRows = commitDraftRow(
    rows,
    draft,
    originalRow ? originalRow._uid : null,
  );
  if (originalRow) {
    const originalGroup: GigGroupName = isUpcoming(originalRow.date)
      ? "upcoming"
      : "past";
    if (originalGroup === landedGroup) {
      return { rows: committedRows, landedGroup };
    }
  }
  const committedUid = originalRow
    ? originalRow._uid
    : committedRows[committedRows.length - 1]?._uid;
  const committedRow = committedRows.find((row) => row._uid === committedUid);
  if (!committedRow) return { rows: committedRows, landedGroup };
  const remainingRows = committedRows.filter(
    (row) => row._uid !== committedUid,
  );
  return {
    rows: insertDateSorted(remainingRows, committedRow, landedGroup),
    landedGroup,
  };
}
