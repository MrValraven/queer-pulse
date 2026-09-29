/**
 * The forecast's door. "N pieces may miss close" in the rail turns on the
 * `at-risk` focus chip, whose predicate is the forecast's own per-piece rule
 * (`forecastPieceReason`), so the table shows exactly the pieces the rail
 * counted. The handler shows the table grouped by who holds each piece,
 * makes `at-risk` the only chip, and clears the search and the format,
 * stage, section and editor filters, any of which could hide one of them.
 *
 * The rail sits beside the table on wide screens and under it below
 * `--desk-split`; either way the button that asked is away from the rows it
 * just filtered. Once the at-risk view has rendered, focus moves to the
 * table's first group heading, so keyboard and screen reader users land
 * where the answer is, and the page scrolls that group into view when it is
 * off screen. The chip lives in the URL, and the router commits that write
 * as a transition, which on a busy desk can land many frames after the
 * click. So a pending reveal has no clock: it waits for the at-risk view to
 * appear, and it is cancelled only when the viewer moves away from what the
 * click set (another filter, search, layout or chip). An unrelated re-render
 * (a pieces refetch, a presence tick) leaves a pending request untouched.
 */

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";
import type { EditorDesk } from "./useEditorDesk";

/** True when all of `element` sits inside the viewport, below whatever its
 *  own `scroll-margin-top` keeps clear for the sticky bands above it. */
function isFullyInView(element: HTMLElement): boolean {
  const bounds = element.getBoundingClientRect();
  const clearTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  return bounds.top >= clearTop && bounds.bottom <= window.innerHeight;
}

/** Focuses the first group heading of the table in `tableElement`, found by
 *  the stable `data-desk-group-heading` marker every `PieceGroupHeader`
 *  carries (`querySelector` returns the first DOM match, which is the first
 *  group), and scrolls the group into view when it is off screen. Its first
 *  row carries the scroll margin that clears the sticky group header, so the
 *  row leads when it is drawn; the group container is the toggle's own
 *  grandparent (`PieceGroupHeader` always renders `<h2><button
 *  data-desk-group-heading>…</button></h2>` inside `PiecesPipeline`'s
 *  `.group` wrapper). */
function revealFirstGroup(tableElement: HTMLElement): void {
  const headingButton = tableElement.querySelector<HTMLElement>(
    "[data-desk-group-heading]",
  );
  const groupElement = headingButton?.parentElement?.parentElement;
  if (!headingButton || !groupElement) return;
  const firstRow = groupElement.querySelector<HTMLElement>("[data-focus]");
  const scrollTarget = firstRow ?? groupElement;
  if (!isFullyInView(scrollTarget)) {
    scrollTarget.scrollIntoView?.({
      block: "start",
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    });
  }
  headingButton.focus({ preventScroll: true });
}

export function useDeskShowAtRisk(desk: EditorDesk) {
  const { deskState, focus } = desk;
  const tableRef = useRef<HTMLDivElement>(null);
  // Each request gets a number, so a reveal can run again on a second press
  // even when the view was already showing the at-risk pieces (nothing else
  // would change to trigger a new effect run in that case).
  const [revealRequest, setRevealRequest] = useState(0);
  const handledRequestRef = useRef(0);
  // True from the moment a request is made until it resolves one of two
  // ways: the at-risk view appears, or the viewer moves away from what the
  // click set (both below). Never inferred from how many times this hook's
  // effect has re-run.
  const isPendingRef = useRef(false);
  // The chips that were on when the request was made. Until the URL write
  // lands the page still shows these; any other set is the viewer's own.
  const requestedFromFocusKeyRef = useRef("");
  const focusKey = focus.activeFocusIds.join(",");

  // Every filter `showAtRisk` sets, other than the focus chip itself (it can
  // lag behind, since the chip writes the URL). While a request is pending,
  // this staying `true` is the "still just waiting" case; it going `false`
  // is the viewer explicitly doing something else, which cancels the request
  // outright, since the view it waits for can no longer appear.
  const isAtRiskFilterStateHeld =
    desk.layout === "list" &&
    deskState.groupBy === "waiting" &&
    deskState.q === "" &&
    deskState.fmt === "all" &&
    deskState.stageFilter.length === 0 &&
    deskState.sectionFilter.length === 0 &&
    deskState.editorFilter === null;
  const isAtRiskViewShown = isAtRiskFilterStateHeld && focusKey === "at-risk";

  useEffect(() => {
    if (revealRequest === handledRequestRef.current) return;
    if (!isPendingRef.current) return;
    // Resolved one way or the other below; both branches stop tracking this
    // request the same way.
    function resolve(): void {
      handledRequestRef.current = revealRequest;
      isPendingRef.current = false;
    }
    if (isAtRiskViewShown) {
      resolve();
      if (desk.groups.length > 0 && tableRef.current) {
        revealFirstGroup(tableRef.current);
      }
      return;
    }
    const hasViewerChangedChips =
      focusKey !== requestedFromFocusKeyRef.current && focusKey !== "at-risk";
    if (!isAtRiskFilterStateHeld || hasViewerChangedChips) resolve();
    // Otherwise the chip's URL write has not landed yet: leave the request
    // pending for a later render.
  }, [
    revealRequest,
    isAtRiskViewShown,
    isAtRiskFilterStateHeld,
    focusKey,
    desk.groups,
  ]);

  function showAtRisk(): void {
    desk.setLayout("list");
    deskState.setGroupBy("waiting");
    deskState.setQ("");
    deskState.setFmt("all");
    deskState.setStageFilter([]);
    deskState.setSectionFilter([]);
    deskState.setEditorFilter(null);
    focus.showOnlyFocus("at-risk");
    isPendingRef.current = true;
    requestedFromFocusKeyRef.current = focusKey;
    setRevealRequest((request) => request + 1);
  }

  return { tableRef, showAtRisk };
}
