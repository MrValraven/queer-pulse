import { DEFAULT_FIT_INSETS, type FitInsets } from "./vouchCanvasPaint";

/** E3 peek height of the phone inspector sheet as a share of the graph
 *  dialog (`max-height: 38%` in vouchGraphInspector.module.css). The fit
 *  keeps nodes above the peek; an expanded sheet is the admin's choice. */
export const SHEET_PEEK_SHARE = 0.38;
/** Room between a reserved overlay and the nearest node, in pixels. */
const RESERVE_GAP_PX = 12;

/** `data-fit-reserve` markers on the overlays the fit keeps nodes clear of:
 *  "top" on the path bar, "controls" on the zoom buttons. */
const FIT_RESERVE_ATTRIBUTE = "data-fit-reserve";
const FIT_RESERVE_TOP = "top";
const FIT_RESERVE_CONTROLS = "controls";

export interface StageFit {
  insets: FitInsets;
  /** Stage pixels the phone sheet covers at its peek, from the bottom. */
  occludedBottom: number;
}

export const DEFAULT_STAGE_FIT: StageFit = {
  insets: DEFAULT_FIT_INSETS,
  occludedBottom: 0,
};

/** The phone inspector sheet next to the stage, inside the same dialog. */
export function findInspectorSheet(stage: HTMLElement): HTMLElement | null {
  return (
    stage
      .closest<HTMLElement>('[role="dialog"]')
      ?.querySelector<HTMLElement>("aside[data-sheet]") ?? null
  );
}

/** How far the inspector's phone sheet, at its peek, reaches over the stage.
 *  Zero on the desktop rail (not absolutely placed) and while it is hidden. */
function sheetOcclusion(stage: HTMLElement, stageRect: DOMRect): number {
  const dialog = stage.closest<HTMLElement>('[role="dialog"]');
  const sheet = findInspectorSheet(stage);
  if (!dialog || !sheet) return 0;
  const sheetStyle = getComputedStyle(sheet);
  if (sheetStyle.display === "none" || sheetStyle.position !== "absolute") {
    return 0;
  }
  const dialogRect = dialog.getBoundingClientRect();
  // offsetHeight ignores the sheet's slide-in transform.
  const peekHeight = Math.min(
    sheet.offsetHeight,
    dialogRect.height * SHEET_PEEK_SHARE,
  );
  const sheetTop = dialogRect.bottom - peekHeight;
  return Math.min(Math.max(stageRect.bottom - sheetTop, 0), stageRect.height);
}

function reservedElement(
  stage: HTMLElement,
  marker: string,
): HTMLElement | null {
  return stage.querySelector<HTMLElement>(
    `[${FIT_RESERVE_ATTRIBUTE}="${marker}"]`,
  );
}

/** The fit box for the stage, in stage pixels: the top starts below the path
 *  bar's measured bottom edge (phone included), the zoom controls reserve
 *  the right (on compact viewports their whole row along the bottom, so no
 *  node sits under the buttons) and the phone sheet's peek the bottom.
 *  Layout offsets ignore transforms, so the controls' lift above the sheet
 *  is added back from `occludedBottom`. */
export function measureStageFit(
  stage: HTMLElement,
  stageRect: DOMRect,
  {
    isCompactViewport,
    isPathBarShown,
  }: { isCompactViewport: boolean; isPathBarShown: boolean },
): StageFit {
  const occludedBottom = sheetOcclusion(stage, stageRect);
  const insets: FitInsets = { ...DEFAULT_FIT_INSETS };
  const pathBar = isPathBarShown ? findPathBar(stage) : null;
  if (pathBar) {
    insets.top = Math.max(
      insets.top,
      pathBar.offsetTop + pathBar.offsetHeight + RESERVE_GAP_PX,
    );
  }
  let bottomReserve = occludedBottom > 0 ? occludedBottom + RESERVE_GAP_PX : 0;
  const controls = reservedElement(stage, FIT_RESERVE_CONTROLS);
  if (controls && isCompactViewport) {
    bottomReserve =
      occludedBottom + stage.clientHeight - controls.offsetTop + RESERVE_GAP_PX;
  } else if (controls) {
    insets.right = Math.max(
      insets.right,
      stage.clientWidth - controls.offsetLeft + RESERVE_GAP_PX,
    );
  }
  insets.bottom = Math.max(insets.bottom, bottomReserve);
  return { insets, occludedBottom };
}

export function isSameStageFit(first: StageFit, second: StageFit): boolean {
  return (
    first.occludedBottom === second.occludedBottom &&
    first.insets.top === second.insets.top &&
    first.insets.right === second.insets.right &&
    first.insets.bottom === second.insets.bottom &&
    first.insets.left === second.insets.left
  );
}

/** The path bar, while it is shown (the fit reserves its measured height). */
export function findPathBar(stage: HTMLElement): HTMLElement | null {
  return reservedElement(stage, FIT_RESERVE_TOP);
}
