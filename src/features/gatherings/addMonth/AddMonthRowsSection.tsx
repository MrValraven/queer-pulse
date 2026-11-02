import { useCallback, useEffect, useMemo, useRef, type Dispatch } from "react";
import type { EventBatchTemplateDTO } from "../api/eventBatch.api";
import { ADD_MONTH_SECTION_IDS } from "./addMonth.data";
import type {
  AddMonthAction,
  AddMonthRow,
  AddMonthRowIssue,
  AddMonthState,
} from "./addMonthState";
import styles from "./AddEventMonthPage.module.css";
import {
  ADD_MONTH_ROWS_HEADING_ID,
  AddMonthRowList,
  type AddMonthRowContext,
} from "./AddMonthRowList";
import {
  ADD_MONTH_DATES_HEADING_ID,
  addMonthRowHeadingId,
  focusElementById,
  type AddMonthServerIssue,
} from "./useAddMonthPublish";

/** Where focus lands after a card is removed: the next card's date, the
 *  card before it when the last one went, or the calendar once none is left. */
function focusTargetAfterRemoving(rows: AddMonthRow[], date: string): string {
  const removedIndex = rows.findIndex((row) => row.date === date);
  const neighbour = rows[removedIndex + 1] ?? rows[removedIndex - 1];
  return neighbour
    ? addMonthRowHeadingId(neighbour.date)
    : ADD_MONTH_DATES_HEADING_ID;
}

/** The page's dispatch for the cards, which also moves focus off a card the
 *  host removed once it has left the list. */
function useRowDispatch(
  rows: AddMonthRow[],
  dispatch: Dispatch<AddMonthAction>,
): Dispatch<AddMonthAction> {
  const latestRowsRef = useRef(rows);
  const pendingFocusIdRef = useRef<string | null>(null);
  useEffect(() => {
    latestRowsRef.current = rows;
    const focusId = pendingFocusIdRef.current;
    if (focusId === null) return;
    pendingFocusIdRef.current = null;
    focusElementById(focusId);
  }, [rows]);
  return useCallback(
    (action: AddMonthAction) => {
      if (action.type === "removeDate") {
        pendingFocusIdRef.current = focusTargetAfterRemoving(
          latestRowsRef.current,
          action.date,
        );
      }
      dispatch(action);
    },
    [dispatch],
  );
}

/** The cards' issues with the one the server named added to its card, so
 *  the field it names reads as invalid. */
function issuesWithServer(
  issues: Record<string, AddMonthRowIssue[]>,
  serverIssue: AddMonthServerIssue | null,
): Record<string, AddMonthRowIssue[]> {
  if (serverIssue === null) return issues;
  const serverMark: AddMonthRowIssue = {
    field: serverIssue.field,
    problem: "server",
  };
  return {
    ...issues,
    [serverIssue.date]: [...(issues[serverIssue.date] ?? []), serverMark],
  };
}

/** Section 3 of the month page: one card per picked date. */
export function AddMonthRowsSection({
  state,
  dispatch,
  template,
  issues,
  serverIssue,
  shouldShowIssues,
}: {
  state: AddMonthState;
  dispatch: Dispatch<AddMonthAction>;
  template: EventBatchTemplateDTO;
  issues: Record<string, AddMonthRowIssue[]>;
  serverIssue: AddMonthServerIssue | null;
  shouldShowIssues: boolean;
}) {
  const rowDispatch = useRowDispatch(state.rows, dispatch);
  const sharedCover = state.sharedCover;
  const context = useMemo<AddMonthRowContext>(
    () => ({
      sharedTimes: state.times,
      sharedCoverUrl: sharedCover
        ? sharedCover.previewUrl
        : template.coverImageUrl,
      templateDescription: template.description,
      shouldShowIssues,
      dispatch: rowDispatch,
    }),
    [
      rowDispatch,
      sharedCover,
      shouldShowIssues,
      state.times,
      template.coverImageUrl,
      template.description,
    ],
  );
  const shownIssues = useMemo(
    () => issuesWithServer(issues, serverIssue),
    [issues, serverIssue],
  );
  return (
    <section
      id={ADD_MONTH_SECTION_IDS.rows}
      className={styles.section}
      aria-labelledby={ADD_MONTH_ROWS_HEADING_ID}
    >
      <AddMonthRowList
        rows={state.rows}
        issues={shownIssues}
        serverIssue={serverIssue}
        context={context}
      />
    </section>
  );
}
