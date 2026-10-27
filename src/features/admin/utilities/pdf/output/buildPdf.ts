import { degrees, PDFDocument } from "pdf-lib";
import type { PDFPage } from "pdf-lib";
import type { ZipEntry } from "./buildZip";
import { PdfBuildError } from "./pdfBuildError";
import { dropUnreachableObjects, pruneUnusedResources } from "./pdfPrune";
import { sanitizeForPageCopy } from "./pdfSanitize";

/** One page of the output, in grid order. The editor's page items satisfy it. */
export interface OutputPage {
  readonly fileId: string;
  readonly sourceIndex: number;
  readonly rotation: number;
}

export type PdfLibSourceLookup = (fileId: string) => PDFDocument;

const QUARTER_TURNS = [0, 90, 180, 270] as const;

export function normalizeQuarterTurn(angle: number): 0 | 90 | 180 | 270 {
  if (!Number.isFinite(angle)) return 0;
  const quarterTurns = Math.round(angle / 90);
  return QUARTER_TURNS[((quarterTurns % 4) + 4) % 4] ?? 0;
}

interface PendingCopy {
  readonly gridPosition: number;
  readonly sourceIndex: number;
}

/**
 * The copies one source needs, grouped into rounds. A page used twice goes
 * into a second round, since one copier hands back the same page object for
 * a repeated index.
 */
function copyRoundsFor(
  pages: readonly OutputPage[],
  fileId: string,
  pageCount: number,
): PendingCopy[][] {
  const rounds: PendingCopy[][] = [];
  const timesSeen = new Map<number, number>();
  pages.forEach((page, gridPosition) => {
    if (page.fileId !== fileId) return;
    const { sourceIndex } = page;
    const isInRange =
      Number.isInteger(sourceIndex) &&
      sourceIndex >= 0 &&
      sourceIndex < pageCount;
    if (!isInRange) throw new PdfBuildError("pdf");
    const round = timesSeen.get(sourceIndex) ?? 0;
    timesSeen.set(sourceIndex, round + 1);
    const roundCopies = rounds[round] ?? [];
    roundCopies.push({ gridPosition, sourceIndex });
    rounds[round] = roundCopies;
  });
  return rounds;
}

async function copyAllPages(
  output: PDFDocument,
  pages: readonly OutputPage[],
  getSource: PdfLibSourceLookup,
): Promise<PDFPage[]> {
  const copiedByGridPosition: PDFPage[] = [];
  const fileIds = [...new Set(pages.map((page) => page.fileId))];
  for (const fileId of fileIds) {
    const source = getSource(fileId);
    sanitizeForPageCopy(source);
    const rounds = copyRoundsFor(pages, fileId, source.getPageCount());
    for (const roundCopies of rounds) {
      // One copyPages call per round, so shared fonts and images are copied once.
      const copied = await output.copyPages(
        source,
        roundCopies.map((pendingCopy) => pendingCopy.sourceIndex),
      );
      roundCopies.forEach((pendingCopy, copyPosition) => {
        const copiedPage = copied[copyPosition];
        if (!copiedPage) throw new PdfBuildError("pdf");
        copiedByGridPosition[pendingCopy.gridPosition] = copiedPage;
      });
    }
  }
  return copiedByGridPosition;
}

/**
 * Builds one PDF from the pages in grid order. Removed pages leave the file
 * entirely: sources are sanitised so kept pages cannot pull them in, unused
 * shared resources are pruned and unreachable objects are deleted.
 */
export async function buildPdf(
  pages: readonly OutputPage[],
  getSource: PdfLibSourceLookup,
): Promise<Uint8Array> {
  try {
    if (pages.length === 0) throw new PdfBuildError("pdf");
    const output = await PDFDocument.create();
    const copiedByGridPosition = await copyAllPages(output, pages, getSource);
    pages.forEach((page, gridPosition) => {
      const copiedPage = copiedByGridPosition[gridPosition];
      if (!copiedPage) throw new PdfBuildError("pdf");
      const turnedAngle = copiedPage.getRotation().angle + page.rotation;
      copiedPage.setRotation(degrees(normalizeQuarterTurn(turnedAngle)));
      output.addPage(copiedPage);
    });
    // copyPages copied every object a shared bundle holds and save() writes
    // the whole context, so unreachable objects must be deleted outright.
    pruneUnusedResources(output);
    dropUnreachableObjects(output);
    return await output.save({ addDefaultPage: false });
  } catch (cause) {
    if (cause instanceof PdfBuildError) throw cause;
    throw new PdfBuildError("pdf", { cause });
  }
}

/** One PDF per chunk, named by position. Built one at a time to bound memory. */
export async function buildPdfSet(
  chunks: readonly (readonly OutputPage[])[],
  getSource: PdfLibSourceLookup,
  fileNames: readonly string[],
): Promise<ZipEntry[]> {
  if (chunks.length !== fileNames.length) throw new PdfBuildError("pdf");
  const entries: ZipEntry[] = [];
  for (const [chunkIndex, chunk] of chunks.entries()) {
    const fileName = fileNames[chunkIndex];
    if (fileName === undefined) throw new PdfBuildError("pdf");
    entries.push({ fileName, bytes: await buildPdf(chunk, getSource) });
  }
  return entries;
}
