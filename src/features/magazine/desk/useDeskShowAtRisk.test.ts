import { useState } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Stage } from "../data/desk.data";
import type { DeskFocusId } from "./deskFocus";
import type { DeskGroupBy } from "./pipelineGroups";
import type { DeskLayoutOption } from "./DeskWorkbar";
import type { PieceFormatFilter } from "./useDeskState";
import type { EditorDesk } from "./useEditorDesk";
import { useDeskShowAtRisk } from "./useDeskShowAtRisk";

// The reveal is request-scoped and has no clock. The router commits the
// chip's URL write as a transition, which on a busy desk lands many frames
// after the click, and a two-frame expiry once dropped every reveal because
// of it. So a request waits for the at-risk view to appear, and only the
// viewer moving away from what the click set cancels it.

/** Waits for one real animation-frame tick (jsdom implements a real
 *  `requestAnimationFrame`), wrapped in `act` so any state the callback
 *  touches is flushed before assertions run. */
async function flushOneAnimationFrame(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** A table shape matching `PiecesPipeline`'s real DOM closely enough for
 *  `revealFirstGroup` to act on: a wrapper (what `tableRef` lands on, one
 *  level up from the heading) holding an `<h2>` with the
 *  `data-desk-group-heading` toggle button `PieceGroupHeader` renders.
 *  Mounted into `document.body` so a real `.focus()` call actually moves
 *  `document.activeElement`, the way jsdom requires. */
function mountFakeTable(): {
  table: HTMLDivElement;
  headingButton: HTMLButtonElement;
} {
  const table = document.createElement("div");
  const heading = document.createElement("h2");
  const headingButton = document.createElement("button");
  headingButton.type = "button";
  headingButton.setAttribute("data-desk-group-heading", "");
  headingButton.textContent = "Late";
  heading.appendChild(headingButton);
  table.appendChild(heading);
  document.body.appendChild(table);
  return { table, headingButton };
}

/** Places `element` below the viewport, the way the table's first group
 *  sits when the rail is stacked under it and the viewer has scrolled down
 *  to the forecast. */
function placeBelowViewport(element: HTMLElement): void {
  const top = window.innerHeight + 400;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + 48,
    left: 0,
    right: 600,
    width: 600,
    height: 48,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
}

interface HarnessState {
  layout: DeskLayoutOption;
  groupBy: DeskGroupBy;
  q: string;
  fmt: PieceFormatFilter;
  stageFilter: Stage[];
  sectionFilter: string[];
  editorFilter: string | null;
  activeFocusIds: DeskFocusId[];
}

/** A busy desk state (another layout, a search term, a filter or two, a
 *  chip): a realistic "before" for `showAtRisk` to clear. */
function busyInitialState(): HarnessState {
  return {
    layout: "board",
    groupBy: "stage",
    q: "urgent",
    fmt: "article",
    stageFilter: ["Drafting"],
    sectionFilter: ["Culture"],
    editorFilter: "ed-1",
    activeFocusIds: ["mine"],
  };
}

/** The chip `showOnlyFocus` was asked for and has not written yet. */
interface PendingFocusWrite {
  focusId: DeskFocusId | null;
}

/** The slice of `EditorDesk` `useDeskShowAtRisk` reads, backed by one
 *  `useState` so calling `desk.setLayout` etc. really re-renders the hook
 *  with updated values, the way `useEditorDesk`'s own state does on the real
 *  page. `desk.groups` is a fresh array literal every render, the way a real
 *  grouping memo can get a new reference for unrelated reasons.
 *  `showOnlyFocus` only *records* the chip it was asked for; a test delivers
 *  it with `landFocusWrite`, standing in for the router's URL write landing
 *  later than the local filters. */
function useHarness(showOnlyFocus: (id: DeskFocusId) => void) {
  const [state, setState] = useState<HarnessState>(busyInitialState);

  function patch(changes: Partial<HarnessState>): void {
    setState((current) => ({ ...current, ...changes }));
  }

  const desk = {
    layout: state.layout,
    setLayout: (layout: DeskLayoutOption) => patch({ layout }),
    groups: [{ id: "late" }],
    deskState: {
      groupBy: state.groupBy,
      setGroupBy: (groupBy: DeskGroupBy) => patch({ groupBy }),
      q: state.q,
      setQ: (q: string) => patch({ q }),
      fmt: state.fmt,
      setFmt: (fmt: PieceFormatFilter) => patch({ fmt }),
      stageFilter: state.stageFilter,
      setStageFilter: (stageFilter: Stage[]) => patch({ stageFilter }),
      sectionFilter: state.sectionFilter,
      setSectionFilter: (sectionFilter: string[]) => patch({ sectionFilter }),
      editorFilter: state.editorFilter,
      setEditorFilter: (editorFilter: string | null) => patch({ editorFilter }),
    },
    focus: { activeFocusIds: state.activeFocusIds, showOnlyFocus },
  } as unknown as EditorDesk;

  const { tableRef, showAtRisk } = useDeskShowAtRisk(desk);

  return {
    tableRef,
    showAtRisk,
    /** Forces a re-render with no field actually changing. */
    triggerUnrelatedRerender: () => patch({}),
    /** The chip's URL write landing: the ids the router now reports. */
    setActiveFocusIds: (activeFocusIds: DeskFocusId[]) =>
      patch({ activeFocusIds }),
    /** A filter change the viewer makes themselves. */
    changeFilterLikeAUser: () => patch({ q: "the viewer typed this" }),
    /** A chip the viewer turns on themselves before the write lands. */
    toggleChipLikeAUser: () => patch({ activeFocusIds: ["mine", "late"] }),
  };
}

let mountedTable: HTMLElement | null = null;

afterEach(() => {
  mountedTable?.remove();
  mountedTable = null;
  vi.restoreAllMocks();
});

function renderHarness() {
  const fakeTable = mountFakeTable();
  mountedTable = fakeTable.table;
  const scrollSpy = vi.fn();
  fakeTable.table.scrollIntoView = scrollSpy;
  const pendingWrite: PendingFocusWrite = { focusId: null };
  const showOnlyFocus = vi.fn((id: DeskFocusId) => {
    pendingWrite.focusId = id;
  });
  const { result } = renderHook(() => useHarness(showOnlyFocus));
  result.current.tableRef.current = fakeTable.table;
  /** Delivers the chip `showOnlyFocus` recorded, as the router would. */
  function landFocusWrite(): void {
    const requestedId = pendingWrite.focusId;
    if (!requestedId) return;
    pendingWrite.focusId = null;
    result.current.setActiveFocusIds([requestedId]);
  }
  return { ...fakeTable, scrollSpy, showOnlyFocus, landFocusWrite, result };
}

describe("useDeskShowAtRisk", () => {
  it("asks for at-risk as the only chip", () => {
    const { showOnlyFocus, result } = renderHarness();
    act(() => result.current.showAtRisk());
    expect(showOnlyFocus).toHaveBeenCalledWith("at-risk");
  });

  it("moves focus to the first group heading once the view lands, after unrelated re-renders", () => {
    const { table, headingButton, scrollSpy, landFocusWrite, result } =
      renderHarness();
    placeBelowViewport(table);

    act(() => result.current.showAtRisk());
    // The local filters landed; the chip's URL write is still pending.
    expect(document.activeElement).not.toBe(headingButton);

    act(() => result.current.triggerUnrelatedRerender());
    act(() => result.current.triggerUnrelatedRerender());
    expect(scrollSpy).not.toHaveBeenCalled();

    act(() => landFocusWrite());
    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(headingButton);
  });

  it("keeps waiting across several frames, as a transition-priority URL write does", async () => {
    const { headingButton, landFocusWrite, result } = renderHarness();

    act(() => result.current.showAtRisk());
    await flushOneAnimationFrame();
    await flushOneAnimationFrame();
    await flushOneAnimationFrame();
    act(() => landFocusWrite());

    expect(document.activeElement).toBe(headingButton);
  });

  it("focuses without scrolling when the group is already on screen beside the rail", () => {
    const { headingButton, scrollSpy, landFocusWrite, result } =
      renderHarness();

    act(() => result.current.showAtRisk());
    act(() => landFocusWrite());

    expect(scrollSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(headingButton);
  });

  it("cancels the reveal once the viewer changes a filter first", () => {
    const { headingButton, scrollSpy, landFocusWrite, result } =
      renderHarness();

    act(() => result.current.showAtRisk());
    act(() => result.current.changeFilterLikeAUser());
    // The write arrives anyway, after the viewer moved on.
    act(() => landFocusWrite());

    expect(scrollSpy).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(headingButton);
  });

  it("cancels the reveal once the viewer picks other chips first", () => {
    const { headingButton, landFocusWrite, result } = renderHarness();

    act(() => result.current.showAtRisk());
    act(() => result.current.toggleChipLikeAUser());
    act(() => landFocusWrite());

    expect(document.activeElement).not.toBe(headingButton);
  });
});
