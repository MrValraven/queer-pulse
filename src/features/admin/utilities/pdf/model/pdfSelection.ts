import type { PageItem } from "./pdfEditModel";

export interface PageSelection {
  readonly selectedIds: ReadonlySet<string>;
  readonly anchorId: string | null;
}

export const EMPTY_SELECTION: PageSelection = {
  selectedIds: new Set(),
  anchorId: null,
};

export function togglePageSelection(
  selection: PageSelection,
  pageId: string,
): PageSelection {
  const selectedIds = new Set(selection.selectedIds);
  if (selectedIds.has(pageId)) selectedIds.delete(pageId);
  else selectedIds.add(pageId);
  return { selectedIds, anchorId: pageId };
}

export function selectPageRange(
  selection: PageSelection,
  pages: readonly PageItem[],
  pageId: string,
): PageSelection {
  const anchorIndex = pages.findIndex((page) => page.id === selection.anchorId);
  const targetIndex = pages.findIndex((page) => page.id === pageId);
  if (targetIndex === -1) return selection;
  if (selection.anchorId === null || anchorIndex === -1) {
    return togglePageSelection(selection, pageId);
  }
  const firstIndex = Math.min(anchorIndex, targetIndex);
  const lastIndex = Math.max(anchorIndex, targetIndex);
  const selectedIds = new Set(selection.selectedIds);
  pages
    .slice(firstIndex, lastIndex + 1)
    .forEach((page) => selectedIds.add(page.id));
  return { selectedIds, anchorId: selection.anchorId };
}

export function selectAllPages(pages: readonly PageItem[]): PageSelection {
  return {
    selectedIds: new Set(pages.map((page) => page.id)),
    anchorId: pages[0]?.id ?? null,
  };
}

export function pruneSelection(
  selection: PageSelection,
  pages: readonly PageItem[],
): PageSelection {
  const presentIds = new Set(pages.map((page) => page.id));
  const keptIds = [...selection.selectedIds].filter((pageId) =>
    presentIds.has(pageId),
  );
  const isAnchorKept =
    selection.anchorId === null || presentIds.has(selection.anchorId);
  if (keptIds.length === selection.selectedIds.size && isAnchorKept)
    return selection;
  return {
    selectedIds: new Set(keptIds),
    anchorId: isAnchorKept ? selection.anchorId : null,
  };
}

export function isWholeGridSelected(
  selection: PageSelection,
  pages: readonly PageItem[],
): boolean {
  return (
    pages.length > 0 &&
    pages.every((page) => selection.selectedIds.has(page.id))
  );
}

export type GridFocusKey =
  "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

export function nextGridFocusIndex(
  index: number,
  key: GridFocusKey,
  columnCount: number,
  pageCount: number,
): number {
  if (pageCount < 1) return 0;
  const columns = Math.max(1, columnCount);
  const lastIndex = pageCount - 1;
  switch (key) {
    case "ArrowLeft":
      return Math.max(0, index - 1);
    case "ArrowRight":
      return Math.min(lastIndex, index + 1);
    case "ArrowUp":
      return index - columns >= 0 ? index - columns : index;
    case "ArrowDown": {
      const hasRowBelow =
        Math.floor(index / columns) < Math.floor(lastIndex / columns);
      return hasRowBelow ? Math.min(lastIndex, index + columns) : index;
    }
    case "Home":
      return 0;
    case "End":
      return lastIndex;
  }
}
