import type { PDFDocumentProxy } from "pdfjs-dist";
import { classifyPdfjsError, PdfOpenError } from "./pdfOpenErrors";

/**
 * The legacy build: the modern one calls Map.prototype.getOrInsertComputed,
 * which current iOS Safari lacks.
 */
export type PdfjsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function importPdfjs(): Promise<PdfjsModule> {
  try {
    const [pdfjs, worker] = await Promise.all([
      import("pdfjs-dist/legacy/build/pdf.mjs"),
      import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  } catch (error) {
    throw new PdfOpenError("renderer-unavailable", { cause: error });
  }
}

/** Loads pdfjs once. A failed load clears the memo so the next call retries. */
export function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = importPdfjs().catch((error: unknown) => {
      pdfjsPromise = null;
      throw error;
    });
  }
  return pdfjsPromise;
}

/**
 * The folder vite.config.ts (publishPdfjsRuntimeData) serves one pdfjs-dist
 * data folder at. The version in the path is the loaded pdfjs's own, so it
 * always names the files copied from the same installed package. Absolute,
 * because the pdfjs worker resolves these URLs against its own script URL.
 */
function pdfjsDataUrl(pdfjs: PdfjsModule, folder: string): string {
  return new URL(
    `${import.meta.env.BASE_URL}pdfjs/${pdfjs.version}/${folder}/`,
    document.baseURI,
  ).href;
}

export async function openPdfjsDocument(
  bytes: Uint8Array,
): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  // pdfjs transfers the buffer to its worker and detaches it, so it gets a copy.
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    verbosity: pdfjs.VerbosityLevel.ERRORS,
    enableXfa: false,
    // CCITT fax and JBIG2 scans, JPEG 2000 images and ICC colour decode
    // through these wasm files. Without them a scanned page renders blank.
    // pdfjs fetches inside its worker only when the wasm, cmap and standard
    // font URLs are all set, and its ICC colour support needs that worker
    // fetch, so the four URLs travel together.
    wasmUrl: pdfjsDataUrl(pdfjs, "wasm"),
    cMapUrl: pdfjsDataUrl(pdfjs, "cmaps"),
    cMapPacked: true,
    standardFontDataUrl: pdfjsDataUrl(pdfjs, "standard_fonts"),
    iccUrl: pdfjsDataUrl(pdfjs, "iccs"),
  });
  try {
    return await loadingTask.promise;
  } catch (error) {
    loadingTask.destroy().catch(() => undefined);
    throw new PdfOpenError(classifyPdfjsError(error), { cause: error });
  }
}

/**
 * Frees the document and its worker. pdfjs 6 dropped
 * `PDFDocumentProxy.destroy()`, so the close goes through its loading task.
 */
export function closePdfjsDocument(document: PDFDocumentProxy): void {
  document.loadingTask.destroy().catch(() => undefined);
}
