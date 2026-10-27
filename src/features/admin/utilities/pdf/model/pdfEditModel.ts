export type QuarterTurn = 0 | 90 | 180 | 270;
export type RotationDirection = "left" | "right";
export type NudgeDirection = -1 | 1;

export interface PageItem {
  readonly id: string;
  readonly fileId: string;
  readonly sourceIndex: number;
  readonly rotation: QuarterTurn;
  readonly hasCutAfter: boolean;
}

export interface OpenedFileInfo {
  readonly id: string;
  readonly name: string;
  readonly pageCount: number;
  readonly toneIndex: number;
  readonly isSigned: boolean;
  readonly isLarge: boolean;
}

export const FILE_TONE_COUNT = 6;

export function pageIdFor(fileId: string, sourceIndex: number): string {
  return `${fileId}:${sourceIndex}`;
}

export function appendFilePages(
  pages: readonly PageItem[],
  fileId: string,
  pageCount: number,
): readonly PageItem[] {
  if (pageCount < 1) return pages;
  const added: PageItem[] = [];
  for (let sourceIndex = 0; sourceIndex < pageCount; sourceIndex += 1) {
    added.push({
      id: pageIdFor(fileId, sourceIndex),
      fileId,
      sourceIndex,
      rotation: 0,
      hasCutAfter: false,
    });
  }
  return [...pages, ...added];
}

export function removePages(
  pages: readonly PageItem[],
  pageIds: ReadonlySet<string>,
): readonly PageItem[] {
  const kept = pages.filter((page) => !pageIds.has(page.id));
  if (kept.length === pages.length || kept.length === 0) return pages;
  return kept;
}

function turnedBy(
  rotation: QuarterTurn,
  direction: RotationDirection,
): QuarterTurn {
  const step = direction === "right" ? 90 : 270;
  return ((rotation + step) % 360) as QuarterTurn;
}

export function rotatePages(
  pages: readonly PageItem[],
  pageIds: ReadonlySet<string>,
  direction: RotationDirection,
): readonly PageItem[] {
  if (!pages.some((page) => pageIds.has(page.id))) return pages;
  return pages.map((page) =>
    pageIds.has(page.id)
      ? { ...page, rotation: turnedBy(page.rotation, direction) }
      : page,
  );
}

export function movePage(
  pages: readonly PageItem[],
  pageId: string,
  toIndex: number,
): readonly PageItem[] {
  const fromIndex = pages.findIndex((page) => page.id === pageId);
  if (fromIndex === -1) return pages;
  const targetIndex = Math.max(
    0,
    Math.min(pages.length - 1, Math.trunc(toIndex)),
  );
  if (targetIndex === fromIndex) return pages;
  const reordered = [...pages];
  const [moved] = reordered.splice(fromIndex, 1);
  if (!moved) return pages;
  reordered.splice(targetIndex, 0, moved);
  return reordered;
}

export function nudgePages(
  pages: readonly PageItem[],
  pageIds: ReadonlySet<string>,
  direction: NudgeDirection,
): readonly PageItem[] {
  const reordered = [...pages];
  let hasSwapped = false;
  const swapIfBlockEdge = (index: number, neighbourIndex: number) => {
    const page = reordered[index];
    const neighbour = reordered[neighbourIndex];
    if (!page || !neighbour) return;
    if (pageIds.has(page.id) && !pageIds.has(neighbour.id)) {
      reordered[index] = neighbour;
      reordered[neighbourIndex] = page;
      hasSwapped = true;
    }
  };
  if (direction === -1) {
    for (let index = 1; index < reordered.length; index += 1)
      swapIfBlockEdge(index, index - 1);
  } else {
    for (let index = reordered.length - 2; index >= 0; index -= 1) {
      swapIfBlockEdge(index, index + 1);
    }
  }
  return hasSwapped ? reordered : pages;
}

export function toggleCut(
  pages: readonly PageItem[],
  pageId: string,
): readonly PageItem[] {
  const index = pages.findIndex((page) => page.id === pageId);
  if (index === -1 || index === pages.length - 1) return pages;
  return pages.map((page, pageIndex) =>
    pageIndex === index ? { ...page, hasCutAfter: !page.hasCutAfter } : page,
  );
}

export function hasEffectiveCuts(pages: readonly PageItem[]): boolean {
  return pages.some(
    (page, index) => page.hasCutAfter && index < pages.length - 1,
  );
}

export function splitIntoChunks(pages: readonly PageItem[]): PageItem[][] {
  const chunks: PageItem[][] = [];
  let current: PageItem[] = [];
  pages.forEach((page, index) => {
    current.push(page);
    const isLastPage = index === pages.length - 1;
    if (isLastPage || page.hasCutAfter) {
      chunks.push(current);
      current = [];
    }
  });
  return chunks;
}

export function everyPageChunks(pages: readonly PageItem[]): PageItem[][] {
  return pages.map((page) => [page]);
}
