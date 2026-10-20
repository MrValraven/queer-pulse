/** Label level of detail and greedy culling (spec A1, E3), in screen space.
 *  Candidates run in priority order and each keeps its label only when its
 *  box overlaps no kept box and sits on stage. A uniform grid hash keeps the
 *  overlap checks close to linear. */

export const LABEL_TOP_COUNT = 12;
export const LABEL_ZOOM_THRESHOLD = 1.15;
export const LABEL_ZOOM_THRESHOLD_COMPACT = 1.6;
export const LABEL_GRID_CELL_PX = 64;

/** Box geometry in screen pixels at zoom 1 (scaled by zoom). */
const LABEL_MAX_CHARACTERS = 16;
const LABEL_CHARACTER_WIDTH = 6.6;
const LABEL_HORIZONTAL_PADDING = 8;
const LABEL_HEIGHT = 16;
const LABEL_OFFSET_BELOW_NODE = 16;
/** The first two pinned ids (focus, selected) are always labelled. */
const ALWAYS_SHOWN_COUNT = 2;

export interface LabelSelectionInput {
  nodeIds: string[];
  pinnedIds: string[];
  weightFor: (id: string) => number;
  nameFor: (id: string) => string;
  screenPositionFor: (id: string) => { x: number; y: number } | null;
  radiusFor: (id: string) => number;
  zoom: number;
  stageSize: { width: number; height: number };
  isCompactViewport: boolean;
}

interface LabelBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function labelBoxFor(id: string, input: LabelSelectionInput): LabelBox | null {
  const screenPosition = input.screenPositionFor(id);
  if (!screenPosition) return null;
  const { zoom } = input;
  const characterCount = Math.min(
    Array.from(input.nameFor(id)).length,
    LABEL_MAX_CHARACTERS,
  );
  const width =
    characterCount * LABEL_CHARACTER_WIDTH * zoom + LABEL_HORIZONTAL_PADDING;
  const height = LABEL_HEIGHT * zoom;
  const centerY =
    screenPosition.y + (input.radiusFor(id) + LABEL_OFFSET_BELOW_NODE) * zoom;
  return {
    left: screenPosition.x - width / 2,
    right: screenPosition.x + width / 2,
    top: centerY - height / 2,
    bottom: centerY + height / 2,
  };
}

function boxesOverlap(first: LabelBox, second: LabelBox): boolean {
  return (
    first.left < second.right &&
    second.left < first.right &&
    first.top < second.bottom &&
    second.top < first.bottom
  );
}

function isCentreOnStage(
  box: LabelBox,
  stageSize: { width: number; height: number },
): boolean {
  const centerX = (box.left + box.right) / 2;
  const centerY = (box.top + box.bottom) / 2;
  return (
    centerX >= 0 &&
    centerX <= stageSize.width &&
    centerY >= 0 &&
    centerY <= stageSize.height
  );
}

/** Uniform grid of kept boxes, keyed by cell. */
class LabelGrid {
  private readonly cells = new Map<string, LabelBox[]>();

  private forEachCell(box: LabelBox, visit: (key: string) => boolean | void) {
    const firstColumn = Math.floor(box.left / LABEL_GRID_CELL_PX);
    const lastColumn = Math.floor(box.right / LABEL_GRID_CELL_PX);
    const firstRow = Math.floor(box.top / LABEL_GRID_CELL_PX);
    const lastRow = Math.floor(box.bottom / LABEL_GRID_CELL_PX);
    for (let column = firstColumn; column <= lastColumn; column++) {
      for (let row = firstRow; row <= lastRow; row++) {
        if (visit(`${column}:${row}`) === true) return;
      }
    }
  }

  overlapsAny(box: LabelBox): boolean {
    let hasOverlap = false;
    this.forEachCell(box, (key) => {
      const keptBoxes = this.cells.get(key);
      hasOverlap =
        keptBoxes?.some((keptBox) => boxesOverlap(box, keptBox)) ?? false;
      return hasOverlap;
    });
    return hasOverlap;
  }

  add(box: LabelBox): void {
    this.forEachCell(box, (key) => {
      const keptBoxes = this.cells.get(key);
      if (keptBoxes) keptBoxes.push(box);
      else this.cells.set(key, [box]);
    });
  }
}

/** Candidate ids in priority order: pinned ids, then the top weighted ids
 *  (none on compact viewports), then, once zoomed in past the threshold,
 *  everyone else by weight. */
function candidatesInPriorityOrder(input: LabelSelectionInput): string[] {
  const nodeIdSet = new Set(input.nodeIds);
  const orderedIds: string[] = [];
  const seenIds = new Set<string>();
  for (const pinnedId of input.pinnedIds) {
    if (!nodeIdSet.has(pinnedId) || seenIds.has(pinnedId)) continue;
    seenIds.add(pinnedId);
    orderedIds.push(pinnedId);
  }
  const zoomThreshold = input.isCompactViewport
    ? LABEL_ZOOM_THRESHOLD_COMPACT
    : LABEL_ZOOM_THRESHOLD;
  const isZoomedIn = input.zoom >= zoomThreshold;
  const topCount = input.isCompactViewport ? 0 : LABEL_TOP_COUNT;
  if (!isZoomedIn && topCount === 0) return orderedIds;

  const weightById = new Map<string, number>();
  const remainingIds: string[] = [];
  for (const id of input.nodeIds) {
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    weightById.set(id, input.weightFor(id));
    remainingIds.push(id);
  }
  remainingIds.sort(
    (firstId, secondId) =>
      weightById.get(secondId)! - weightById.get(firstId)! ||
      (firstId < secondId ? -1 : firstId > secondId ? 1 : 0),
  );
  const rankedIds = isZoomedIn ? remainingIds : remainingIds.slice(0, topCount);
  return orderedIds.concat(rankedIds);
}

/** Ids whose name label shows on this paint. */
export function selectVisibleLabels(input: LabelSelectionInput): Set<string> {
  const alwaysShownIds = new Set(input.pinnedIds.slice(0, ALWAYS_SHOWN_COUNT));
  const visibleIds = new Set<string>();
  const grid = new LabelGrid();
  for (const id of candidatesInPriorityOrder(input)) {
    const box = labelBoxFor(id, input);
    const isAlwaysShown = alwaysShownIds.has(id);
    if (!box) {
      if (isAlwaysShown) visibleIds.add(id);
      continue;
    }
    if (!isAlwaysShown) {
      if (!isCentreOnStage(box, input.stageSize)) continue;
      if (grid.overlapsAny(box)) continue;
    }
    grid.add(box);
    visibleIds.add(id);
  }
  return visibleIds;
}
